<script setup lang="ts">
/**
 * UMA PEÇA VIVA — o componente do Storybook plantado dentro do canvas do builder.
 *
 * `<UApp>` é obrigatório e não é decoração: é ele que instala os providers de
 * overlay, tooltip e toast do reka-ui. O preview.ts do Storybook do DS envolve
 * toda story nele pelo mesmo motivo. Sem ele o modal abre e não fecha, e o
 * toast dispara sem ter onde ser desenhado.
 */
import PecaRenderer from '../builder/PecaRenderer.vue'
import type { Peca } from '../builder/modular'

const props = defineProps<{
  tipo: string
  props: Record<string, unknown>
}>()

/**
 * Peças que preenchem a coluna inteira. As de fora da lista têm largura
 * natural — uma etiqueta esticada por 12 colunas não é uma etiqueta.
 */
const ESTICAM = new Set([
  'secao', 'divisor', 'barraNav', 'abas', 'titulo', 'texto', 'imagem',
  'campo', 'busca', 'grade', 'carrossel', 'lista', 'tabela', 'alerta',
  'progresso', 'skeleton', 'modal', 'select', 'radioGroup', 'accordion',
  'grupoBotoes', 'pagination', 'breadcrumb',
])
const estica = ESTICAM.has(props.tipo)

// O renderer trabalha sobre uma `Peca`; aqui só existe tipo + props, porque
// posição e tamanho quem controla é a grade do builder React, do lado de fora.
const peca = (): Peca => ({
  id: 'viva',
  tipo: props.tipo,
  x: 0,
  y: 0,
  w: 1,
  h: 1,
  props: props.props ?? {},
})
</script>

<template>
  <UApp>
    <div class="lumos-peca-viva" :data-estica="estica ? 'sim' : 'nao'">
      <PecaRenderer :peca="peca()" :inerte="false" />
    </div>
  </UApp>
</template>

<style>
/* A peça ocupa a célula que o builder reservou na grade. */
.lumos-peca-viva {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  min-width: 0;
}

/*
  Esticar TODO filho para 100% era errado: etiqueta, chip, avatar e tecla têm
  largura natural, e esticados viravam barras atravessando a tela — nada
  parecido com o que o modo de edição mostra.
  Quem estica é só quem estica de verdade num layout.
*/
.lumos-peca-viva > * {
  max-width: 100%;
  min-width: 0;
}
.lumos-peca-viva[data-estica='sim'] > * {
  width: 100%;
}
</style>
