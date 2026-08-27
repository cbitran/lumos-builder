<script setup lang="ts">
/**
 * HARNESS DE RUNTIME — monta as 29 peças do `Builder Modular v2` e mede o
 * resultado de cada uma.
 *
 * Existe por causa de um modo de falha concreto, registrado no catálogo antigo:
 * "Renderizavam com altura zero, o que na prática é uma peça que some ao ser
 * solta." Altura zero não lança erro, não quebra o build e não aparece em teste
 * de unidade — só aparece olhando. Este harness olha por nós e vira número.
 *
 * Abre em /?harness=1 e publica o resultado em `window.__HARNESS__`, para poder
 * ser lido por automação sem depender de leitura visual.
 */
import { computed, nextTick, onMounted, ref } from 'vue'
import PecaRenderer from '../builder/PecaRenderer.vue'
import { TIPOS, novaPeca } from '../builder/modular-catalog'
import type { Peca } from '../builder/modular'
import { rodarComportamentos, QUANTOS_TESTES, type Resultado } from './comportamentos'

interface Linha {
  tipo: string
  nome: string
  grupo: string
  renders: string
  altura: number
  largura: number
  comportamento: string | null
}

const linhas = ref<Linha[]>([])
const pronto = ref(false)

const casos = computed(() =>
  TIPOS.map((t) => ({ meta: t, peca: novaPeca(t.tipo, `h-${t.tipo}`, 0, 0) as Peca })),
)

onMounted(async () => {
  await nextTick()
  // Espera por TEMPO, não por frame: requestAnimationFrame não dispara em aba
  // de segundo plano, e é justamente assim que a automação valida isto.
  // Esperar o frame deixava a medição pendurada para sempre.
  await new Promise((r) => setTimeout(r, 400))

  linhas.value = casos.value.map(({ meta }) => {
    const el = document.querySelector(`[data-caso="${meta.tipo}"]`) as HTMLElement | null
    const r = el?.getBoundingClientRect()
    return {
      tipo: meta.tipo,
      nome: meta.nome,
      grupo: meta.grupo,
      renders: meta.renders,
      altura: r ? Math.round(r.height) : 0,
      largura: r ? Math.round(r.width) : 0,
      comportamento: meta.comportamento ?? null,
    }
  })
  pronto.value = true

  const ruins = linhas.value.filter((l) => l.altura < 1 || l.largura < 1)
  ;(window as unknown as Record<string, unknown>).__HARNESS__ = {
    total: linhas.value.length,
    reprovadas: ruins.length,
    passou: ruins.length === 0,
    zeradas: ruins.map((r) => r.tipo),
    detalhe: linhas.value,
  }
})

const ruins = computed(() => linhas.value.filter((l) => l.altura < 1 || l.largura < 1))

// ── Bateria de comportamento ────────────────────────────────────────────────
const comportamentos = ref<Resultado[]>([])
const rodando = ref(false)
// Reprovado é só `false`. `null` = não verificável neste ambiente (aba oculta
// suspende requestAnimationFrame) — contar isso como falha seria mentira.
const compReprovados = computed(() => comportamentos.value.filter((c) => c.passou === false))
const compNaoVerificaveis = computed(() => comportamentos.value.filter((c) => c.passou === null))
const compAprovados = computed(() => comportamentos.value.filter((c) => c.passou === true))

async function testarComportamentos() {
  rodando.value = true
  comportamentos.value = []
  const r = await rodarComportamentos()
  comportamentos.value = r
  rodando.value = false
  ;(window as unknown as Record<string, unknown>).__COMPORTAMENTOS__ = {
    total: r.length,
    aprovados: r.filter((x) => x.passou === true).length,
    reprovados: r.filter((x) => x.passou === false).length,
    naoVerificaveis: r.filter((x) => x.passou === null).length,
    passou: r.every((x) => x.passou !== false),
    detalhe: r,
  }
}

// Roda sozinha depois da medição, para a automação só precisar ler as duas
// variáveis globais em vez de clicar no botão.
onMounted(async () => {
  await new Promise((r) => setTimeout(r, 900))
  await testarComportamentos()
})
</script>

<template>
  <!--
    <UApp> é OBRIGATÓRIO, não decoração: é ele que instala os providers de
    overlay, tooltip e toast do reka-ui. O próprio preview.ts do Storybook do DS
    envolve toda story nele pelo mesmo motivo. Sem ele o modal ABRE mas não
    FECHA, e o toast dispara sem ter onde ser desenhado — foi exatamente o que
    este harness pegou em 2026-08-27.
  -->
  <UApp>
  <div class="min-h-full bg-default p-6 text-default">
    <header class="mb-5">
      <h1 class="text-lg font-semibold text-highlighted">Harness · 29 peças do Builder Modular v2</h1>
      <p class="text-sm text-muted">
        Cada peça montada isolada, com o componente real do Design System.
        Altura ou largura zero = a peça some ao ser solta no palco.
      </p>
    </header>

    <div
      v-if="pronto"
      class="mb-5 rounded-md border p-3 text-sm"
      :class="ruins.length ? 'border-error text-error' : 'border-success text-success'"
      data-veredito
    >
      <strong v-if="ruins.length">
        ✗ {{ ruins.length }} de {{ linhas.length }} reprovadas: {{ ruins.map((r) => r.tipo).join(', ') }}
      </strong>
      <strong v-else>✓ as {{ linhas.length }} peças renderizaram com tamanho visível.</strong>
    </div>

    <section class="mb-6 rounded-lg border border-default p-4">
      <div class="mb-3 flex items-center gap-3">
        <h2 class="text-sm font-semibold text-highlighted">Comportamento</h2>
        <span class="text-xs text-muted">
          O tamanho prova que a peça aparece. Isto prova que ela funciona.
        </span>
        <button
          class="ml-auto rounded-md border border-default px-2 py-1 text-xs text-highlighted hover:border-primary disabled:opacity-50"
          :disabled="rodando"
          @click="testarComportamentos"
        >
          {{ rodando ? 'testando…' : 'rodar de novo' }}
        </button>
      </div>

      <div
        v-if="comportamentos.length"
        class="mb-3 rounded-md border p-2 text-sm"
        :class="compReprovados.length ? 'border-error text-error' : compNaoVerificaveis.length ? 'border-warning text-warning' : 'border-success text-success'"
        data-veredito-comportamento
      >
        <strong v-if="compReprovados.length">
          ✗ {{ compReprovados.length }} de {{ comportamentos.length }} comportamentos falharam
        </strong>
        <strong v-else>
          ✓ {{ compAprovados.length }} comportamentos funcionaram<template v-if="compNaoVerificaveis.length">
          · {{ compNaoVerificaveis.length }} não verificável(is) neste ambiente</template>
        </strong>
      </div>
      <p v-else class="text-xs text-muted">{{ rodando ? 'rodando…' : QUANTOS_TESTES + ' testes prontos' }}</p>

      <div v-for="c in comportamentos" :key="c.tipo" class="flex gap-2 border-t border-default py-1.5 text-xs">
        <span :class="c.passou === true ? 'text-success' : c.passou === false ? 'text-error' : 'text-warning'">
          {{ c.passou === true ? '✓' : c.passou === false ? '✗' : '—' }}
        </span>
        <span class="w-24 shrink-0 text-highlighted">{{ c.tipo }}</span>
        <span class="w-64 shrink-0 text-muted">{{ c.o_que }}</span>
        <span :class="c.passou === true ? 'text-dimmed' : c.passou === false ? 'text-error' : 'text-warning'">{{ c.detalhe }}</span>
      </div>
    </section>

    <table class="w-full text-left text-sm">
      <thead class="text-xs uppercase tracking-wide text-dimmed">
        <tr>
          <th class="py-1">Peça</th>
          <th>Componente do DS</th>
          <th class="text-right">Tamanho</th>
          <th class="pl-4">Renderizado</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="c in casos" :key="c.meta.tipo" class="border-t border-default align-top">
          <td class="py-2 pr-3">
            <div class="text-highlighted">{{ c.meta.nome }}</div>
            <div class="text-[11px] text-dimmed">{{ c.meta.grupo }}</div>
            <div v-if="c.meta.comportamento" class="mt-0.5 text-[11px] text-primary">
              {{ c.meta.comportamento }}
            </div>
          </td>
          <td class="pr-3 text-muted">{{ c.meta.renders }}</td>
          <td class="pr-3 text-right tabular-nums text-xs"
              :class="(linhas.find((l) => l.tipo === c.meta.tipo)?.altura ?? 1) < 1 ? 'text-error' : 'text-muted'">
            <template v-if="pronto">
              {{ linhas.find((l) => l.tipo === c.meta.tipo)?.largura }}×{{ linhas.find((l) => l.tipo === c.meta.tipo)?.altura }}
            </template>
            <template v-else>…</template>
          </td>
          <td class="w-1/2 py-2 pl-4">
            <div :data-caso="c.meta.tipo" class="inline-block w-full max-w-[520px]" style="min-height: 1px">
              <PecaRenderer :peca="c.peca" />
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  </UApp>
</template>
