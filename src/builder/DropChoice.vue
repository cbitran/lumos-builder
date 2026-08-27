<script setup lang="ts">
// A escolha no momento do drop: componente cru do DS, ou o arranjo que a Nacional
// usa hoje. Peça sem receita nunca chega aqui — cai direto como componente puro.
import type { Piece } from './catalog'

defineProps<{ piece: Piece }>()
const emit = defineEmits<{ choose: ['pure' | 'recipe']; cancel: [] }>()
</script>

<template>
  <div class="fixed inset-0 z-50 grid place-items-center bg-inverted/50" @click.self="emit('cancel')">
    <div class="w-[420px] rounded-lg border border-default bg-default p-6 shadow-lg">
      <p class="text-sm text-muted">Você soltou</p>
      <h2 class="mb-4 text-lg font-semibold text-highlighted">{{ piece.label }}</h2>

      <button
        class="mb-2 w-full rounded-md border border-default p-4 text-left hover:border-primary"
        @click="emit('choose', 'pure')"
      >
        <span class="block text-sm font-medium text-highlighted">Componente puro</span>
        <span class="block text-sm text-muted">{{ piece.pure.description }}</span>
      </button>

      <button
        v-if="piece.recipe"
        class="w-full rounded-md border border-primary bg-primary/10 p-4 text-left"
        @click="emit('choose', 'recipe')"
      >
        <span class="block text-sm font-medium text-highlighted">{{ piece.recipe.label }}</span>
        <span class="block text-sm text-muted">{{ piece.recipe.description }}</span>
      </button>

      <button class="mt-4 text-sm text-muted hover:text-highlighted" @click="emit('cancel')">
        Cancelar
      </button>
    </div>
  </div>
</template>
