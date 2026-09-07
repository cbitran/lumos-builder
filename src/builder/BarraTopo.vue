<script setup lang="ts">
/**
 * BARRA SUPERIOR — o painel de comando do builder.
 *
 * TUDO AQUI É v-model, NADA É ESTADO LOCAL. A barra não decide nada: ela mostra
 * o que o App tem e devolve a intenção. É o que permite o mesmo estado ser mexido
 * por teclado (o App escuta) e por clique (aqui) sem as duas versões divergirem —
 * no protótipo o `preview` era lido em dois lugares e saía do compasso.
 *
 * OS ATALHOS SÃO DOCUMENTADOS, NÃO IMPLEMENTADOS: quem escuta o teclado é o App,
 * porque um `keydown` global precisa saber se o foco está num campo de texto —
 * conhecimento que a barra não tem. Aqui eles aparecem no `title`, que é onde o
 * usuário procura.
 */
import { computed } from 'vue'
import { BREAKPOINTS, type Modo } from './modular'
import { BRANDS, type BrandId } from '../ds/brands'

const props = defineProps<{
  modo: Modo
  largura: number
  marca: BrandId
  malha: boolean
  guias: boolean
  ima: boolean
}>()

const emit = defineEmits<{
  'update:modo': [Modo]
  'update:largura': [number]
  'update:marca': [BrandId]
  'update:malha': [boolean]
  'update:guias': [boolean]
  'update:ima': [boolean]
}>()

/**
 * "1440 · 12 col" em vez de só "1440": a coluna é o que muda o layout de verdade
 * (768 e 640 têm larguras parecidas e grades diferentes). Esconder isso obriga o
 * usuário a decorar a tabela.
 */
const escalas = computed(() =>
  BREAKPOINTS.map((b, i) => ({
    label: `${b.w} · ${b.cols} col`,
    value: b.w as number,
    // Índice na tabela = tecla do atalho. Sai daqui e do App a mesma numeração.
    atalho: String(i + 1),
  })),
)

const marcas = computed(() => BRANDS.map((b) => ({ label: b.label, value: b.id })))

const escalaAtual = computed(() => escalas.value.find((e) => e.value === props.largura))

/** "1=1440, 2=1280, …" — a numeração das teclas, escrita onde o usuário olha. */
const mapaAtalhos = computed(() => escalas.value.map((e) => `${e.atalho}=${e.value}`).join(', '))

/** Os três interruptores de auxílio visual, para não repetir o mesmo botão 3x. */
const auxilios = computed(() => [
  {
    chave: 'malha' as const,
    rotulo: 'Malha',
    icone: 'i-lucide-grid-3x3',
    ligado: props.malha,
    dica: 'Malha da grade (M)',
  },
  {
    chave: 'guias' as const,
    rotulo: 'Guias',
    icone: 'i-lucide-ruler',
    ligado: props.guias,
    dica: 'Guias de alinhamento (G)',
  },
  {
    chave: 'ima' as const,
    rotulo: 'Ímã',
    icone: 'i-lucide-magnet',
    ligado: props.ima,
    dica: 'Ímã: encaixa a peça na célula da grade (I)',
  },
])

function alternarAuxilio(chave: 'malha' | 'guias' | 'ima') {
  if (chave === 'malha') emit('update:malha', !props.malha)
  else if (chave === 'guias') emit('update:guias', !props.guias)
  else emit('update:ima', !props.ima)
}
</script>

<template>
  <header class="flex flex-wrap items-center gap-4 border-b border-default bg-elevated px-4 py-2">
    <span class="flex items-center gap-2 text-sm font-semibold text-highlighted">
      <UIcon name="i-lucide-blocks" class="size-4 text-primary" />
      Lumos Builder
    </span>

    <!--
      EDITAR / VISUALIZAR é a estrela da demo, por isso é um par segmentado e não
      um switch escondido: o usuário precisa ver em que mundo está antes de clicar
      numa peça. Em Editar o clique seleciona; em Visualizar o clique chega ao
      componente do DS e o comportamento roda de verdade.
    -->
    <div class="flex items-center gap-0.5 rounded-md border border-default p-0.5" role="group">
      <UButton
        icon="i-lucide-mouse-pointer-2"
        label="Editar"
        size="xs"
        :color="modo === 'editar' ? 'primary' : 'neutral'"
        :variant="modo === 'editar' ? 'solid' : 'ghost'"
        :aria-pressed="modo === 'editar'"
        title="Editar: o clique seleciona e move a peça (V alterna)"
        @click="emit('update:modo', 'editar')"
      />
      <UButton
        icon="i-lucide-play"
        label="Visualizar"
        size="xs"
        :color="modo === 'visualizar' ? 'primary' : 'neutral'"
        :variant="modo === 'visualizar' ? 'solid' : 'ghost'"
        :aria-pressed="modo === 'visualizar'"
        title="Visualizar: o modal abre, o acordeão sanfona, as abas trocam (V alterna)"
        @click="emit('update:modo', 'visualizar')"
      />
    </div>

    <label class="flex items-center gap-2 text-xs text-muted">
      Escala
      <USelect
        :model-value="largura"
        :items="escalas"
        size="xs"
        class="w-36"
        :title="`Breakpoint atual: ${escalaAtual?.label ?? '—'}. Atalhos: ${mapaAtalhos}`"
        @update:model-value="emit('update:largura', Number($event))"
      />
    </label>

    <label class="flex items-center gap-2 text-xs text-muted">
      Marca
      <USelect
        :model-value="marca"
        :items="marcas"
        size="xs"
        class="w-32"
        title="Tema do Design System — os 9 modes da coleção Brand"
        @update:model-value="emit('update:marca', $event as BrandId)"
      />
    </label>

    <div class="ml-auto flex items-center gap-1">
      <UButton
        v-for="a in auxilios"
        :key="a.chave"
        :icon="a.icone"
        :label="a.rotulo"
        size="xs"
        :color="a.ligado ? 'primary' : 'neutral'"
        :variant="a.ligado ? 'solid' : 'outline'"
        :aria-pressed="a.ligado"
        :title="a.dica"
        @click="alternarAuxilio(a.chave)"
      />
    </div>
  </header>
</template>
