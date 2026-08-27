<script setup lang="ts">
// RENDERER — desenha um bloco do layout. Não sabe nada de edição.
// É este código que o site real vai usar em produção; o Editor some.
import { computed } from 'vue'
import { findPiece } from './catalog'
import type { LayoutBlock } from './types'

const props = withDefaults(defineProps<{ block: LayoutBlock; stretch?: boolean }>(), {
  stretch: true,
})

const piece = computed(() => findPiece(props.block.piece))
// Resolvido pelo nome: os componentes do @nuxt/ui estão registrados globalmente
// a partir do manifesto gerado, igual ao Storybook do DS.
const is = computed(() => piece.value?.renders ?? 'div')
</script>

<template>
  <!--
    Duas formas do MESMO componente, e a separação é obrigatória: um
    `<template v-if>` dentro de <component> declara slot default SEMPRE, mesmo
    com a condição falsa. Componentes de formulário (UInput, USelect…) quebram
    ao receber um slot default vazio — "Cannot set properties of null".
  -->
  <component
    :is="is"
    v-if="!piece?.slot"
    v-bind="block.props"
    :class="stretch ? 'w-full' : ''"
  />
  <component
    :is="is"
    v-else
    v-bind="block.props"
    :class="stretch ? 'w-full' : ''"
  >
    {{ piece.slot }}
  </component>
</template>
