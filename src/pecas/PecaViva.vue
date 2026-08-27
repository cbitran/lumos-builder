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
    <div class="lumos-peca-viva">
      <PecaRenderer :peca="peca()" :inerte="false" />
    </div>
  </UApp>
</template>

<style>
/* A peça preenche a célula que o builder reservou para ela na grade. */
.lumos-peca-viva {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
}
.lumos-peca-viva > * {
  width: 100%;
}
</style>
