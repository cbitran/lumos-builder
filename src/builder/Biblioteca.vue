<script setup lang="ts">
/**
 * BIBLIOTECA — a gaveta de peças do builder modular.
 *
 * POR QUE ELA LÊ O CATÁLOGO E NÃO TEM LISTA PRÓPRIA: no protótipo
 * (`Builder Modular v2.dc.html`) a constante `LIB` era uma segunda lista, escrita
 * à mão ao lado dos tipos — dava para uma peça existir na gaveta e não no motor,
 * ou nascer com `w` diferente do que o palco usava. Aqui a fonte é `TIPOS`: se um
 * tipo não está no catálogo, ele não existe na biblioteca. Uma verdade só.
 *
 * POR QUE O `busca` VEM DE FORA (v-model): o App precisa poder limpar o filtro
 * (Esc) e, no futuro, focar o campo por atalho. Estado de UI que outro componente
 * comanda não pode morar aqui dentro.
 */
import { computed, ref } from 'vue'
import { GRUPOS, TIPOS, type TipoPeca } from './modular-catalog'

const props = defineProps<{ busca: string }>()
const emit = defineEmits<{ 'update:busca': [string] }>()

/**
 * Recolhimento por grupo. Guardado por NOME do grupo, não por índice: a ordem de
 * `GRUPOS` é derivada de `TIPOS` e muda se alguém inserir uma peça no meio.
 */
const recolhidos = ref<Record<string, boolean>>({})
const alternar = (grupo: string) => (recolhidos.value[grupo] = !recolhidos.value[grupo])

/** Busca sem acento: quem procura "acao" tem que achar "Botão de ação". */
const normalizar = (s: string) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()

const termo = computed(() => normalizar(props.busca))

const casa = (t: TipoPeca) =>
  !termo.value || normalizar(t.nome).includes(termo.value) || normalizar(t.tipo).includes(termo.value)

/**
 * Grupos na ordem de `GRUPOS` (que é a ordem do desenho do Celio), já filtrados.
 * Grupo que ficou vazio na busca some — a alternativa (cabeçalho órfão) só
 * empurra o resultado real para fora da tela.
 */
const grupos = computed(() =>
  GRUPOS.map((grupo) => ({ grupo, itens: TIPOS.filter((t) => t.grupo === grupo && casa(t)) })).filter(
    (g) => g.itens.length > 0,
  ),
)

const total = computed(() => grupos.value.reduce((n, g) => n + g.itens.length, 0))

/** Buscando, todo grupo abre: esconder o resultado atrás de um grupo recolhido é bug. */
const aberto = (grupo: string) => Boolean(termo.value) || !recolhidos.value[grupo]

function aoArrastar(e: DragEvent, tipo: string) {
  if (!e.dataTransfer) return
  // Tipo MIME próprio: é o que permite ao palco distinguir uma peça nova
  // (copiar do catálogo) de uma peça já colocada sendo movida.
  e.dataTransfer.setData('application/x-lumos-tipo', tipo)
  e.dataTransfer.effectAllowed = 'copy'
  // A classe no <body> é o gancho para o palco acender a malha durante o arrasto,
  // sem que biblioteca e palco precisem se conhecer.
  document.body.classList.add('arrastando')
}

const aoSoltar = () => document.body.classList.remove('arrastando')
</script>

<template>
  <aside class="flex w-65 shrink-0 flex-col border-r border-default bg-elevated">
    <header class="border-b border-default px-3 py-3">
      <div class="mb-2 flex items-baseline justify-between">
        <h2 class="text-xs font-semibold uppercase tracking-wide text-muted">Biblioteca</h2>
        <span class="text-xs text-dimmed">{{ total }} de {{ TIPOS.length }}</span>
      </div>
      <UInput
        :model-value="busca"
        icon="i-lucide-search"
        placeholder="Buscar peça…"
        size="sm"
        class="w-full"
        @update:model-value="emit('update:busca', String($event))"
      />
    </header>

    <div class="flex-1 overflow-y-auto p-2">
      <section v-for="g in grupos" :key="g.grupo" class="mb-2">
        <button
          type="button"
          class="flex w-full items-center gap-1 rounded-md px-1 py-1 text-left text-xs font-medium uppercase tracking-wide text-dimmed hover:text-highlighted"
          @click="alternar(g.grupo)"
        >
          <UIcon
            :name="aberto(g.grupo) ? 'i-lucide-chevron-down' : 'i-lucide-chevron-right'"
            class="size-3.5"
          />
          {{ g.grupo }}
          <span class="ml-auto normal-case tracking-normal">{{ g.itens.length }}</span>
        </button>

        <div v-show="aberto(g.grupo)" class="mt-1 flex flex-col gap-1">
          <div
            v-for="t in g.itens"
            :key="t.tipo"
            draggable="true"
            :title="t.comportamento ? `${t.nome} — ${t.comportamento}` : t.nome"
            class="flex cursor-grab items-center gap-2 rounded-md border border-default bg-default px-2 py-1.5 hover:border-primary active:cursor-grabbing"
            @dragstart="aoArrastar($event, t.tipo)"
            @dragend="aoSoltar"
          >
            <UIcon :name="t.icone" class="size-4 shrink-0 text-muted" />

            <span class="min-w-0 flex-1">
              <span class="block truncate text-sm text-highlighted">{{ t.nome }}</span>
              <span class="block text-xs text-dimmed">{{ t.w }}×{{ t.h }}</span>
            </span>

            <!--
              O SELO é o diferencial da entrega: peça com `comportamento` não é um
              desenho parado — em modo Visualizar ela roda o comportamento real que
              o Storybook do DS documenta (o modal abre, o acordeão sanfona).
              O texto do comportamento vai no `title` do item inteiro e aqui, para
              quem parar o mouse exatamente no selo.
            -->
            <UIcon
              v-if="t.comportamento"
              name="i-lucide-zap"
              :title="t.comportamento"
              class="size-3.5 shrink-0 text-primary"
            />
          </div>
        </div>
      </section>

      <p v-if="!grupos.length" class="px-2 py-6 text-center text-sm text-dimmed">
        Nenhuma peça para “{{ busca }}”.
      </p>
    </div>
  </aside>
</template>
