<script setup lang="ts">
// PAINEL — posição, alinhamento e as props do componente.
// Aparência (fill, stroke, radius, opacidade) NÃO entra aqui de propósito:
// isso é decisão do Design System, e abrir exceção quebraria o white-label.
import { computed } from 'vue'
import { findPiece } from './catalog'
import { gridFor, type Align, type Breakpoint, type LayoutBlock, type Position } from './types'

const props = defineProps<{
  block: LayoutBlock | null
  breakpoint: Breakpoint
  pos: Position | null
  ownedBy: Breakpoint | null
  positioned: boolean
}>()

const emit = defineEmits<{
  patch: [Partial<Position>]
  prop: [key: string, value: unknown]
  reset: []
  remove: []
}>()

const piece = computed(() => (props.block ? findPiece(props.block.piece) : undefined))
const columns = computed(() => gridFor(props.breakpoint).columns)
const align = computed<Align>(() => props.pos?.align ?? 'stretch')

const ALIGNMENTS: { value: Align; label: string; hint: string }[] = [
  { value: 'start', label: '⇤', hint: 'Alinhar à esquerda das colunas' },
  { value: 'center', label: '↔', hint: 'Centralizar nas colunas' },
  { value: 'end', label: '⇥', hint: 'Alinhar à direita das colunas' },
  { value: 'stretch', label: '⇔', hint: 'Preencher as colunas' },
]

function num(e: Event) {
  return Number((e.target as HTMLInputElement).value)
}
</script>

<template>
  <aside class="flex w-64 shrink-0 flex-col overflow-y-auto border-l border-default bg-elevated">
    <h2 class="border-b border-default px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted">
      Propriedades
    </h2>

    <p v-if="!block" class="px-4 py-6 text-sm text-muted">
      Selecione um bloco no palco.
    </p>

    <template v-else-if="pos">
      <section class="border-b border-default p-4">
        <h3 class="mb-3 text-xs font-medium uppercase tracking-wide text-muted">Alinhamento</h3>
        <div class="flex gap-1">
          <button
            v-for="a in ALIGNMENTS"
            :key="a.value"
            class="flex-1 rounded-md py-1.5 text-sm"
            :class="align === a.value
              ? 'bg-primary text-inverted'
              : 'border border-default text-highlighted hover:border-primary'"
            :title="a.hint"
            @click="emit('patch', { align: a.value })"
          >
            {{ a.label }}
          </button>
        </div>
        <p class="mt-2 text-xs text-muted">
          {{ ALIGNMENTS.find((a) => a.value === align)?.hint }}
        </p>
      </section>

      <section class="border-b border-default p-4">
        <h3 class="mb-3 text-xs font-medium uppercase tracking-wide text-muted">Posição</h3>
        <div class="grid grid-cols-2 gap-2">
          <label class="text-xs text-muted">
            Coluna
            <input
              type="number" min="1" :max="columns" :value="pos.col" :disabled="!positioned"
              class="mt-1 w-full rounded-md border border-default bg-default px-2 py-1 text-sm text-highlighted disabled:opacity-50"
              @change="emit('patch', { col: num($event) })"
            />
          </label>
          <label class="text-xs text-muted">
            Linha
            <input
              type="number" min="1" :value="pos.row" :disabled="!positioned"
              class="mt-1 w-full rounded-md border border-default bg-default px-2 py-1 text-sm text-highlighted disabled:opacity-50"
              @change="emit('patch', { row: num($event) })"
            />
          </label>
          <label class="col-span-2 text-xs text-muted">
            Largura — {{ pos.span }} de {{ columns }} colunas
            <input
              type="range" min="1" :max="columns" :value="pos.span"
              class="mt-1 w-full accent-primary"
              @input="emit('patch', { span: num($event) })"
            />
          </label>
        </div>
        <p v-if="!positioned" class="mt-2 text-xs text-muted">
          Este bloco é herdado nesta escala, então empilha em ordem de leitura.
          Mova ou redimensione no palco para ele passar a ter posição própria aqui.
        </p>
      </section>

      <section v-if="ownedBy && breakpoint !== 1440" class="border-b border-default p-4">
        <h3 class="mb-2 text-xs font-medium uppercase tracking-wide text-muted">Escala</h3>
        <p v-if="ownedBy === breakpoint" class="text-xs text-primary">Ajustado em {{ breakpoint }}</p>
        <p v-else class="text-xs text-muted">Herdado de {{ ownedBy }}</p>
        <button
          v-if="ownedBy === breakpoint"
          class="mt-2 text-xs text-muted underline hover:text-highlighted"
          @click="emit('reset')"
        >
          voltar a herdar
        </button>
      </section>

      <section v-if="piece?.fields.length" class="border-b border-default p-4">
        <h3 class="mb-3 text-xs font-medium uppercase tracking-wide text-muted">
          {{ piece.label }}
        </h3>
        <div class="flex flex-col gap-3">
          <label v-for="f in piece.fields" :key="f.key" class="text-xs text-muted">
            {{ f.label }}
            <input
              v-if="f.type === 'text'"
              type="text"
              :value="block.props[f.key] ?? ''"
              class="mt-1 w-full rounded-md border border-default bg-default px-2 py-1 text-sm text-highlighted"
              @input="emit('prop', f.key, ($event.target as HTMLInputElement).value)"
            />
            <select
              v-else
              :value="block.props[f.key] ?? ''"
              class="mt-1 w-full rounded-md border border-default bg-default px-2 py-1 text-sm text-highlighted"
              @change="emit('prop', f.key, ($event.target as HTMLSelectElement).value)"
            >
              <option value="">padrão do DS</option>
              <option v-for="o in f.options" :key="o" :value="o">{{ o }}</option>
            </select>
          </label>
        </div>
      </section>

      <div class="p-4">
        <button
          class="w-full rounded-md border border-default py-1.5 text-sm text-highlighted hover:border-error hover:text-error"
          @click="emit('remove')"
        >
          Remover bloco
        </button>
      </div>
    </template>
  </aside>
</template>
