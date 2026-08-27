<script setup lang="ts">
// PALCO — malha 2D de 12 colunas × linhas da malha, com posicionamento livre.
// O ímã não é código à parte: ele é a própria unidade da linha (8px ligado, 1px
// desligado). Por isso posicionar continua sendo grid, e o responsivo sobrevive.
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import BlockRenderer from './BlockRenderer.vue'
import {
  MAGNET_UNIT, ROW_UNIT, clamp, convert, gridFor, resolvePosition,
  type Breakpoint, type LayoutBlock,
} from './types'

const props = defineProps<{
  blocks: LayoutBlock[]
  breakpoint: Breakpoint
  selected: string | null
  /** Quadriculado uniforme no passo do ímã (o modo "Grid" do Figma). */
  showGrid: boolean
  /** Colunas, gutter e margem (o modo "Columns" do Figma). */
  showColumns: boolean
  magnet: boolean
  /** Altura fixa do palco nesta escala; null = cresce com o conteúdo. */
  canvasHeight: number | null
}>()

const emit = defineEmits<{
  dropPiece: [key: string, col: number, row: number]
  moveTo: [id: string, col: number, row: number]
  resize: [id: string, span: number]
  resizeLeft: [id: string, col: number, span: number]
  select: [id: string | null]
  remove: [id: string]
}>()

/** O ímã arredonda o que se GRAVA; nunca reinterpreta o que já está gravado. */
const snap = (v: number) => (props.magnet ? Math.round(v / MAGNET_UNIT) * MAGNET_UNIT : Math.round(v))
/** Grade da escala atual — colunas, gutter e margem saem do DS. */
const grid = computed(() => gridFor(props.breakpoint))
const gridEl = ref<HTMLElement | null>(null)

/** Altura de cada bloco em linhas da malha — medida, nunca guardada no JSON. */
const rowSpans = ref<Record<string, number>>({})
const observer = new ResizeObserver((entries) => {
  for (const e of entries) {
    const id = (e.target as HTMLElement).dataset.measure
    if (id) rowSpans.value[id] = Math.max(1, Math.ceil(e.contentRect.height / ROW_UNIT))
  }
})
onBeforeUnmount(() => observer.disconnect())

function measure(el: Element | null) {
  if (el) observer.observe(el)
}

/** Ordem de leitura — é ela que rege o empilhamento nas escalas herdadas. */
const ordered = computed(() =>
  [...props.blocks].sort((a, b) => {
    const A = resolvePosition(a, props.breakpoint).pos
    const B = resolvePosition(b, props.breakpoint).pos
    return A.row - B.row || A.col - B.col
  }),
)

function styleFor(block: LayoutBlock) {
  const { pos, ownedBy } = resolvePosition(block, props.breakpoint)
  // Posição gravada numa grade pode estar sendo lida noutra (12 col → 4 col):
  // converter é o que mantém a proporção em vez de estourar a grade. A LINHA
  // não converte — é ela que mantém o elemento no mesmo lugar entre escalas.
  const p = convert(pos, gridFor(ownedBy).columns, grid.value.columns)
  const rows = rowSpans.value[block.id] ?? 1
  return { gridColumn: `${p.col} / span ${p.span}`, gridRow: `${p.row} / span ${rows}` }
}

/** Marca visual de sobreposição — permitida de propósito, mas nunca silenciosa. */
const overlapping = computed(() => {
  const out = new Set<string>()
  const boxes = props.blocks.map((b) => {
    const { pos, ownedBy } = resolvePosition(b, props.breakpoint)
    const p = convert(pos, gridFor(ownedBy).columns, grid.value.columns)
    return { id: b.id, x1: p.col, x2: p.col + p.span, y1: p.row, y2: p.row + (rowSpans.value[b.id] ?? 1) }
  })
  for (let i = 0; i < boxes.length; i++)
    for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i], b = boxes[j]
      if (a.x1 < b.x2 && b.x1 < a.x2 && a.y1 < b.y2 && b.y1 < a.y2) { out.add(a.id); out.add(b.id) }
    }
  return out
})

// ── Arrastar ────────────────────────────────────────────────────────────────
const ghost = ref<{ col: number; row: number; span: number } | null>(null)

/**
 * Converte a posição do cursor em célula da malha. Duas coisas que precisam estar
 * certas ou o bloco "pula": o retângulo do grid INCLUI o padding (a linha 1 começa
 * depois dele), e cada coluna mede (largura útil - gutters) / colunas.
 */
function cellFromPointer(e: DragEvent) {
  const r = gridEl.value!.getBoundingClientRect()
  const { columns, gutter, margin } = grid.value
  const usable = r.width - margin * 2
  const colWidth = (usable - gutter * (columns - 1)) / columns
  const x = e.clientX - r.left - margin
  const y = e.clientY - r.top - margin
  const col = clamp(Math.floor(x / (colWidth + gutter)) + 1, 1, columns)
  const row = Math.max(1, snap(y) + 1)
  return { col, row }
}

const dragSpan = ref(6)
/**
 * Onde a mão pegou o bloco, em células. Sem isso o bloco salta para debaixo do
 * cursor a cada arrasto, em vez de acompanhar o ponto que você segurou.
 */
const grabOffset = ref({ col: 0, row: 0 })

function onDragOver(e: DragEvent) {
  e.preventDefault()
  // Sem dropEffect explícito o browser mantém o cursor de seta (ou o de "não
  // solte aqui"). É ele que troca o ponteiro pelo ícone de copiar/mover.
  if (e.dataTransfer) {
    const vindoDaBiblioteca = e.dataTransfer.types.some((t) => t.startsWith('application/x-nacional-span-'))
    e.dataTransfer.dropEffect = vindoDaBiblioteca ? 'copy' : 'move'
  }
  const cell = cellFromPointer(e)
  const span = dragSpan.value
  ghost.value = {
    col: clamp(cell.col - grabOffset.value.col, 1, grid.value.columns - span + 1),
    row: Math.max(1, cell.row - grabOffset.value.row),
    span,
  }
}

/** Solto em qualquer lugar, inclusive fora do palco: o cursor volta ao normal. */
function onDragEnd() {
  document.body.classList.remove('arrastando')
  ghost.value = null
}

function onDrop(e: DragEvent) {
  e.preventDefault()
  // Ler a célula ANTES de limpar: onDragEnd zera o ghost, e é ele que carrega
  // a posição escolhida.
  const cell = ghost.value
  onDragEnd()
  if (!cell) return
  const pieceKey = e.dataTransfer?.getData('application/x-nacional-piece')
  if (pieceKey) return emit('dropPiece', pieceKey, cell.col, cell.row)
  const moveId = e.dataTransfer?.getData('application/x-nacional-move')
  if (moveId) emit('moveTo', moveId, cell.col, cell.row)
}

function onBlockDragStart(e: DragEvent, block: LayoutBlock) {
  e.dataTransfer?.setData('application/x-nacional-move', block.id)
  document.body.classList.add('arrastando')
  const { pos, ownedBy } = resolvePosition(block, props.breakpoint)
  const here = convert(pos, gridFor(ownedBy).columns, grid.value.columns)
  dragSpan.value = here.span
  const cell = cellFromPointer(e)
  grabOffset.value = { col: cell.col - here.col, row: cell.row - here.row }
  if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move'
}

// A biblioteca informa o span da peça no dragstart, para o fantasma nascer certo.
function onDragEnter(e: DragEvent) {
  const declared = e.dataTransfer?.types.find((t) => t.startsWith('application/x-nacional-span-'))
  if (declared) {
    dragSpan.value = Number(declared.replace('application/x-nacional-span-', '')) || 6
    grabOffset.value = { col: 0, row: 0 }
  }
}

// ── Redimensionar ───────────────────────────────────────────────────────────
/** Colunas ocupadas durante um arrasto de redimensionamento — vira badge na tela. */
const resizing = ref<{ id: string; span: number } | null>(null)

function startResize(e: PointerEvent, block: LayoutBlock, edge: 'left' | 'right' = 'right') {
  e.preventDefault()
  e.stopPropagation()
  const { pos, ownedBy } = resolvePosition(block, props.breakpoint)
  const here = convert(pos, gridFor(ownedBy).columns, grid.value.columns)
  const colWidth = (gridEl.value?.getBoundingClientRect().width ?? props.breakpoint) / grid.value.columns
  const startX = e.clientX
  const startSpan = here.span

  const startCol = here.col
  resizing.value = { id: block.id, span: startSpan }

  const onMove = (ev: PointerEvent) => {
    const delta = Math.round((ev.clientX - startX) / colWidth)
    if (edge === 'right') {
      const next = clamp(startSpan + delta, 1, grid.value.columns - startCol + 1)
      resizing.value = { id: block.id, span: next }
      if (next !== here.span) emit('resize', block.id, next)
    } else {
      // Puxar pela esquerda: a coluna inicial anda e o span compensa, então a
      // borda direita fica parada — que é o que a mão espera.
      const col = clamp(startCol + delta, 1, startCol + startSpan - 1)
      const next = startCol + startSpan - col
      resizing.value = { id: block.id, span: next }
      if (col !== here.col || next !== here.span) emit('resizeLeft', block.id, col, next)
    }
  }
  const onUp = () => {
    resizing.value = null
    window.removeEventListener('pointermove', onMove)
    window.removeEventListener('pointerup', onUp)
  }
  window.addEventListener('pointermove', onMove)
  window.addEventListener('pointerup', onUp)
}

/** Colunas acesas na régua: o que está sob o cursor, ou o bloco selecionado. */
const litColumns = computed(() => {
  if (ghost.value) return { from: ghost.value.col, to: ghost.value.col + ghost.value.span - 1 }
  const block = props.blocks.find((b) => b.id === props.selected)
  if (!block) return null
  const { pos, ownedBy } = resolvePosition(block, props.breakpoint)
  const p = convert(pos, gridFor(ownedBy).columns, grid.value.columns)
  return { from: p.col, to: p.col + p.span - 1 }
})

const positioned = computed(() => true)

/** Alinhamento do componente dentro das colunas que o bloco ocupa. */
function alignOf(block: LayoutBlock) {
  return resolvePosition(block, props.breakpoint).pos.align ?? 'stretch'
}
function justifyFor(block: LayoutBlock) {
  const a = alignOf(block)
  return a === 'center' ? 'center' : a === 'end' ? 'flex-end' : 'flex-start'
}
</script>

<template>
  <div class="min-w-0 flex-1 overflow-auto bg-muted p-8" @click="emit('select', null)">
    <div class="mx-auto w-max" :style="{ width: breakpoint + 'px' }">
      <!-- Régua: 12 colunas numeradas, com o intervalo ocupado aceso. -->
      <div
        class="mb-1 grid text-center text-[10px] tabular-nums"
        :style="{
          gridTemplateColumns: `repeat(${grid.columns}, minmax(0, 1fr))`,
          columnGap: grid.gutter + 'px',
          paddingInline: grid.margin + 'px',
        }"
      >
        <span
          v-for="c in grid.columns"
          :key="c"
          :class="litColumns && c >= litColumns.from && c <= litColumns.to ? 'text-primary' : 'text-dimmed'"
        >{{ c }}</span>
      </div>

      <div class="bg-default shadow-lg ring-1 ring-default transition-[width] duration-200">
        <div
          ref="gridEl"
          class="relative grid content-start items-start"
          :style="{
            minHeight: (canvasHeight ?? 520) + 'px',
            height: canvasHeight ? canvasHeight + 'px' : undefined,
            gridTemplateColumns: `repeat(${grid.columns}, minmax(0, 1fr))`,
            gridAutoRows: ROW_UNIT + 'px',
            columnGap: grid.gutter + 'px',
            rowGap: positioned ? 0 : grid.gutter + 'px',
            padding: grid.margin + 'px',
          }"
          @dragenter="onDragEnter"
          @dragover="onDragOver"
          @dragleave="ghost = null"
          @drop="onDrop"
        >
          <!-- MALHA — ordem importa: as horizontais vão ATRÁS, as linhas de
               coluna na frente. Desenhar as horizontais por último cobria as
               verticais e a grade sumia. Tudo em currentColor: segue a marca. -->
          <template v-if="showGrid">
            <!-- Quadriculado uniforme, como o modo "Grid" do Figma: linhas nos
                 DOIS eixos no passo do ímã, formando quadrados de 8px. É a malha
                 que mostra onde o elemento vai encostar. -->
            <div
              class="pointer-events-none absolute text-primary/15"
              :style="{
                inset: grid.margin + 'px',
                backgroundImage: [
                  'repeating-linear-gradient(to bottom, currentColor 0 1px, transparent 1px ' + MAGNET_UNIT + 'px)',
                  'repeating-linear-gradient(to right, currentColor 0 1px, transparent 1px ' + MAGNET_UNIT + 'px)',
                ].join(', '),
              }"
            />
            <!-- Reforço a cada quatro quadrados (32px), nos dois eixos. -->
            <div
              class="pointer-events-none absolute text-primary/35"
              :style="{
                inset: grid.margin + 'px',
                backgroundImage: [
                  'repeating-linear-gradient(to bottom, currentColor 0 1px, transparent 1px ' + (MAGNET_UNIT * 4) + 'px)',
                  'repeating-linear-gradient(to right, currentColor 0 1px, transparent 1px ' + (MAGNET_UNIT * 4) + 'px)',
                ].join(', '),
              }"
            />

            </template>

            <template v-if="showColumns">
            <div
              class="pointer-events-none absolute grid"
              :style="{
                inset: grid.margin + 'px',
                gridTemplateColumns: `repeat(${grid.columns}, minmax(0, 1fr))`,
                columnGap: grid.gutter + 'px',
              }"
            >
              <div
                v-for="c in grid.columns"
                :key="c"
                class="border-x-2 border-primary/70 bg-primary/8"
              />
            </div>
          </template>

          <!-- Fantasma do destino: onde o bloco vai cair, antes de soltar. -->
          <div
            v-if="ghost && positioned"
            class="pointer-events-none z-20 rounded-md border-2 border-dashed border-primary bg-primary/10"
            :style="{ gridColumn: `${ghost.col} / span ${ghost.span}`, gridRow: `${ghost.row} / span 4` }"
          />

          <div
            v-for="block in ordered"
            :key="block.id"
            data-block
            draggable="true"
            class="group relative z-10 cursor-grab active:cursor-grabbing"
            :style="styleFor(block)"
            @dragstart="onBlockDragStart($event, block)"
            @dragend="onDragEnd"
            @click.stop="emit('select', block.id)"
          >
            <div
              :ref="measure"
              :data-measure="block.id"
              class="flex"
              :style="{ justifyContent: justifyFor(block) }"
            >
              <BlockRenderer :block="block" :stretch="alignOf(block) === 'stretch'" />
            </div>

            <div
              class="pointer-events-none absolute inset-0 rounded-md border transition-colors"
              :class="[
                overlapping.has(block.id)
                  ? 'border-solid border-warning'
                  : selected === block.id
                    ? 'border-dashed border-primary/50'
                    : 'border-transparent group-hover:border-default',
              ]"
            />

            <template v-if="positioned">
              <div
                v-for="edge in (['left', 'right'] as const)"
                :key="edge"
                class="absolute top-0 flex h-full w-3 cursor-col-resize items-center justify-center transition-opacity"
                :class="[
                  edge === 'left' ? '-left-1.5' : '-right-1.5',
                  selected === block.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-60',
                ]"
                @pointerdown="startResize($event, block, edge)"
              >
                <div class="h-8 w-1.5 rounded-full bg-primary ring-2 ring-default" />
              </div>

              <!-- Excluir: aparece no hover, no canto de fora do bloco.
                   pointerdown.stop impede que o clique vire início de arrasto. -->
              <button
                class="absolute -right-2 -top-2 grid size-5 place-items-center rounded-full bg-elevated text-muted opacity-0 ring-1 ring-default transition-opacity group-hover:opacity-100 hover:bg-error hover:text-inverted"
                title="Remover bloco"
                @pointerdown.stop
                @click.stop="emit('remove', block.id)"
              >
                <UIcon name="i-lucide-trash-2" class="size-3" />
              </button>

              <span
                v-if="resizing?.id === block.id"
                class="absolute -top-6 left-1/2 -translate-x-1/2 rounded bg-primary px-1.5 py-0.5 text-[10px] font-medium text-inverted"
              >
                {{ resizing.span }} de {{ grid.columns }}
              </span>
            </template>
          </div>

          <p v-if="!blocks.length" class="z-10 col-span-12 row-start-6 text-center text-sm text-muted">
            Arraste uma peça da biblioteca para cá
          </p>
        </div>
      </div>

      <p class="mt-3 text-center text-xs text-muted">
        {{ grid.columns }} colunas · gutter {{ grid.gutter }} · margem {{ grid.margin }} ·
        malha de {{ MAGNET_UNIT }}px<template v-if="magnet"> · ímã ligado</template><template v-else> · ímã desligado (passo de 1px)</template>
      </p>
    </div>
  </div>
</template>
