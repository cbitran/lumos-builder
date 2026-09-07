<script setup lang="ts">
/**
 * PALCO MODULAR — a grade 2D do `Builder Modular v2`.
 *
 * Por que 2D (x/y/w/h) e não uma pilha de blocos: foi assim que o Celio desenhou
 * o Modular v2, e é o que permite uma `secao` ABRIGAR outras peças em vez de
 * empurrá-las. A regra de container inteira mora em `colide()` — aqui só a
 * consultamos, nunca a reescrevemos.
 *
 * O QUE VEIO DO PROTÓTIPO: a grade em células, o ímã, o fantasma do destino, as
 * 8 alças, a marca de sobreposição e a separação editar/visualizar (`preview`).
 * O QUE NÃO VEIO: os `rgb(...)`, as sombras e os tamanhos literais — cada um
 * deles agora é papel semântico do Design System.
 */
import { computed, ref } from 'vue'
import PecaRenderer from './PecaRenderer.vue'
import { bpDe, clamp, colide, filhosDaSecao, type BreakpointW, type Modo, type Peca } from './modular'
import { acharTipo } from './modular-catalog'

const props = defineProps<{
  pecas: Peca[]
  largura: number
  linhas: number
  selecionado: string | null
  modo: Modo
  malha: boolean
  guias: boolean
  ima: boolean
}>()

const emit = defineEmits<{
  soltar: [tipo: string, x: number, y: number]
  mover: [id: string, x: number, y: number]
  redimensionar: [id: string, x: number, y: number, w: number, h: number]
  selecionar: [id: string | null]
  remover: [id: string]
}>()

/** Tipo de transferência do arrasto vindo da Biblioteca. É contrato entre os dois. */
const MIME_TIPO = 'application/x-lumos-tipo'
/** Arrasto de uma peça que JÁ está no palco — distinguir os dois evita duplicar no drop. */
const MIME_MOVER = 'application/x-lumos-mover'

const editando = computed(() => props.modo === 'editar')
const bp = computed(() => bpDe(props.largura as BreakpointW))
const cols = computed(() => bp.value.cols)

/**
 * A célula não é um número mágico: sai da própria escala. A largura do palco é a
 * do breakpoint e a altura útil é a dele dividida pelas linhas pedidas — assim
 * trocar 1440 por 390 reencaixa tudo sem constante literal no meio do caminho.
 */
const celulaW = computed(() => props.largura / cols.value)
const celulaH = computed(() => bp.value.h / props.linhas)

const grade = ref<HTMLElement | null>(null)

const tipoDe = (p: Peca) => acharTipo(p.tipo)
const minWDe = (p: Peca) => tipoDe(p)?.minW ?? 1
const minHDe = (p: Peca) => tipoDe(p)?.minH ?? 1

function estiloDa(p: Peca) {
  return { gridColumn: `${p.x + 1} / span ${p.w}`, gridRow: `${p.y + 1} / span ${p.h}` }
}

/**
 * Ordem de pintura: a `secao` vai por baixo das peças que ela abriga, senão o
 * container cobriria o próprio conteúdo e o clique nunca chegaria nos filhos.
 */
const ordenadas = computed(() =>
  [...props.pecas].sort((a, b) => Number(b.tipo === 'secao') - Number(a.tipo === 'secao')),
)

/**
 * Sobreposição indevida. Não é bloqueio — o protótipo permitia solapar de
 * propósito — mas nunca pode ser silenciosa, senão o layout sai torto e ninguém
 * sabe por quê. `colide()` já isenta a seção que contém a peça.
 */
const sobrepostas = computed(() => {
  const fora = new Set<string>()
  const lista = props.pecas
  for (let i = 0; i < lista.length; i++) {
    for (let j = i + 1; j < lista.length; j++) {
      if (colide(lista[i], lista[j])) { fora.add(lista[i].id); fora.add(lista[j].id) }
    }
  }
  return fora
})

// ── Arrastar ────────────────────────────────────────────────────────────────

const fantasma = ref<{ x: number; y: number; w: number; h: number } | null>(null)
/** Onde a mão pegou a peça, em células — sem isto ela salta para debaixo do cursor. */
const pegada = ref({ x: 0, y: 0 })
/** Tamanho do que está sendo arrastado, para o fantasma nascer do tamanho certo. */
const arrasto = ref({ w: 1, h: 1 })

/**
 * O ímã decide o ARREDONDAMENTO, não a unidade: a grade é de células dos dois
 * jeitos. Ligado, a peça pula para a célula mais próxima (encaixa); desligado,
 * ela fica na célula que está debaixo do cursor.
 */
const encaixar = (v: number) => (props.ima ? Math.round(v) : Math.floor(v))

function celulaDoPonteiro(e: DragEvent | PointerEvent) {
  const r = grade.value!.getBoundingClientRect()
  const x = ((e.clientX - r.left) / r.width) * cols.value
  const y = ((e.clientY - r.top) / r.height) * props.linhas
  return { x: encaixar(x), y: encaixar(y) }
}

/**
 * A Biblioteca pode anunciar o tipo já no `dragenter` como um TIPO de
 * transferência (`application/x-lumos-tipo-botao`), porque o VALOR de um
 * dataTransfer só é legível no drop. Se ela não anunciar, o fantasma nasce de
 * uma célula — pequeno, mas honesto — e o tamanho real chega no drop.
 */
function tamanhoAnunciado(e: DragEvent) {
  const marca = Array.from(e.dataTransfer?.types ?? []).find((t) => t.startsWith(`${MIME_TIPO}-`))
  const t = marca && acharTipo(marca.slice(MIME_TIPO.length + 1))
  return t ? { w: t.w, h: t.h } : null
}

function aoEntrar(e: DragEvent) {
  if (!editando.value) return
  const tam = tamanhoAnunciado(e)
  if (tam) { arrasto.value = tam; pegada.value = { x: 0, y: 0 } }
}

function aoSobrevoar(e: DragEvent) {
  if (!editando.value) return
  e.preventDefault()
  if (e.dataTransfer) {
    // Sem dropEffect explícito o cursor fica no ícone de "não solte aqui".
    e.dataTransfer.dropEffect = e.dataTransfer.types.includes(MIME_MOVER) ? 'move' : 'copy'
  }
  const c = celulaDoPonteiro(e)
  const { w, h } = arrasto.value
  fantasma.value = {
    x: clamp(c.x - pegada.value.x, 0, Math.max(0, cols.value - w)),
    y: Math.max(0, c.y - pegada.value.y),
    w,
    h,
  }
}

function aoTerminarArrasto() {
  fantasma.value = null
}

function aoSoltar(e: DragEvent) {
  if (!editando.value) return
  e.preventDefault()
  // Ler o destino ANTES de limpar: é o fantasma que carrega a célula escolhida.
  const destino = fantasma.value
  aoTerminarArrasto()
  if (!destino) return

  const id = e.dataTransfer?.getData(MIME_MOVER)
  if (id) return moverPeca(id, destino.x, destino.y)

  const tipo = e.dataTransfer?.getData(MIME_TIPO)
  if (tipo) emit('soltar', tipo, destino.x, destino.y)
}

/**
 * Mover uma `secao` leva junto tudo que ela abriga. É o que faz o container
 * parecer um container: sem isto, arrastar o painel deixaria o conteúdo para
 * trás e o "dentro" viraria coincidência visual.
 */
function moverPeca(id: string, x: number, y: number) {
  const p = props.pecas.find((q) => q.id === id)
  if (!p) return
  const dx = x - p.x
  const dy = y - p.y
  if (!dx && !dy) return
  // A lista de filhos sai ANTES de mover a seção: quem responde ao evento
  // atualiza a peça na hora, e perguntar depois devolveria quem passou a estar
  // dentro da posição NOVA — arrastando junto peças que nunca estiveram lá.
  const filhos = filhosDaSecao(p, props.pecas)
  emit('mover', id, x, y)
  for (const filho of filhos) {
    emit('mover', filho.id, Math.max(0, filho.x + dx), Math.max(0, filho.y + dy))
  }
}

function aoIniciarArrasto(e: DragEvent, p: Peca) {
  // Uma alça vive DENTRO da peça arrastável: sem esta guarda, puxar a alça
  // dispararia o arrasto do HTML5 junto e a peça mudaria de lugar em vez de
  // mudar de tamanho.
  if (!editando.value || redimensionando.value) return e.preventDefault()
  e.dataTransfer?.setData(MIME_MOVER, p.id)
  if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move'
  arrasto.value = { w: p.w, h: p.h }
  const c = celulaDoPonteiro(e)
  pegada.value = { x: c.x - p.x, y: c.y - p.y }
}

// ── Redimensionar ───────────────────────────────────────────────────────────

/** As 8 alças do protótipo: 4 cantos + 4 meios. */
const ALCAS = ['n', 's', 'l', 'o', 'no', 'ne', 'so', 'se'] as const
type Alca = (typeof ALCAS)[number]

const CURSOR: Record<Alca, string> = {
  n: 'cursor-ns-resize', s: 'cursor-ns-resize',
  l: 'cursor-ew-resize', o: 'cursor-ew-resize',
  no: 'cursor-nwse-resize', se: 'cursor-nwse-resize',
  ne: 'cursor-nesw-resize', so: 'cursor-nesw-resize',
}

/** Posição da alça na moldura, em classes de utilidade — nada de px literal. */
const POSICAO: Record<Alca, string> = {
  n: 'left-1/2 top-0 -translate-x-1/2 -translate-y-1/2',
  s: 'left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2',
  o: 'left-0 top-1/2 -translate-x-1/2 -translate-y-1/2',
  l: 'right-0 top-1/2 translate-x-1/2 -translate-y-1/2',
  no: 'left-0 top-0 -translate-x-1/2 -translate-y-1/2',
  ne: 'right-0 top-0 translate-x-1/2 -translate-y-1/2',
  so: 'left-0 bottom-0 -translate-x-1/2 translate-y-1/2',
  se: 'right-0 bottom-0 translate-x-1/2 translate-y-1/2',
}

const redimensionando = ref<{ id: string; w: number; h: number } | null>(null)

function iniciarRedimensionar(e: PointerEvent, p: Peca, alca: Alca) {
  e.preventDefault()
  e.stopPropagation()
  emit('selecionar', p.id)

  const x0 = e.clientX
  const y0 = e.clientY
  const base = { x: p.x, y: p.y, w: p.w, h: p.h }
  const minW = minWDe(p)
  const minH = minHDe(p)
  redimensionando.value = { id: p.id, w: base.w, h: base.h }

  const mexeu = (ev: PointerEvent) => {
    const dx = encaixar((ev.clientX - x0) / celulaW.value)
    const dy = encaixar((ev.clientY - y0) / celulaH.value)
    let { x, y, w, h } = base

    // Puxar pela borda inicial move o canto E compensa o tamanho, para a borda
    // oposta ficar parada — que é o que a mão espera de uma alça.
    if (alca.includes('l')) w = clamp(base.w + dx, minW, cols.value - base.x)
    if (alca.includes('o')) {
      x = clamp(base.x + dx, 0, base.x + base.w - minW)
      w = base.x + base.w - x
    }
    if (alca.includes('s')) h = clamp(base.h + dy, minH, props.linhas - base.y)
    if (alca.includes('n')) {
      y = clamp(base.y + dy, 0, base.y + base.h - minH)
      h = base.y + base.h - y
    }

    redimensionando.value = { id: p.id, w, h }
    if (x !== p.x || y !== p.y || w !== p.w || h !== p.h) emit('redimensionar', p.id, x, y, w, h)
  }

  const soltou = () => {
    redimensionando.value = null
    window.removeEventListener('pointermove', mexeu)
    window.removeEventListener('pointerup', soltou)
  }
  window.addEventListener('pointermove', mexeu)
  window.addEventListener('pointerup', soltou)
}
</script>

<template>
  <div class="min-w-0 flex-1 overflow-auto bg-muted p-8" @click="emit('selecionar', null)">
    <div class="mx-auto" :style="{ width: largura + 'px' }">
      <!-- Régua das colunas: acende o intervalo ocupado pelo destino ou pela seleção. -->
      <div
        v-if="editando && guias"
        class="mb-1 grid text-center text-xs tabular-nums"
        :style="{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }"
      >
        <span
          v-for="c in cols"
          :key="c"
          :class="fantasma && c > fantasma.x && c <= fantasma.x + fantasma.w ? 'text-primary' : 'text-dimmed'"
        >{{ c }}</span>
      </div>

      <div class="bg-default ring-1 ring-default">
        <div
          ref="grade"
          class="relative grid"
          :style="{
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${linhas}, ${celulaH}px)`,
          }"
          @dragenter="aoEntrar"
          @dragover="aoSobrevoar"
          @dragleave="aoTerminarArrasto"
          @drop="aoSoltar"
        >
          <!-- MALHA — o quadriculado da própria célula, nos dois eixos. Em
               currentColor para seguir a marca ativa em vez de fixar um tom. -->
          <div
            v-if="editando && malha"
            class="pointer-events-none absolute inset-0 text-primary/15"
            :style="{
              backgroundImage: [
                `repeating-linear-gradient(to right, currentColor 0 1px, transparent 1px ${celulaW}px)`,
                `repeating-linear-gradient(to bottom, currentColor 0 1px, transparent 1px ${celulaH}px)`,
              ].join(', '),
            }"
          />

          <!-- GUIAS — as colunas do breakpoint, como o modo "Columns" do Figma. -->
          <div
            v-if="editando && guias"
            class="pointer-events-none absolute inset-0 grid"
            :style="{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }"
          >
            <div v-for="c in cols" :key="c" class="border-x border-primary/40 bg-primary/5" />
          </div>

          <!-- Fantasma: onde a peça VAI cair, antes de soltar. -->
          <div
            v-if="editando && fantasma"
            class="pointer-events-none z-30 rounded-md border-2 border-dashed border-primary bg-primary/10"
            :style="{
              gridColumn: `${fantasma.x + 1} / span ${fantasma.w}`,
              gridRow: `${fantasma.y + 1} / span ${fantasma.h}`,
            }"
          />

          <div
            v-for="p in ordenadas"
            :key="p.id"
            class="group relative min-w-0"
            :class="[
              editando ? 'cursor-grab active:cursor-grabbing' : '',
              p.tipo === 'secao' ? 'z-0' : 'z-10',
            ]"
            :style="estiloDa(p)"
            :draggable="editando && !redimensionando"
            @dragstart="aoIniciarArrasto($event, p)"
            @dragend="aoTerminarArrasto"
          >
            <!-- O componente do DS de verdade. Inerte enquanto se edita: senão o
                 Modal abriria no meio do posicionamento. -->
            <PecaRenderer :peca="p" :inerte="modo === 'editar'" />

            <!-- ESCUDO — intercepta o clique antes que ele chegue ao componente.
                 Sem ele, clicar no gatilho do Modal abre o modal em vez de
                 selecionar a peça, e ela fica impossível de posicionar. -->
            <div
              v-if="editando"
              class="absolute inset-0 z-10"
              @click.stop="emit('selecionar', p.id)"
            />

            <!-- Moldura: estado da peça sem tocar no componente que está dentro. -->
            <div
              v-if="editando"
              class="pointer-events-none absolute inset-0 z-20 rounded-md border"
              :class="[
                sobrepostas.has(p.id)
                  ? 'border-solid border-warning'
                  : selecionado === p.id
                    ? 'border-solid border-primary'
                    : 'border-transparent group-hover:border-default',
              ]"
            />

            <template v-if="editando && selecionado === p.id">
              <div
                v-for="alca in ALCAS"
                :key="alca"
                class="absolute z-30 size-2 rounded-full bg-primary ring-1 ring-default"
                :class="[POSICAO[alca], CURSOR[alca]]"
                @pointerdown="iniciarRedimensionar($event, p, alca)"
                @click.stop
              />

              <!-- Remover: pointerdown.stop para o clique não virar início de arrasto. -->
              <button
                class="absolute -right-2 -top-2 z-30 grid size-5 place-items-center rounded-full bg-elevated text-muted ring-1 ring-default hover:bg-error hover:text-inverted"
                title="Remover peça"
                @pointerdown.stop
                @click.stop="emit('remover', p.id)"
              >
                <UIcon name="i-lucide-trash-2" class="size-3" />
              </button>

              <span
                v-if="redimensionando?.id === p.id"
                class="absolute -top-6 left-1/2 z-30 -translate-x-1/2 rounded bg-primary px-1.5 py-0.5 text-xs font-medium text-inverted tabular-nums"
              >
                {{ redimensionando.w }} × {{ redimensionando.h }}
              </span>
            </template>
          </div>

          <p
            v-if="!pecas.length && editando"
            class="z-10 self-center text-center text-sm text-muted"
            :style="{ gridColumn: `1 / span ${cols}`, gridRow: `1 / span ${linhas}` }"
          >
            Arraste uma peça da biblioteca para cá
          </p>
        </div>
      </div>

      <p v-if="editando" class="mt-3 text-center text-xs text-muted tabular-nums">
        {{ largura }}px · {{ cols }} colunas × {{ linhas }} linhas<template v-if="ima"> · ímã ligado</template><template v-else> · ímã desligado</template>
      </p>
    </div>
  </div>
</template>
