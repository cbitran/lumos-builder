<script setup lang="ts">
/**
 * LUMOS BUILDER — a orquestração.
 *
 * Guarda o estado, escuta o teclado, resolve colisão e mantém o histórico.
 * O Palco, a Biblioteca, a BarraTopo e o Inspector são burros de propósito:
 * recebem props e emitem eventos. Toda decisão sobre o layout mora aqui, num
 * lugar só — foi assim que o `Builder Modular v2` foi desenhado, e é o que
 * torna o desfazer possível sem cada componente ter memória própria.
 */
import { computed, onBeforeUnmount, onMounted, ref, watchEffect } from 'vue'
import BarraTopo from './builder/BarraTopo.vue'
import Biblioteca from './builder/Biblioteca.vue'
import Palco from './builder/Palco.vue'
import InspetorModular from './builder/InspetorModular.vue'
import { applyBrand, type BrandId } from './ds/brands'
import { acharTipo, novaPeca, type Aba } from './builder/modular-catalog'
import {
  LINHAS_PADRAO, bpDe, clamp, colide, filhosDaSecao, novoId,
  type Modo, type Peca,
} from './builder/modular'

// ── Estado ──────────────────────────────────────────────────────────────────
const pecas = ref<Peca[]>([])
const selecionado = ref<string | null>(null)
const modo = ref<Modo>('editar')
const largura = ref(1440)
const linhas = ref(LINHAS_PADRAO)
const marca = ref<BrandId>('original')
const malha = ref(true)
const guias = ref(true)
const ima = ref(true)
const busca = ref('')
const aba = ref<Aba>('conteudo')

watchEffect(() => applyBrand(marca.value))

const colunas = computed(() => bpDe(largura.value as never).cols)
const pecaSelecionada = computed(() => pecas.value.find((p) => p.id === selecionado.value) ?? null)

// ── Histórico ───────────────────────────────────────────────────────────────
// Fotografias do array inteiro. Cabe na memória (dezenas de peças) e evita a
// classe de bug mais chata de um editor: um desfazer que reverte pela metade
// porque alguém esqueceu de registrar uma mutação.
const passado = ref<string[]>([])
const futuro = ref<string[]>([])

function registrar() {
  passado.value.push(JSON.stringify(pecas.value))
  if (passado.value.length > 100) passado.value.shift()
  futuro.value = []
}

function desfazer() {
  const anterior = passado.value.pop()
  if (anterior === undefined) return
  futuro.value.push(JSON.stringify(pecas.value))
  pecas.value = JSON.parse(anterior)
  if (!pecas.value.some((p) => p.id === selecionado.value)) selecionado.value = null
}

function refazer() {
  const proximo = futuro.value.pop()
  if (proximo === undefined) return
  passado.value.push(JSON.stringify(pecas.value))
  pecas.value = JSON.parse(proximo)
}

// ── Colisão ─────────────────────────────────────────────────────────────────
/**
 * Empurra para baixo quem estiver embaixo da peça que acabou de se mover.
 * A `secao` é exceção: ela CONTÉM as peças em vez de colidir com elas (ver
 * `colide` em modular.ts), então empurrar seus filhos desmontaria o container.
 */
function resolverColisao(movida: Peca) {
  const abrigadas = new Set(filhosDaSecao(movida, pecas.value).map((f) => f.id))
  let houve = true
  let voltas = 0
  while (houve && voltas < 20) {
    houve = false
    voltas++
    for (const outra of pecas.value) {
      if (outra.id === movida.id || abrigadas.has(outra.id)) continue
      if (colide(movida, outra)) {
        outra.y = movida.y + movida.h
        houve = true
      }
    }
  }
}

// ── Ações ───────────────────────────────────────────────────────────────────
function soltar(tipo: string, x: number, y: number) {
  const meta = acharTipo(tipo)
  if (!meta) return
  registrar()
  const nova = novaPeca(tipo, novoId(), 0, 0)
  if (!nova) return
  nova.x = clamp(x, 0, Math.max(0, colunas.value - nova.w))
  nova.y = Math.max(0, y)
  pecas.value.push(nova)
  resolverColisao(nova)
  selecionado.value = nova.id
}

function mover(id: string, x: number, y: number) {
  const p = pecas.value.find((q) => q.id === id)
  if (!p) return
  registrar()
  // Uma seção carrega o que abriga: sem isto, arrastar o painel deixaria o
  // conteúdo dele para trás, e o container viraria uma moldura vazia.
  const filhos = filhosDaSecao(p, pecas.value)
  const dx = clamp(x, 0, Math.max(0, colunas.value - p.w)) - p.x
  const dy = Math.max(0, y) - p.y
  p.x += dx
  p.y += dy
  for (const f of filhos) {
    f.x = clamp(f.x + dx, 0, Math.max(0, colunas.value - f.w))
    f.y = Math.max(0, f.y + dy)
  }
  resolverColisao(p)
}

function redimensionar(id: string, x: number, y: number, w: number, h: number) {
  const p = pecas.value.find((q) => q.id === id)
  if (!p) return
  const meta = acharTipo(p.tipo)
  registrar()
  p.w = clamp(w, meta?.minW ?? 1, colunas.value)
  p.h = Math.max(meta?.minH ?? 1, h)
  p.x = clamp(x, 0, Math.max(0, colunas.value - p.w))
  p.y = Math.max(0, y)
  resolverColisao(p)
}

function remover(id: string) {
  registrar()
  pecas.value = pecas.value.filter((p) => p.id !== id)
  if (selecionado.value === id) selecionado.value = null
}

function duplicar() {
  const p = pecaSelecionada.value
  if (!p) return
  registrar()
  const copia: Peca = { ...p, id: novoId(), props: { ...p.props }, y: p.y + p.h }
  pecas.value.push(copia)
  resolverColisao(copia)
  selecionado.value = copia.id
}

function mudarProp(chave: string, valor: unknown) {
  const p = pecaSelecionada.value
  if (!p) return
  registrar()
  p.props[chave] = valor
}

// ── Teclado ─────────────────────────────────────────────────────────────────
function aoTeclar(e: KeyboardEvent) {
  const alvo = (e.target as HTMLElement)?.tagName ?? ''
  if (['INPUT', 'SELECT', 'TEXTAREA'].includes(alvo)) return

  const mod = e.metaKey || e.ctrlKey
  if (mod && e.key.toLowerCase() === 'z') {
    e.preventDefault()
    e.shiftKey ? refazer() : desfazer()
    return
  }
  if (mod && e.key.toLowerCase() === 'd') {
    e.preventDefault()
    duplicar()
    return
  }

  // Em Visualizar o teclado é do conteúdo, não do editor.
  if (modo.value === 'visualizar' && e.key.toLowerCase() !== 'v') return

  const atalhos: Record<string, () => void> = {
    v: () => (modo.value = modo.value === 'editar' ? 'visualizar' : 'editar'),
    g: () => (guias.value = !guias.value),
    m: () => (malha.value = !malha.value),
    i: () => (ima.value = !ima.value),
    '1': () => (largura.value = 390),
    '2': () => (largura.value = 640),
    '3': () => (largura.value = 768),
    '4': () => (largura.value = 1280),
    '5': () => (largura.value = 1440),
  }
  const acao = atalhos[e.key.toLowerCase()]
  if (acao) {
    e.preventDefault()
    acao()
    return
  }

  if ((e.key === 'Delete' || e.key === 'Backspace') && selecionado.value) {
    e.preventDefault()
    remover(selecionado.value)
    return
  }

  const p = pecaSelecionada.value
  if (!p) return
  const passo = e.shiftKey ? 1 : 1
  const setas: Record<string, () => void> = {
    ArrowLeft: () => mover(p.id, p.x - passo, p.y),
    ArrowRight: () => mover(p.id, p.x + passo, p.y),
    ArrowUp: () => mover(p.id, p.x, p.y - passo),
    ArrowDown: () => mover(p.id, p.x, p.y + passo),
  }
  if (setas[e.key]) {
    e.preventDefault()
    setas[e.key]()
  }
}

onMounted(() => window.addEventListener('keydown', aoTeclar))
onBeforeUnmount(() => window.removeEventListener('keydown', aoTeclar))
</script>

<template>
  <!--
    <UApp> é OBRIGATÓRIO, não decoração: instala os providers de overlay,
    tooltip e toast do reka-ui. O preview.ts do Storybook do DS envolve toda
    story nele pelo mesmo motivo. Sem ele o modal abre mas não fecha, e a
    notificação dispara sem ter onde ser desenhada.
  -->
  <UApp>
    <div class="flex h-full flex-col bg-default text-default">
      <BarraTopo
        v-model:modo="modo"
        v-model:largura="largura"
        v-model:marca="marca"
        v-model:malha="malha"
        v-model:guias="guias"
        v-model:ima="ima"
      />

      <div class="flex min-h-0 flex-1">
        <Biblioteca v-if="modo === 'editar'" v-model:busca="busca" />

        <Palco
          :pecas="pecas"
          :largura="largura"
          :linhas="linhas"
          :selecionado="selecionado"
          :modo="modo"
          :malha="malha"
          :guias="guias"
          :ima="ima"
          @soltar="soltar"
          @mover="mover"
          @redimensionar="redimensionar"
          @selecionar="selecionado = $event"
          @remover="remover"
        />

        <InspetorModular
          v-if="modo === 'editar'"
          v-model:aba="aba"
          :peca="pecaSelecionada"
          @prop="mudarProp"
          @remover="selecionado && remover(selecionado)"
          @duplicar="duplicar"
        />
      </div>
    </div>
  </UApp>
</template>
