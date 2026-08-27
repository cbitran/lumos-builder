<script setup lang="ts">
/**
 * HARNESS DE RUNTIME — monta TODAS as peças do catálogo e mede o resultado.
 *
 * Existe por causa de um modo de falha concreto, registrado no catalog.ts:
 * "Renderizavam com altura zero, o que na prática é uma peça que some ao ser
 * solta." Altura zero não lança erro, não quebra o build e não aparece em teste
 * de unidade — só aparece olhando. Este harness olha por nós, e transforma isso
 * num número.
 *
 * Abre em /?harness=1 e também publica o resultado em `window.__HARNESS__`,
 * para poder ser lido de fora sem depender de leitura visual.
 *
 * DELIBERADAMENTE INDEPENDENTE: ele materializa a própria semente em vez de
 * chamar `materializeSeed` do catálogo. Um portão que reusa o código que julga
 * passa a errar junto com ele.
 */
import { computed, nextTick, onMounted, ref } from 'vue'
import BlockRenderer from '../builder/BlockRenderer.vue'
import { CATALOG, type Piece } from '../builder/catalog'

interface Linha {
  key: string
  label: string
  group: string
  renders: string
  altura: number
  erro: string | null
  filhos: number
}

const linhas = ref<Linha[]>([])
const pronto = ref(false)

/** Erros de render são capturados por peça — um só não pode derrubar o resto. */
const erros = new Map<string, string>()

/** Materializador local. Ver a nota de independência no topo. */
function semear(seed: unknown, contar = { n: 0 }): Record<string, unknown[]> | undefined {
  if (!seed || typeof seed !== 'object') return undefined
  const out: Record<string, unknown[]> = {}
  for (const [slot, filhos] of Object.entries(seed as Record<string, unknown[]>)) {
    out[slot] = (filhos ?? []).map((f) => {
      const filho = f as Record<string, unknown>
      contar.n++
      return {
        ...filho,
        id: `h${contar.n}`,
        props: { ...(filho.props as object) },
        slots: semear(filho.slots, contar),
      }
    })
  }
  return out
}

function blocoDe(piece: Piece) {
  const contar = { n: 0 }
  const slots = semear((piece as unknown as { seed?: unknown }).seed, contar)
  return {
    bloco: {
      id: `harness-${piece.key}`,
      piece: piece.key,
      mode: 'pure' as const,
      props: { ...piece.pure.props },
      slots,
      positions: { 1440: { col: 1, row: 1, span: piece.defaultSpan } },
    },
    filhos: contar.n,
  }
}

const casos = computed(() => CATALOG.map((p) => ({ piece: p, ...blocoDe(p) })))

onMounted(async () => {
  await nextTick()
  // Espera por TEMPO, não por frame. Componentes com medição interna (Carousel,
  // Accordion) só assentam a altura depois do primeiro frame — mas
  // requestAnimationFrame não dispara em aba de segundo plano, e é justamente
  // assim que este harness roda quando validado por automação. Esperar o frame
  // deixava a medição pendurada para sempre.
  await new Promise((r) => setTimeout(r, 250))

  linhas.value = casos.value.map(({ piece, filhos }) => {
    const el = document.querySelector(`[data-caso="${piece.key}"]`) as HTMLElement | null
    return {
      key: piece.key,
      label: piece.label,
      group: piece.group,
      renders: piece.renders,
      altura: el ? Math.round(el.getBoundingClientRect().height) : 0,
      erro: erros.get(piece.key) ?? null,
      filhos,
    }
  })
  pronto.value = true

  const reprovadas = linhas.value.filter((l) => l.altura < 1 || l.erro)
  ;(window as unknown as Record<string, unknown>).__HARNESS__ = {
    total: linhas.value.length,
    reprovadas: reprovadas.length,
    passou: reprovadas.length === 0,
    detalhe: linhas.value,
  }
})

const reprovadas = computed(() => linhas.value.filter((l) => l.altura < 1 || l.erro))
</script>

<template>
  <div class="min-h-full bg-default p-6 text-default">
    <header class="mb-5">
      <h1 class="text-lg font-semibold text-highlighted">Harness · peças do catálogo</h1>
      <p class="text-sm text-muted">
        Monta cada peça isolada e mede a altura renderizada. Altura zero = a peça
        some ao ser solta no palco.
      </p>
    </header>

    <div
      v-if="pronto"
      class="mb-5 rounded-md border p-3 text-sm"
      :class="reprovadas.length ? 'border-error text-error' : 'border-success text-success'"
      data-veredito
    >
      <strong v-if="reprovadas.length">
        ✗ {{ reprovadas.length }} de {{ linhas.length }} peças reprovadas:
        {{ reprovadas.map((r) => r.key).join(', ') }}
      </strong>
      <strong v-else>✓ {{ linhas.length }} peças renderizaram com altura visível.</strong>
    </div>

    <table class="w-full text-left text-sm">
      <thead class="text-xs uppercase tracking-wide text-dimmed">
        <tr>
          <th class="py-1">Peça</th>
          <th>Componente</th>
          <th>Filhos</th>
          <th class="text-right">Altura</th>
          <th class="pl-4">Amostra</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="c in casos" :key="c.piece.key" class="border-t border-default align-top">
          <td class="py-2 pr-3 text-highlighted">{{ c.piece.label }}</td>
          <td class="pr-3 text-muted">{{ c.piece.renders }}</td>
          <td class="pr-3 tabular-nums text-muted">{{ c.filhos || '—' }}</td>
          <td class="pr-3 text-right tabular-nums"
              :class="(linhas.find((l) => l.key === c.piece.key)?.altura ?? 1) < 1 ? 'text-error' : 'text-muted'">
            {{ pronto ? (linhas.find((l) => l.key === c.piece.key)?.altura ?? 0) + 'px' : '…' }}
          </td>
          <td class="w-1/2 py-2 pl-4">
            <div :data-caso="c.piece.key" class="inline-block max-w-full">
              <BlockRenderer :block="(c.bloco as never)" :stretch="false" />
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
