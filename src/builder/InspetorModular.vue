<script setup lang="ts">
/**
 * INSPECTOR MODULAR — o painel da direita do `Builder Modular v2`.
 *
 * Duas responsabilidades, e é a segunda que justifica o arquivo existir:
 *
 * 1) EDITAR a peça selecionada, com o controle CERTO para cada campo. Um `range`
 *    desenhado como `select` é um controle mentiroso: o usuário perde a noção de
 *    contínuo e o Inspector passa a mentir sobre o que o campo é. Por isso os
 *    quatro tipos declarados no catálogo são renderizados de verdade.
 *
 * 2) MOSTRAR o que o Design System documenta sobre a peça. O protótipo do Claude
 *    Design não conseguiu ler o Storybook — aqui o `DS_MANIFEST` (46 stories
 *    lidas do Storybook do DS) é consultado pelo campo `story` do tipo. Quando o
 *    DS não documenta, o painel DIZ que não documenta em vez de inventar: 20 das
 *    46 stories nem sequer declaram `argTypes`, e preencher esse vazio com
 *    suposição seria pior do que o silêncio.
 *
 * Nenhuma cor, fonte, sombra ou espaçamento literal entra aqui: só papéis
 * semânticos do DS. O `npm run check:ds` falha o build se escapar algum.
 */
import { computed } from 'vue'
import type { Peca } from './modular'
import { acharTipo, camposDe, type Aba, type Campo } from './modular-catalog'
import { DS_MANIFEST } from '../ds/storybook-manifest.generated'

const props = defineProps<{
  peca: Peca | null
  /** Aba ativa. Fica no pai porque ela sobrevive à troca de peça. */
  aba: Aba
}>()

const emit = defineEmits<{
  'update:aba': [Aba]
  prop: [chave: string, valor: unknown]
  remover: []
  duplicar: []
}>()

const tipo = computed(() => (props.peca ? acharTipo(props.peca.tipo) : undefined))

/** `camposDe` já junta os COMUNS da aba Regras — não repetir a junção aqui. */
const campos = computed<Campo[]>(() => (props.peca ? camposDe(props.peca.tipo) : []))

/**
 * A entrada do Storybook desta peça, quando existe. É `story` (a folha do título
 * da story) que indexa o manifesto — não `renders`, que é o nome do componente
 * do @nuxt/ui e nem sempre coincide (`busca` renderiza UInput mas é documentada
 * pela story `Search`).
 */
const doc = computed(() => {
  const s = tipo.value?.story
  return s ? DS_MANIFEST[s] : undefined
})

const ABAS: { value: Aba; label: string; icon: string }[] = [
  { value: 'conteudo', label: 'Conteúdo', icon: 'i-lucide-type' },
  { value: 'estilo', label: 'Estilo', icon: 'i-lucide-palette' },
  { value: 'regras', label: 'Regras', icon: 'i-lucide-shield-check' },
]

const camposDaAba = (a: Aba) => campos.value.filter((c) => c.aba === a)

/**
 * Aba sem campo fica DESABILITADA, não escondida: o desenho do Celio tem três
 * abas fixas. Sumir com uma faz a barra "pular" a cada troca de peça e o usuário
 * perde a referência de onde as coisas estão.
 */
const itensAba = computed(() =>
  ABAS.map((a) => ({ ...a, disabled: camposDaAba(a.value).length === 0 })),
)

const visiveis = computed(() => camposDaAba(props.aba))

const valorTexto = (c: Campo) => String(props.peca?.props[c.key] ?? '')
const valorBool = (c: Campo) => props.peca?.props[c.key] === true
const valorSelect = (c: Campo) => props.peca?.props[c.key] as string | undefined

/** Range precisa de número mesmo quando a peça ainda não tem o valor gravado. */
function valorRange(c: Extract<Campo, { tipo: 'range' }>) {
  const v = props.peca?.props[c.key]
  return typeof v === 'number' ? v : c.min
}

const numeroDoEvento = (e: Event) => Number((e.target as HTMLInputElement).value)
</script>

<template>
  <aside class="flex w-72 shrink-0 flex-col overflow-y-auto border-l border-default bg-elevated">
    <!-- Estado vazio: sem peça não há o que inspecionar. -->
    <template v-if="!peca || !tipo">
      <h2 class="border-b border-default px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted">
        Inspector
      </h2>
      <div class="flex flex-1 flex-col items-center justify-center gap-2 px-6 py-10 text-center">
        <UIcon name="i-lucide-square-dashed" class="size-6 text-dimmed" />
        <p class="text-sm text-muted">Selecione uma peça no palco para editar.</p>
      </div>
    </template>

    <template v-else>
      <!-- Cabeçalho: identidade da peça + as duas ações destrutivas/duplicadoras -->
      <header class="border-b border-default px-4 py-3">
        <div class="flex items-start gap-2">
          <UIcon :name="tipo.icone" class="mt-0.5 size-4 shrink-0 text-primary" />
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-semibold text-highlighted">{{ tipo.nome }}</p>
            <p class="text-xs text-muted">{{ tipo.grupo }}</p>
          </div>
        </div>
        <div class="mt-3 flex gap-2">
          <UButton
            icon="i-lucide-copy" size="xs" variant="outline" color="neutral" class="flex-1 justify-center"
            @click="emit('duplicar')"
          >
            Duplicar
          </UButton>
          <UButton
            icon="i-lucide-trash-2" size="xs" variant="outline" color="error" class="flex-1 justify-center"
            @click="emit('remover')"
          >
            Remover
          </UButton>
        </div>
      </header>

      <!-- O QUE O DS DIZ. Vem antes dos campos porque explica o que se está editando. -->
      <section class="border-b border-default px-4 py-3">
        <div class="flex items-center gap-1.5">
          <UIcon name="i-lucide-book-open" class="size-3.5 text-dimmed" />
          <h3 class="text-xs font-medium uppercase tracking-wide text-muted">Design System</h3>
        </div>

        <p class="mt-2 text-xs text-muted">
          Renderiza
          <span class="font-medium text-highlighted">{{ tipo.renders }}</span>
          <template v-if="tipo.renders === 'composto'"> — arranjo de vários componentes do DS</template>
          <template v-else-if="tipo.renders === 'nativo'"> — texto ou slot, não é componente do DS</template>
        </p>

        <template v-if="doc">
          <!-- A descrição é o texto que o próprio Storybook do DS publica. -->
          <p class="mt-2 text-xs leading-relaxed text-muted">{{ doc.description || 'O Storybook não escreveu descrição para este componente.' }}</p>
          <p v-if="doc.stories.length" class="mt-2 text-xs text-dimmed">
            Documentado no Storybook como: {{ doc.stories.join(', ') }}
          </p>
          <!-- 20 das 46 stories não declaram argTypes. Dizer isso é mais honesto
               do que exibir uma lista vazia como se fosse informação. -->
          <p v-if="!Object.keys(doc.argTypes).length" class="mt-1 text-xs text-dimmed">
            Esta story não declara argTypes — os campos abaixo vêm do catálogo do builder.
          </p>
        </template>

        <p v-else class="mt-2 text-xs text-dimmed">
          O Storybook do DS não documenta este componente.
        </p>
      </section>

      <!-- Comportamento: existe só no modo Visualizar, e isso precisa ficar dito.
           Sem o aviso, o usuário clica no modo Editar, nada acontece e conclui
           que a peça está quebrada. -->
      <section v-if="tipo.comportamento" class="border-b border-default px-4 py-3">
        <div class="flex gap-2 rounded-md bg-muted px-3 py-2">
          <UIcon name="i-lucide-play" class="mt-0.5 size-3.5 shrink-0 text-warning" />
          <div>
            <p class="text-xs font-medium text-highlighted">{{ tipo.comportamento }}</p>
            <p class="mt-1 text-xs text-muted">Só roda no modo Visualizar.</p>
          </div>
        </div>
      </section>

      <!-- As três abas do desenho do Celio. `content=false`: o conteúdo é
           renderizado abaixo, porque a lista de campos depende de `props.aba`
           (que mora no pai) e não do estado interno do UTabs. -->
      <div class="border-b border-default px-3 py-2">
        <UTabs
          :items="itensAba"
          :model-value="aba"
          :content="false"
          size="xs"
          class="w-full"
          @update:model-value="(v) => emit('update:aba', v as Aba)"
        />
      </div>

      <section class="flex flex-col gap-4 px-4 py-4">
        <p v-if="!visiveis.length" class="text-xs text-dimmed">
          Esta peça não tem campos nesta aba.
        </p>

        <div v-for="campo in visiveis" :key="campo.key" class="flex flex-col gap-1.5">
          <!-- switch: o rótulo é do próprio USwitch, não repetir acima dele -->
          <USwitch
            v-if="campo.tipo === 'switch'"
            :model-value="valorBool(campo)"
            :label="campo.label"
            size="sm"
            @update:model-value="(v) => emit('prop', campo.key, v)"
          />

          <template v-else>
            <div class="flex items-baseline justify-between gap-2">
              <label class="text-xs text-muted">{{ campo.label }}</label>
              <!-- range mostra o valor com o sufixo do catálogo (16px, 60%, 6s) -->
              <span v-if="campo.tipo === 'range'" class="text-xs tabular-nums text-highlighted">
                {{ valorRange(campo) }}{{ campo.sufixo }}
              </span>
            </div>

            <UInput
              v-if="campo.tipo === 'text'"
              :model-value="valorTexto(campo)"
              size="sm"
              @update:model-value="(v) => emit('prop', campo.key, v)"
            />

            <USelect
              v-else-if="campo.tipo === 'select'"
              :model-value="valorSelect(campo)"
              :items="campo.opcoes"
              size="sm"
              @update:model-value="(v) => emit('prop', campo.key, v)"
            />

            <!-- Não existe URange no @nuxt/ui 4.9 com o contrato min/max/passo que
                 o catálogo declara; o input nativo com `accent-primary` herda a
                 cor da marca do DS sem literal nenhum. -->
            <input
              v-else
              type="range"
              :min="campo.min"
              :max="campo.max"
              :step="campo.passo"
              :value="valorRange(campo)"
              class="w-full accent-primary"
              @input="emit('prop', campo.key, numeroDoEvento($event))"
            />
          </template>
        </div>
      </section>
    </template>
  </aside>
</template>
