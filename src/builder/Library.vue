<script setup lang="ts">
// BIBLIOTECA — as peças do DS, agrupadas. Arrastar daqui para o palco.
import { computed } from 'vue'
import { CATALOG, GROUPS } from './catalog'

const byGroup = computed(() =>
  GROUPS.map((g) => ({ group: g, pieces: CATALOG.filter((p) => p.group === g) })),
)

function onDragStart(e: DragEvent, key: string, span: number) {
  e.dataTransfer?.setData('application/x-nacional-piece', key)
  // O span vai no PRÓPRIO tipo do dado: durante o dragover o conteúdo é ilegível
  // por segurança do browser, mas a lista de tipos é sempre visível. É assim que
  // o fantasma no palco já nasce com a largura certa da peça.
  e.dataTransfer?.setData(`application/x-nacional-span-${span}`, '1')
  if (e.dataTransfer) e.dataTransfer.effectAllowed = 'copy'
  document.body.classList.add('arrastando')
}

function onDragEnd() {
  document.body.classList.remove('arrastando')
}
</script>

<template>
  <aside class="flex w-60 shrink-0 flex-col border-r border-default bg-elevated">
    <h2 class="border-b border-default px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted">
      Biblioteca
      <span class="ml-1 font-normal normal-case text-dimmed">{{ CATALOG.length }} peças</span>
    </h2>
    <div class="flex-1 overflow-y-auto p-3">
      <section v-for="g in byGroup" :key="g.group" class="mb-4">
        <h3 class="mb-1.5 px-1 text-[10px] font-medium uppercase tracking-wide text-dimmed">
          {{ g.group }}
        </h3>
        <div class="flex flex-col gap-1">
          <div
            v-for="piece in g.pieces"
            :key="piece.key"
            draggable="true"
            class="cursor-grab rounded-md border border-default bg-default px-3 py-1.5 active:cursor-grabbing hover:border-primary"
            @dragstart="onDragStart($event, piece.key, piece.defaultSpan)"
            @dragend="onDragEnd"
          >
            <span class="block text-sm text-highlighted">{{ piece.label }}</span>
            <span v-if="piece.recipe" class="block text-xs text-primary">tem receita</span>
          </div>
        </div>
      </section>
    </div>
  </aside>
</template>
