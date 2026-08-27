<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref, watchEffect } from 'vue'
import Topbar from './builder/Topbar.vue'
import Library from './builder/Library.vue'
import Stage from './builder/Stage.vue'
import DropChoice from './builder/DropChoice.vue'
import Inspector from './builder/Inspector.vue'
import { applyBrand, type BrandId } from './ds/brands'
import { findPiece, type Piece } from './builder/catalog'
import {
  BREAKPOINTS, clamp, convert, gridFor, newId, positionAt,
  type Breakpoint, type CanvasHeights, type LayoutBlock, type Position,
} from './builder/types'

const brand = ref<BrandId>('original')

/**
 * A escala segue a janela por padrão: encolher o Chrome desce de 1440 até 390,
 * como o site real faria. Clicar numa escala trava ali (vira inspeção); o botão
 * Auto devolve o comando para a janela.
 */
const auto = ref(true)
const manualBp = ref<Breakpoint>(1440)
const fitBp = ref<Breakpoint>(1440)
const breakpoint = computed(() => (auto.value ? fitBp.value : manualBp.value))

const stageArea = ref<HTMLElement | null>(null)
let areaObserver: ResizeObserver | null = null

/** Maior escala que cabe na área disponível, descontada a margem do palco. */
function measureArea(width: number) {
  const available = width - 64
  fitBp.value = BREAKPOINTS.find((bp) => bp <= available) ?? 390
}

function setBreakpoint(bp: Breakpoint) {
  auto.value = false
  manualBp.value = bp
}
const blocks = ref<LayoutBlock[]>([])
const selected = ref<string | null>(null)
const showGrid = ref(true)
const showColumns = ref(true)

/** Altura do palco por escala — o equivalente ao frame do Figma. null = automática. */
const canvasHeights = ref<CanvasHeights>({})
const canvasHeight = computed(() => canvasHeights.value[breakpoint.value] ?? null)
function setCanvasHeight(h: number | null) {
  canvasHeights.value = { ...canvasHeights.value, [breakpoint.value]: h }
}
const magnet = ref(true)

watchEffect(() => applyBrand(brand.value))

const pending = ref<{ piece: Piece; col: number; row: number } | null>(null)

function onDropPiece(key: string, col: number, row: number) {
  const piece = findPiece(key)
  if (!piece) return
  if (piece.recipe) return void (pending.value = { piece, col, row })
  insert(piece, 'pure', col, row)
}

function insert(piece: Piece, mode: 'pure' | 'recipe', col: number, row: number) {
  const source = mode === 'recipe' && piece.recipe ? piece.recipe : piece.pure
  // A posição do drop está na grade da escala ATUAL. A base (1440) tem outra
  // grade, então precisa ser convertida — gravar o mesmo objeto nos dois slots
  // punha um span de 6 numa grade de 4 colunas e estourava a malha.
  const here = gridFor(breakpoint.value).columns
  const span = clamp(piece.defaultSpan, 1, here)
  const pos = { col: clamp(col, 1, Math.max(1, here - span + 1)), row, span }

  const block: LayoutBlock = {
    id: newId(),
    piece: piece.key,
    mode,
    props: { ...source.props },
    positions: { 1440: convert(pos, here, gridFor(1440).columns) },
  }
  if (breakpoint.value !== 1440) block.positions[breakpoint.value] = pos
  blocks.value.push(block)
  selected.value = block.id
}

function onChoose(mode: 'pure' | 'recipe') {
  if (pending.value) insert(pending.value.piece, mode, pending.value.col, pending.value.row)
  pending.value = null
}

/**
 * Escrever numa escala cria o override ali — e só ali. As escalas acima ficam
 * intactas; as abaixo herdam o novo valor, a não ser que já tenham o próprio.
 */
function writePosition(id: string, patch: Partial<Position>) {
  const block = blocks.value.find((b) => b.id === id)
  if (!block) return
  // positionAt, não resolvePosition: grava já na grade DESTA escala.
  const { pos } = positionAt(block, breakpoint.value)
  const next = { ...pos, ...patch }
  // Nada entra fora da grade: um col fora de 1..colunas vira trilha implícita no
  // CSS Grid e a malha inteira passa a mentir sobre quantas colunas existem.
  const { columns } = gridFor(breakpoint.value)
  next.span = clamp(Math.round(next.span) || 1, 1, columns)
  next.col = clamp(Math.round(next.col) || 1, 1, columns - next.span + 1)
  next.row = Math.max(1, Math.round(next.row) || 1)
  block.positions[breakpoint.value] = next
}

const onMoveTo = (id: string, col: number, row: number) => writePosition(id, { col, row })
const onResize = (id: string, span: number) => writePosition(id, { span })
const onResizeLeft = (id: string, col: number, span: number) => writePosition(id, { col, span })

/** Estado do bloco selecionado na escala atual: ajustado aqui ou herdado de onde. */
const selectionState = computed(() => {
  const block = blocks.value.find((b) => b.id === selected.value)
  if (!block) return null
  const { pos, ownedBy } = positionAt(block, breakpoint.value)
  return { block, pos, ownedBy, own: ownedBy === breakpoint.value }
})

function setProp(key: string, value: unknown) {
  const block = blocks.value.find((b) => b.id === selected.value)
  if (!block) return
  if (value === '' || value === undefined) delete block.props[key]
  else block.props[key] = value
}

function remove(id: string) {
  blocks.value = blocks.value.filter((b) => b.id !== id)
  if (selected.value === id) selected.value = null
}

const removeSelected = () => selected.value && remove(selected.value)

/** Voltar a herdar: apaga o override desta escala e deixa a cascata resolver. */
function resetToInherited() {
  const state = selectionState.value
  if (!state || breakpoint.value === 1440) return
  delete state.block.positions[breakpoint.value]
}

function onKey(e: KeyboardEvent) {
  const typing = (e.target as HTMLElement)?.tagName === 'INPUT'
  if (typing) return
  if (e.key === 'g' || e.key === 'G') showGrid.value = !showGrid.value
  if (e.key === 'c' || e.key === 'C') showColumns.value = !showColumns.value
  if (e.key === 'm' || e.key === 'M') magnet.value = !magnet.value
  if ((e.key === 'Delete' || e.key === 'Backspace') && selected.value) {
    removeSelected()
    return
  }

  const state = selectionState.value
  if (!state) return
  const { pos } = positionAt(state.block, breakpoint.value)
  const cols = gridFor(breakpoint.value).columns
  const step = e.shiftKey ? 1 : 1

  if (e.key === 'ArrowRight') {
    e.preventDefault()
    if (e.shiftKey) writePosition(state.block.id, { span: Math.min(pos.span + step, cols - pos.col + 1) })
    else writePosition(state.block.id, { col: Math.min(pos.col + step, cols - pos.span + 1) })
  }
  if (e.key === 'ArrowLeft') {
    e.preventDefault()
    if (e.shiftKey) writePosition(state.block.id, { span: Math.max(pos.span - step, 1) })
    else writePosition(state.block.id, { col: Math.max(pos.col - step, 1) })
  }
  if (e.key === 'ArrowUp') { e.preventDefault(); writePosition(state.block.id, { row: Math.max(pos.row - 1, 1) }) }
  if (e.key === 'ArrowDown') { e.preventDefault(); writePosition(state.block.id, { row: pos.row + 1 }) }
}
onMounted(() => {
  window.addEventListener('keydown', onKey)
  if (stageArea.value) {
    areaObserver = new ResizeObserver(([entry]) => measureArea(entry.contentRect.width))
    areaObserver.observe(stageArea.value)
  }
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
  areaObserver?.disconnect()
})
</script>

<template>
  <UApp>
    <div class="flex h-full flex-col bg-default text-default">
    <Topbar
      v-model:brand="brand"
      v-model:show-grid="showGrid"
      v-model:show-columns="showColumns"
      v-model:magnet="magnet"
      :breakpoint="breakpoint"
      :auto="auto"
      :canvas-height="canvasHeight"
      @update:breakpoint="setBreakpoint"
      @update:auto="auto = $event"
      @update:canvas-height="setCanvasHeight"
    />

    <!-- Faixa de herança: só aparece quando há seleção fora da escala base. -->
    <div
      v-if="selectionState && breakpoint !== 1440"
      class="flex items-center gap-3 border-b border-default bg-elevated px-4 py-1.5 text-xs"
    >
      <template v-if="selectionState.own">
        <span class="text-primary">Ajustado nesta escala ({{ breakpoint }})</span>
        <button class="text-muted underline hover:text-highlighted" @click="resetToInherited">
          voltar a herdar
        </button>
      </template>
      <span v-else class="text-muted">
        Herdado de {{ selectionState.ownedBy }} — mova ou redimensione para ajustar só em {{ breakpoint }}
      </span>
    </div>

    <div class="flex min-h-0 flex-1">
      <Library />
      <div ref="stageArea" class="flex min-h-0 min-w-0 flex-1">
      <Stage
        :blocks="blocks"
        :breakpoint="breakpoint"
        :selected="selected"
        :show-grid="showGrid"
        :show-columns="showColumns"
        :magnet="magnet"
        :canvas-height="canvasHeight"
        @drop-piece="onDropPiece"
        @move-to="onMoveTo"
        @resize="onResize"
        @resize-left="onResizeLeft"
        @select="selected = $event"
        @remove="remove"
      />
      </div>
      <Inspector
        :block="selectionState?.block ?? null"
        :pos="selectionState?.pos ?? null"
        :owned-by="selectionState?.ownedBy ?? null"
        :breakpoint="breakpoint"
        :positioned="true"
        @patch="writePosition(selected!, $event)"
        @prop="setProp"
        @reset="resetToInherited"
        @remove="removeSelected"
      />
    </div>

    <DropChoice v-if="pending" :piece="pending.piece" @choose="onChoose" @cancel="pending = null" />
    </div>
  </UApp>
</template>
