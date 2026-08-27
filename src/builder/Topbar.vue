<script setup lang="ts">
import ScaleSlider from './ScaleSlider.vue'
import { BRANDS, type BrandId } from '../ds/brands'
import type { Breakpoint } from './types'

defineProps<{
  brand: BrandId
  breakpoint: Breakpoint
  auto: boolean
  showGrid: boolean
  showColumns: boolean
  magnet: boolean
  canvasHeight: number | null
}>()
defineEmits<{
  'update:brand': [BrandId]
  'update:breakpoint': [Breakpoint]
  'update:auto': [boolean]
  'update:showGrid': [boolean]
  'update:showColumns': [boolean]
  'update:magnet': [boolean]
  'update:canvasHeight': [number | null]
}>()
</script>

<template>
  <header class="flex flex-wrap items-center gap-6 border-b border-default bg-elevated px-4 py-2">
    <span class="text-sm font-semibold text-highlighted">Nacional · Builder</span>

    <label class="flex items-center gap-2 text-xs text-muted">
      Marca
      <select
        class="rounded-md border border-default bg-default px-2 py-1 text-sm text-highlighted"
        :value="brand"
        @change="$emit('update:brand', ($event.target as HTMLSelectElement).value as BrandId)"
      >
        <option v-for="b in BRANDS" :key="b.id" :value="b.id">{{ b.label }}</option>
      </select>
    </label>

    <ScaleSlider
      :breakpoint="breakpoint"
      :auto="auto"
      @pick="$emit('update:breakpoint', $event)"
      @auto="$emit('update:auto', true)"
    />

    <label class="flex items-center gap-2 text-xs text-muted">
      Altura
      <input
        type="number" min="120" step="8" placeholder="auto"
        :value="canvasHeight ?? ''"
        class="w-20 rounded-md border border-default bg-default px-2 py-1 text-sm text-highlighted"
        @change="$emit('update:canvasHeight', Number(($event.target as HTMLInputElement).value) || null)"
      />
      <button
        v-if="canvasHeight"
        class="text-muted underline hover:text-highlighted"
        @click="$emit('update:canvasHeight', null)"
      >
        auto
      </button>
    </label>

    <div class="flex items-center gap-1 text-xs text-muted">
      <button
        class="rounded-md px-2 py-1 text-sm"
        :class="showGrid ? 'bg-primary text-inverted' : 'border border-default text-highlighted hover:border-primary'"
        title="Malha quadriculada, no passo do ímã (G)"
        @click="$emit('update:showGrid', !showGrid)"
      >
        Malha
      </button>
      <button
        class="rounded-md px-2 py-1 text-sm"
        :class="showColumns ? 'bg-primary text-inverted' : 'border border-default text-highlighted hover:border-primary'"
        title="Colunas, gutter e margem (C)"
        @click="$emit('update:showColumns', !showColumns)"
      >
        Colunas
      </button>
      <button
        class="rounded-md px-2 py-1 text-sm"
        :class="magnet ? 'bg-primary text-inverted' : 'border border-default text-highlighted hover:border-primary'"
        title="Ímã (M) — passo de 8px quando ligado, 1px quando desligado"
        @click="$emit('update:magnet', !magnet)"
      >
        Ímã
      </button>
    </div>
  </header>
</template>
