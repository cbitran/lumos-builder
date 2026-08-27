# Builder dinâmico — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Peças de comportamento do Design System (Modal, Drawer, Dropdown, Tooltip, Popover, Chip, FieldGroup, Carousel) caem no palco já montadas e funcionando, com um modo Testar que executa o comportamento dentro do builder — e tudo isso publicado no GitHub Pages.

**Architecture:** O bloco do layout deixa de ser um nó de props planas e passa a ser uma árvore (`SlotChild`), com slots nomeados. O `BlockRenderer` vira render function recursiva que resolve componentes pelo manifesto já existente e nunca declara slot vazio. O catálogo ganha *sementes* — a árvore de filhos que a peça recebe ao ser solta. Um gerador lê as stories do Storybook do DS via AST do TypeScript e alimenta o Inspector com args/argTypes, reportando as lacunas.

**Tech Stack:** Vue 3.5 (render functions, `h`), Vite 6, `@nuxt/ui` 4.9.0, TypeScript 5.6 (`typescript` também usado como parser de AST no gerador), `node --test` (runner nativo do Node 24 — sem dependência nova), GitHub Actions + Pages.

**Spec:** `docs/superpowers/specs/2026-08-26-builder-dinamico-design.md`

## Global Constraints

- **Fonte da verdade é o DS.** Nenhuma cor, fonte, sombra, raio ou espaçamento literal entra em `src/`. Papéis semânticos do DS apenas: `default`, `muted`, `elevated`, `highlighted`, `inverted`, `dimmed`, `primary`, `error`, `warning`, `success`, `info`, `neutral`.
- **Set de ícones: `i-lucide-*`.** Decidido em 2026-08-26 (spec §4). Nenhum `i-heroicons-*` em `src/`.
- **`npm run build` roda `check:ds` antes do `vite build`.** Toda task tem que deixar `npm run check:ds` passando.
- **Componentes do DS são resolvidos pelo manifesto** `src/ds/nuxt-ui-components.generated.ts`, que exporta `nuxtUiComponents: Record<string, Component>` com 121 componentes. Nunca por string em `<component :is>`, nunca por `resolveComponent`.
- **`UButtonGroup` não existe no `@nuxt/ui` 4.9.0.** O nome correto é **`UFieldGroup`**.
- **Slot vazio nunca é declarado.** Componentes de formulário quebram com `Cannot set properties of null` ao receber slot default vazio.
- **Filhos não têm posição.** Só `LayoutBlock` (raiz) tem `positions`.
- **Nada é escrito no repositório `nacionalbet-ds`.** Somente leitura.
- Comentários e textos de interface em português, no tom dos arquivos existentes: explicam *por que*, não *o que*.

---

### Task 1: Lei do Design System aponta para Lucide

O `check:ds` hoje falha o build em qualquer ícone que não seja `i-heroicons-*`, mas o Storybook do DS usa `i-lucide-*` em 83 ocorrências e zero heroicons. Sem esta task, toda semente com ícone quebra o build.

**Files:**
- Modify: `scripts/check-ds-law.mjs:26-27` (constante) e `:47-51` (regra)
- Modify: `src/builder/catalog.ts` (2 ícones)
- Modify: `src/builder/Stage.vue:379` (1 ícone)

**Interfaces:**
- Consumes: nada
- Produces: `npm run check:ds` aceitando `i-lucide-*` e rejeitando qualquer outro prefixo. Todas as tasks seguintes dependem disso.

- [ ] **Step 1: Escrever o teste que falha — um arquivo com ícone proibido**

```bash
mkdir -p src/__proibido__
cat > src/__proibido__/sonda.ts <<'EOF'
export const icone = 'i-heroicons-bell'
EOF
```

- [ ] **Step 2: Rodar o checker e ver que ele NÃO pega (estado atual)**

Run: `npm run check:ds`
Expected: PASSA (`✓ Lei do Design System respeitada`) — que é o bug: `i-heroicons-bell` é hoje o único set aceito.

- [ ] **Step 3: Trocar o set autorizado para Lucide**

Em `scripts/check-ds-law.mjs`, substituir a constante e o comentário:

```js
// Set de ícone autorizado: o Storybook do DS usa Lucide em 100% das stories
// (83 ocorrências, zero heroicons) e é o padrão do @nuxt/ui v4. O ADR-005 do DS
// diz que o DS possui o SLOT, não a biblioteca — então a trava não existe para
// impor um set "oficial" do DS, e sim para impedir set MISTO dentro do builder.
const ALLOWED_ICON_PREFIX = /^i-lucide-/
```

E a regra correspondente:

```js
  {
    name: 'ícone de set não autorizado',
    re: /["'`]i-(?!lucide-)[a-z0-9]+[:-][^"'`]+["'`]/g,
    why: 'o builder usa Lucide — mesmo set do Storybook do DS',
  },
```

- [ ] **Step 4: Rodar o checker e ver que agora ele pega**

Run: `npm run check:ds`
Expected: FALHA com `[ícone de set não autorizado]` apontando `src/__proibido__/sonda.ts:1`

- [ ] **Step 5: Remover a sonda**

```bash
rm -rf src/__proibido__
```

- [ ] **Step 6: Trocar os ícones heroicons que existem hoje no código**

Em `src/builder/catalog.ts`:
- `'i-heroicons-magnifying-glass'` → `'i-lucide-search'` (peça `busca`)
- `'i-heroicons-star'` → `'i-lucide-star'` (peça `UIcon`)
- No comentário do topo do arquivo, trocar `porque o DS é a fonte da verdade` e a menção a Heroicons por: `Ex.: a busca no ar usa 'mingcute:search-2-line'; aqui usa Lucide, o mesmo set do Storybook do DS.`
- Na peça `UIcon`, trocar a descrição `'UIcon do DS (Heroicons).'` por `'UIcon do DS (Lucide).'`

Em `src/builder/Stage.vue:379`:
- `name="i-heroicons-trash"` → `name="i-lucide-trash-2"`

- [ ] **Step 7: Verificar que não sobrou nenhum heroicons**

Run: `grep -rn "i-heroicons" src/ ; echo "saída vazia = ok"`
Expected: nenhuma linha antes do `echo`

Run: `npm run check:ds`
Expected: PASS — `✓ Lei do Design System respeitada`

- [ ] **Step 8: Commit**

```bash
git add scripts/check-ds-law.mjs src/builder/catalog.ts src/builder/Stage.vue
git commit -m "fix: trava de ícone aponta para Lucide, o set real do DS

O Storybook do DS usa i-lucide-* em 83 ocorrências e zero heroicons, e o
ADR-005 diz que o DS possui o slot, não a biblioteca. A regra de heroicons
foi herdada do style-guide antigo em @nuxt/ui v2."
```

---

### Task 2: O bloco vira árvore e o renderer vira recursivo

**Files:**
- Modify: `src/builder/types.ts:71-100` (interfaces `LayoutBlock`/`Layout`)
- Rewrite: `src/builder/BlockRenderer.vue`
- Create: `src/builder/CarouselSlide.vue`
- Modify: `src/builder/catalog.ts` (peça `texto` + campos novos em `Piece`)

**Interfaces:**
- Consumes: `nuxtUiComponents` de `src/ds/nuxt-ui-components.generated.ts` (`Record<string, Component>`); `findPiece(key: string): Piece | undefined` de `./catalog`
- Produces:
  - `interface SlotChild { id: string; piece: string; props: Record<string, unknown>; slots?: Record<string, SlotChild[]>; action?: 'close' }`
  - `interface LayoutBlock extends SlotChild { mode: 'pure' | 'recipe'; positions: ... }`
  - `type ChildSeed = Omit<SlotChild, 'id'> & { slots?: Record<string, ChildSeed[]> }`
  - `BlockRenderer` com props `{ block: SlotChild; stretch?: boolean }`
  - Em `Piece`: `slots?: { key: string; label: string }[]`, `seed?: Record<string, ChildSeed[]>`, `fixedSlide?: boolean`

- [ ] **Step 1: Reescrever os tipos**

Em `src/builder/types.ts`, substituir a `interface LayoutBlock` inteira por:

```ts
/**
 * Um nó da ÁRVORE DE CONTEÚDO. Não ocupa grade — flui dentro de um slot.
 * É este tipo que permite `UModal` ter gatilho e rodapé: no @nuxt/ui v4 o
 * comportamento dos overlays vive em SLOTS, não em props.
 */
export interface SlotChild {
  id: string
  /** Chave da peça no catálogo (ex.: 'UButton', 'texto'). */
  piece: string
  /** Props passadas ao componente do DS. Nunca contém cor, fonte ou tamanho literal. */
  props: Record<string, unknown>
  /** Filhos por slot. Slot sem filhos NÃO é declarado no renderer. */
  slots?: Record<string, SlotChild[]>
  /**
   * Liga o clique ao `close` que o slot expõe no escopo (o rodapé do UModal
   * recebe `{ close }`). Sem isto, Cancelar/Confirmar não fecham o modal.
   */
  action?: 'close'
}

/**
 * Bloco RAIZ do layout: o único que ocupa colunas.
 * Um filho nunca recebe `positions` — seria posição-fantasma que a grade não lê.
 */
export interface LayoutBlock extends SlotChild {
  /** 'pure' = componente cru do DS · 'recipe' = arranjo observado no site da Nacional. */
  mode: 'pure' | 'recipe'
  /**
   * Posição POR ESCALA, em cascata. 1440 é a base e sempre existe; as outras só
   * aparecem quando alguém ajustou naquela escala.
   */
  positions: Partial<Record<Breakpoint, Position>> & { 1440: Position }
}

/** Semente do catálogo: um SlotChild sem `id` — o id nasce no drop. */
export type ChildSeed = Omit<SlotChild, 'id' | 'slots'> & {
  slots?: Record<string, ChildSeed[]>
}
```

E no `Layout`, trocar `version: 2` por `version: 3`.

- [ ] **Step 2: Adicionar os campos novos em `Piece` e a peça `texto`**

Em `src/builder/catalog.ts`, importar o tipo e estender a interface:

```ts
import type { ChildSeed } from './types'
```

Dentro de `interface Piece`, acrescentar:

```ts
  /** Slots que esta peça expõe na interface. Sem isto o Inspector não sabe o que existe. */
  slots?: { key: string; label: string }[]
  /** Filhos que a peça já traz ao ser solta — é isto que faz ela cair FUNCIONANDO. */
  seed?: Record<string, ChildSeed[]>
  /**
   * O slide vem de um scoped slot repetido por item, não de uma árvore estática.
   * Renderizado por CarouselSlide.vue, fixo nesta versão.
   */
  fixedSlide?: boolean
```

E acrescentar a peça no grupo Conteúdo:

```ts
  {
    key: 'texto', label: 'Texto', group: 'Conteúdo', renders: 'text', defaultSpan: 3,
    pure: { description: 'Texto simples — o conteúdo mínimo de um slot.', props: { text: 'Texto' } },
    fields: [{ key: 'text', label: 'Texto', type: 'text' }],
  },
```

`renders: 'text'` é sentinela: não é componente do DS, e o renderer trata antes de consultar o manifesto.

- [ ] **Step 3: Criar o slide fixo do carrossel**

Create `src/builder/CarouselSlide.vue`:

```vue
<script setup lang="ts">
// Slide do UCarousel. O carrossel entrega o item por SCOPED SLOT, repetido por
// item — isso é um template, não uma árvore de filhos, então não cabe no modelo
// de `slots` do bloco. Fixo nesta versão, e declarado como tal no Inspector.
defineProps<{ item: { n: string; p: string } }>()
</script>

<template>
  <div class="w-full overflow-hidden rounded-lg border border-default bg-elevated">
    <div class="grid aspect-[3/4] place-items-center bg-muted text-dimmed">
      <UIcon name="i-lucide-gamepad-2" class="size-8" />
    </div>
    <div class="px-2.5 py-2">
      <div class="text-[13px] font-semibold text-highlighted">{{ item.n }}</div>
      <div class="text-[11px] text-muted">{{ item.p }}</div>
    </div>
  </div>
</template>
```

- [ ] **Step 4: Reescrever o `BlockRenderer` como render function recursiva**

Substituir `src/builder/BlockRenderer.vue` inteiro por:

```vue
<script lang="ts">
// RENDERER — desenha a árvore de um bloco. Não sabe nada de edição.
// É este código que o site real vai usar em produção; o Editor some.
//
// Render function, não <template>: a quantidade de slots é dinâmica e um
// `v-if` dentro de <component> não resolve isso — ele declara o slot SEMPRE.
import { defineComponent, h, type Component, type PropType, type VNode } from 'vue'
import { nuxtUiComponents } from '../ds/nuxt-ui-components.generated'
import CarouselSlide from './CarouselSlide.vue'
import { findPiece } from './catalog'
import type { SlotChild } from './types'

type Scope = Record<string, unknown> | undefined

function renderNode(node: SlotChild, stretch: boolean, scope: Scope): VNode {
  // Texto é conteúdo puro, não componente do DS — resolvido antes do manifesto.
  if (node.piece === 'texto') return h('span', String(node.props.text ?? ''))

  const piece = findPiece(node.piece)
  const comp: Component | undefined = piece && nuxtUiComponents[piece.renders]
  // Peça desconhecida vira um vazio em vez de derrubar o ciclo de render do Vue:
  // um erro aqui congela a tela inteira do builder.
  if (!comp) return h('div')

  const props: Record<string, unknown> = { ...node.props }
  if (stretch) props.class = ['w-full', props.class].filter(Boolean)

  // O rodapé do UModal recebe `{ close }`. Sem esta ligação, Cancelar e
  // Confirmar não fecham nada e o comportamento fica pela metade.
  if (node.action === 'close' && typeof scope?.close === 'function') {
    props.onClick = scope.close as () => void
  }

  // Slide do carrossel: scoped slot fixo (ver CarouselSlide.vue).
  if (piece?.fixedSlide) {
    return h(comp, props, {
      default: (s: { item: { n: string; p: string } }) => [h(CarouselSlide, { item: s.item })],
    })
  }

  // REGRA: slot vazio NUNCA é declarado. Componentes de formulário (UInput,
  // USelect…) quebram com "Cannot set properties of null" ao receber um slot
  // default vazio. Lição já paga uma vez — não repetir.
  const slots: Record<string, (s: Scope) => VNode[]> = {}
  for (const [key, children] of Object.entries(node.slots ?? {})) {
    if (!children?.length) continue
    slots[key] = (childScope: Scope) => children.map((c) => renderNode(c, false, childScope))
  }

  // Slot de texto fixo do catálogo (ex.: a tecla do UKbd), só se o slot default
  // não tiver sido preenchido por filhos.
  if (piece?.slot && !slots.default) slots.default = () => [h('span', piece.slot!)]

  return Object.keys(slots).length ? h(comp, props, slots) : h(comp, props)
}

export default defineComponent({
  name: 'BlockRenderer',
  props: {
    block: { type: Object as PropType<SlotChild>, required: true },
    stretch: { type: Boolean, default: true },
  },
  render() {
    return renderNode(this.block, this.stretch, undefined)
  },
})
</script>
```

- [ ] **Step 5: Verificar que nada regrediu**

Run: `npm run check:ds`
Expected: PASS

Run: `npm run build`
Expected: build conclui sem erro

Run: `npm run dev` e abrir no navegador. Arrastar **Botão**, **Campo de texto** e **Cartão** para o palco.
Expected: os três renderizam como antes. O Campo de texto **não** pode lançar `Cannot set properties of null` no console — é a regressão que esta task mais arrisca.

- [ ] **Step 6: Commit**

```bash
git add src/builder/types.ts src/builder/BlockRenderer.vue src/builder/CarouselSlide.vue src/builder/catalog.ts
git commit -m "feat: bloco vira árvore de slots e renderer vira recursivo

SlotChild separado de LayoutBlock: só a raiz ocupa colunas. O renderer passa
a render function porque a quantidade de slots é dinâmica, e mantém a regra
de nunca declarar slot vazio."
```

---

### Task 3: Peças de comportamento no catálogo, com semente

**Files:**
- Modify: `src/builder/catalog.ts` (grupo novo + 8 peças + `UFieldGroup`)
- Modify: `src/App.vue:63-82` (função `insert`, para materializar a semente)

**Interfaces:**
- Consumes: `ChildSeed`, `SlotChild`, `newId()` de `./types`; `Piece.seed` da Task 2
- Produces: `function materializeSeed(seed?: Record<string, ChildSeed[]>): Record<string, SlotChild[]> | undefined` exportada de `src/builder/catalog.ts`

- [ ] **Step 1: Abrir o grupo `Sobreposição` no tipo `Piece`**

Em `src/builder/catalog.ts`, na propriedade `group`:

```ts
  group: 'Ação' | 'Formulário' | 'Navegação' | 'Conteúdo' | 'Sinalização' | 'Sobreposição' | 'Nacional'
```

- [ ] **Step 2: Escrever a função que transforma semente em filhos reais**

No fim de `src/builder/catalog.ts`, antes dos exports auxiliares:

```ts
/**
 * Semente → filhos reais. A semente não tem `id` de propósito: dois blocos
 * soltos a partir da mesma peça precisam de ids distintos, senão o `:key` do
 * Vue e a seleção passam a confundir um com o outro.
 */
export function materializeSeed(
  seed?: Record<string, ChildSeed[]>,
): Record<string, SlotChild[]> | undefined {
  if (!seed) return undefined
  const out: Record<string, SlotChild[]> = {}
  for (const [slot, children] of Object.entries(seed)) {
    out[slot] = children.map((c) => ({
      ...c,
      id: newId(),
      props: { ...c.props },
      slots: materializeSeed(c.slots),
    }))
  }
  return out
}
```

E **substituir** o import de tipos criado na Task 2 (`import type { ChildSeed }
from './types'`) por este — importar `ChildSeed` duas vezes é erro de compilação:

```ts
import { newId, type ChildSeed, type SlotChild } from './types'
```

- [ ] **Step 3: Acrescentar as peças de sobreposição**

Em `src/builder/catalog.ts`, uma seção nova antes de `// ── Sinalização`:

```ts
  // ── Sobreposição ────────────────────────────────────────────────────────
  // Estas peças são a razão desta rodada: o comportamento delas vive em SLOTS,
  // e cada uma cai no palco já montada — gatilho, corpo e rodapé — do jeito que
  // a story correspondente do Storybook do DS demonstra.
  {
    key: 'UModal', label: 'Modal', group: 'Sobreposição', renders: 'UModal', defaultSpan: 3,
    slots: [
      { key: 'default', label: 'Gatilho' },
      { key: 'body', label: 'Corpo' },
      { key: 'footer', label: 'Rodapé' },
    ],
    pure: {
      description: 'UModal do DS — o slot default é o gatilho que abre o diálogo.',
      props: { title: 'Modal title', description: 'Conteúdo do modal.' },
    },
    seed: {
      default: [{ piece: 'UButton', props: { label: 'Abrir modal', color: 'primary' } }],
      footer: [
        { piece: 'UButton', props: { label: 'Cancelar', color: 'neutral', variant: 'outline' }, action: 'close' },
        { piece: 'UButton', props: { label: 'Confirmar', color: 'primary' }, action: 'close' },
      ],
    },
    fields: [
      { key: 'title', label: 'Título', type: 'text' },
      { key: 'description', label: 'Descrição', type: 'text' },
      { key: 'fullscreen', label: 'Tela cheia', type: 'boolean' },
      { key: 'dismissible', label: 'Fecha ao clicar fora', type: 'boolean' },
    ],
  },
  {
    key: 'UDrawer', label: 'Painel deslizante', group: 'Sobreposição', renders: 'UDrawer', defaultSpan: 3,
    slots: [{ key: 'default', label: 'Gatilho' }, { key: 'body', label: 'Corpo' }],
    pure: {
      description: 'UDrawer do DS — desliza a partir de uma borda. Bet slip, filtros, menu no mobile.',
      props: { title: 'Cupom de aposta', description: '2 seleções' },
    },
    seed: {
      default: [{ piece: 'UButton', props: { label: 'Abrir cupom', icon: 'i-lucide-ticket', color: 'primary' } }],
      body: [{ piece: 'texto', props: { text: 'Conteúdo do painel.' } }],
    },
    fields: [
      { key: 'title', label: 'Título', type: 'text' },
      { key: 'direction', label: 'Lado', type: 'select', options: ['bottom', 'top', 'left', 'right'] },
    ],
  },
  {
    key: 'UDropdownMenu', label: 'Menu de ações', group: 'Sobreposição', renders: 'UDropdownMenu', defaultSpan: 2,
    slots: [{ key: 'default', label: 'Gatilho' }],
    pure: {
      description: 'UDropdownMenu do DS — o conteúdo vem da prop items (array de grupos), não de slots.',
      props: {
        items: [
          [
            { label: 'Minha conta', icon: 'i-lucide-user' },
            { label: 'Minhas apostas', icon: 'i-lucide-ticket' },
            { label: 'Depósito', icon: 'i-lucide-wallet' },
          ],
          [
            { label: 'Configurações', icon: 'i-lucide-settings' },
            { label: 'Sair', icon: 'i-lucide-log-out', color: 'error' },
          ],
        ],
      },
    },
    seed: {
      default: [{
        piece: 'UButton',
        props: { label: 'Conta', icon: 'i-lucide-user', color: 'neutral', variant: 'subtle', trailingIcon: 'i-lucide-chevron-down' },
      }],
    },
    fields: [],
  },
  {
    key: 'UTooltip', label: 'Dica', group: 'Sobreposição', renders: 'UTooltip', defaultSpan: 2,
    slots: [{ key: 'default', label: 'Elemento' }],
    pure: {
      description: 'UTooltip do DS — abre no hover do elemento no slot default.',
      props: { text: 'Odds em tempo real', arrow: true },
    },
    seed: {
      default: [{
        piece: 'UButton',
        props: { label: 'Passe o mouse', icon: 'i-lucide-info', color: 'neutral', variant: 'subtle' },
      }],
    },
    fields: [
      { key: 'text', label: 'Texto da dica', type: 'text' },
      { key: 'arrow', label: 'Seta', type: 'boolean' },
    ],
  },
  {
    key: 'UPopover', label: 'Balão', group: 'Sobreposição', renders: 'UPopover', defaultSpan: 2,
    slots: [{ key: 'default', label: 'Gatilho' }, { key: 'content', label: 'Conteúdo' }],
    pure: { description: 'UPopover do DS — painel ancorado que abre no clique do gatilho.', props: {} },
    seed: {
      default: [{ piece: 'UButton', props: { label: 'Abrir balão', color: 'neutral', variant: 'subtle' } }],
      content: [{ piece: 'texto', props: { text: 'Conteúdo do balão.' } }],
    },
    fields: [],
  },
```

- [ ] **Step 4: Acrescentar `UChip` e `UFieldGroup` (os que precisavam de filhos)**

Na seção `// ── Sinalização`, junto de `UBadge`:

```ts
  {
    key: 'UChip', label: 'Indicador de canto', group: 'Sinalização', renders: 'UChip', defaultSpan: 1,
    slots: [{ key: 'default', label: 'Elemento' }],
    pure: {
      description: 'UChip do DS — ponto ou contador sobreposto a outro elemento. Não confundir com Etiqueta (Badge).',
      props: { color: 'error', text: '3', position: 'top-right' },
    },
    seed: {
      default: [{ piece: 'UButton', props: { icon: 'i-lucide-bell', color: 'neutral', variant: 'subtle' } }],
    },
    fields: [
      { key: 'text', label: 'Número (vazio = ponto)', type: 'text' },
      F.color,
      { key: 'position', label: 'Canto', type: 'select', options: ['top-right', 'bottom-right', 'top-left', 'bottom-left'] },
    ],
  },
```

E na seção `// ── Ação`, junto de `UButton`:

```ts
  {
    // UButtonGroup NÃO existe no @nuxt/ui 4.9.0 — foi renomeado para UFieldGroup.
    // A altura zero que o comentário antigo atribuía à falta de filhos vinha, na
    // verdade, de o componente não existir no manifesto.
    key: 'UFieldGroup', label: 'Grupo de botões', group: 'Ação', renders: 'UFieldGroup', defaultSpan: 4,
    slots: [{ key: 'default', label: 'Botões' }],
    pure: { description: 'UFieldGroup do DS — encosta botões ou campos num grupo único.', props: {} },
    seed: {
      default: [
        { piece: 'UButton', props: { label: '1.85', color: 'neutral', variant: 'soft' } },
        { piece: 'UButton', props: { label: '3.20', color: 'neutral', variant: 'soft' } },
        { piece: 'UButton', props: { label: '4.10', color: 'neutral', variant: 'soft' } },
      ],
    },
    fields: [F.size],
  },
```

- [ ] **Step 5: Acrescentar `UCarousel` e dar slots ao `UCard`**

Na seção `// ── Conteúdo`:

```ts
  {
    key: 'UCarousel', label: 'Carrossel', group: 'Conteúdo', renders: 'UCarousel', defaultSpan: 8,
    fixedSlide: true,
    pure: {
      description: 'UCarousel do DS (base Embla) — rail de jogos. O slide é fixo nesta versão.',
      props: {
        items: [
          { n: 'Aviator', p: 'Spribe' }, { n: 'Gates of Olympus', p: 'Pragmatic' },
          { n: 'Fortune Tiger', p: 'PG Soft' }, { n: 'Sweet Bonanza', p: 'Pragmatic' },
          { n: 'Mahjong Ways', p: 'PG Soft' }, { n: 'Spaceman', p: 'Pragmatic' },
        ],
        arrows: true,
        ui: { item: 'basis-1/3', container: 'gap-3' },
      },
    },
    fields: [
      { key: 'arrows', label: 'Setas', type: 'boolean' },
      { key: 'dots', label: 'Indicadores', type: 'boolean' },
      { key: 'loop', label: 'Loop infinito', type: 'boolean' },
      { key: 'align', label: 'Alinhamento', type: 'select', options: ['start', 'center', 'end'] },
    ],
  },
```

E substituir a peça `UCard` existente por uma com slots e semente:

```ts
  {
    key: 'UCard', label: 'Cartão', group: 'Conteúdo', renders: 'UCard', defaultSpan: 4,
    slots: [
      { key: 'header', label: 'Cabeçalho' },
      { key: 'default', label: 'Corpo' },
      { key: 'footer', label: 'Rodapé' },
    ],
    pure: {
      description: 'UCard do DS — cabeçalho, corpo e rodapé.',
      props: { variant: 'outline', title: 'Flamengo x Palmeiras', description: 'Brasileirão · Hoje 21:30' },
    },
    seed: {
      default: [{ piece: 'texto', props: { text: 'Mercado: Resultado final (1X2).' } }],
      footer: [{ piece: 'texto', props: { text: 'Ver mercados' } }],
    },
    fields: [
      { key: 'title', label: 'Título', type: 'text' },
      { key: 'description', label: 'Descrição', type: 'text' },
      { key: 'variant', label: 'Variante', type: 'select', options: ['outline', 'soft', 'subtle', 'solid'] },
    ],
  },
```

Remover a propriedade `slot: 'Conteúdo do cartão'` da peça antiga do cartão — o corpo agora vem da semente.

- [ ] **Step 6: Fazer o drop materializar a semente**

Em `src/App.vue`, na função `insert`, acrescentar a linha de `slots` na criação do bloco:

```ts
  const block: LayoutBlock = {
    id: newId(),
    piece: piece.key,
    mode,
    props: { ...source.props },
    slots: materializeSeed(piece.seed),
    positions: { 1440: convert(pos, here, gridFor(1440).columns) },
  }
```

E acrescentar `materializeSeed` ao import de `./builder/catalog`:

```ts
import { findPiece, materializeSeed, type Piece } from './builder/catalog'
```

- [ ] **Step 7: Verificar peça por peça no navegador**

Run: `npm run check:ds` → PASS
Run: `npm run build` → sem erro
Run: `npm run dev`

Arrastar cada uma para o palco e conferir que **renderiza com altura visível** (não some):
Modal, Painel deslizante, Menu de ações, Dica, Balão, Indicador de canto, Grupo de botões, Carrossel, Cartão.

Expected: as nove aparecem. O Modal mostra o botão "Abrir modal"; o Grupo de botões mostra 1.85/3.20/4.10 encostados; o Carrossel mostra cards de jogo; o Indicador de canto mostra o sino com o "3" vermelho.
Console: **zero** erros de render.

Ainda **não** é esperado que clicar abra o modal — isso é a Task 4.

- [ ] **Step 8: Commit**

```bash
git add src/builder/catalog.ts src/App.vue
git commit -m "feat: peças de comportamento caem no palco já montadas

Modal, Drawer, DropdownMenu, Tooltip, Popover, Chip, FieldGroup, Carousel e
Card, com semente de filhos espelhando as stories do Storybook do DS.
UFieldGroup no lugar de UButtonGroup, que não existe no @nuxt/ui 4.9."
```

---

### Task 4: Modo Editar / Testar

Sem isto, comportamento e edição brigam: se o Modal abre ao clique, o bloco não pode mais ser selecionado nem arrastado.

**Files:**
- Modify: `src/App.vue` (estado `modo`, atalho de teclado, passagem para Topbar/Stage)
- Modify: `src/builder/Topbar.vue` (botões)
- Modify: `src/builder/Stage.vue` (escudo, draggable, alças, malha)

**Interfaces:**
- Consumes: nada de tasks anteriores
- Produces: `type Modo = 'editar' | 'testar'` exportado de `src/builder/types.ts`; prop `modo: Modo` em `Topbar` e `Stage`; evento `update:modo` no `Topbar`

- [ ] **Step 1: Declarar o tipo**

No fim de `src/builder/types.ts`:

```ts
/**
 * Editar: o clique seleciona o bloco e os componentes ficam inertes.
 * Testar: o clique chega ao componente e o comportamento roda de verdade.
 * Sem esta separação, um Modal que abre ao clique impede mover o próprio bloco.
 */
export type Modo = 'editar' | 'testar'
```

- [ ] **Step 2: Estado e atalho no App**

Em `src/App.vue`, junto dos outros refs de estado (perto de `const magnet = ref(true)`):

```ts
const modo = ref<Modo>('editar')
```

Acrescentar `Modo` ao import de `./builder/types`.

Em `onKey`, junto dos atalhos `g`/`c`/`m`:

```ts
  if (e.key === 'p' || e.key === 'P') modo.value = modo.value === 'editar' ? 'testar' : 'editar'
```

E no `<template>`, passar para os dois componentes:

```html
    <Topbar
      v-model:brand="brand"
      v-model:show-grid="showGrid"
      v-model:show-columns="showColumns"
      v-model:magnet="magnet"
      v-model:modo="modo"
      ...
```

```html
      <Stage
        :blocks="blocks"
        :modo="modo"
        ...
```

- [ ] **Step 3: Botões no Topbar**

Em `src/builder/Topbar.vue`, acrescentar `modo: Modo` às props, `'update:modo': [Modo]` aos emits, e importar `type Modo` de `./types`.

No template, logo depois do `<span>Nacional · Builder</span>`:

```html
    <div class="flex items-center gap-1">
      <button
        v-for="m in (['editar', 'testar'] as const)"
        :key="m"
        class="rounded-md px-2 py-1 text-sm capitalize"
        :class="modo === m ? 'bg-primary text-inverted' : 'border border-default text-highlighted hover:border-primary'"
        :title="m === 'editar'
          ? 'Editar (P) — o clique seleciona o bloco'
          : 'Testar (P) — o clique aciona o componente: modal abre, carrossel navega'"
        @click="$emit('update:modo', m)"
      >
        {{ m }}
      </button>
    </div>
```

- [ ] **Step 4: Stage obedece ao modo**

Em `src/builder/Stage.vue`:

Acrescentar às props (`defineProps`):

```ts
  /** 'editar' = clique seleciona · 'testar' = clique vai para o componente. */
  modo: Modo
```

e ao import de `./types`: `type Modo`.

Acrescentar um computed logo depois de `const grid = computed(...)`:

```ts
/** Em Testar o palco vira preview: sem malha, sem alças, sem seleção. */
const editando = computed(() => props.modo === 'editar')
```

Trocar, no template:

- `<template v-if="showGrid">` → `<template v-if="showGrid && editando">`
- `<template v-if="showColumns">` → `<template v-if="showColumns && editando">`
- `<template v-if="positioned">` (as alças e o botão remover, linha ~357) → `<template v-if="editando">`
- No wrapper do bloco: `draggable="true"` → `:draggable="editando"`
- No wrapper do bloco: `@click.stop="emit('select', block.id)"` → `@click.stop="editando && emit('select', block.id)"`
- Na raiz do palco: `@click="emit('select', null)"` → `@click="editando && emit('select', null)"`

E acrescentar o **escudo**, logo depois do `<div :ref="measure" ...>` que envolve o `BlockRenderer` e antes da borda de seleção:

```html
            <!-- ESCUDO — em Editar, o clique é do builder, não do componente:
                 sem isto, clicar no gatilho do Modal abriria o modal em vez de
                 selecionar o bloco, e a peça ficaria impossível de posicionar.
                 O arrasto continua funcionando: `draggable` está no wrapper. -->
            <div v-if="editando" class="absolute inset-0 z-10" />
```

- [ ] **Step 5: Verificar os dois modos no navegador**

Run: `npm run dev`

Em **Editar**: arrastar um Modal para o palco. Clicar no botão "Abrir modal".
Expected: o bloco é **selecionado** (borda tracejada, Inspector preenche) e o modal **não** abre. Arrastar o bloco funciona.

Trocar para **Testar** (botão ou tecla `P`). Clicar no botão "Abrir modal".
Expected: o modal **abre**. Clicar em "Cancelar" **fecha**. A malha e as alças sumiram.

Repetir em Testar com: Painel deslizante (desliza), Menu de ações (abre com os itens), Dica (aparece no hover), Carrossel (as setas navegam).

Voltar para Editar.
Expected: seleção volta a funcionar; a malha reaparece.

- [ ] **Step 6: Commit**

```bash
git add src/App.vue src/builder/Topbar.vue src/builder/Stage.vue src/builder/types.ts
git commit -m "feat: modo Editar/Testar no palco

Em Editar um escudo intercepta o clique para o builder; em Testar o clique
chega ao componente e o comportamento roda. Sem isso, um Modal que abre ao
clique tornaria o próprio bloco impossível de selecionar e mover."
```

---

### Task 5: Gerador do manifesto do Storybook

**Files:**
- Create: `scripts/gen-ds-manifest.mjs`
- Create: `test/gen-ds-manifest.test.mjs`
- Create (gerado): `src/ds/storybook-manifest.generated.ts`
- Modify: `package.json` (scripts `gen:ds` e `test`)

**Interfaces:**
- Consumes: `typescript` (devDependency já instalada), `DS_ROOT` do ambiente
- Produces:
  - `export function extractMeta(source: string): StoryMeta | null` de `scripts/gen-ds-manifest.mjs`
  - `StoryMeta = { title: string, component: string, description: string｜null, args: object, argTypes: Record<string, {control: string, options?: string[], description?: string}>, stories: string[] }`
  - `export const DS_MANIFEST: Record<string, StoryMeta>` em `src/ds/storybook-manifest.generated.ts`, indexado pela folha do título (`'Modal'`, `'Button'`, `'Card'`)

- [ ] **Step 1: Escrever os testes que falham**

Create `test/gen-ds-manifest.test.mjs`:

```js
import test from 'node:test'
import assert from 'node:assert/strict'
import { extractMeta } from '../scripts/gen-ds-manifest.mjs'

test('lê título, args e argTypes de um meta simples', () => {
  const meta = extractMeta(`
    const meta = {
      title: 'Components/Modal',
      argTypes: {
        title: { control: 'text' },
        fullscreen: { control: 'boolean', description: 'Tela cheia' },
      },
      args: { title: 'Modal title', fullscreen: false },
    }
    export default meta
    export const Default = {}
    export const Fullscreen = {}
  `)
  assert.equal(meta.title, 'Components/Modal')
  assert.equal(meta.component, 'Modal')
  assert.deepEqual(meta.args, { title: 'Modal title', fullscreen: false })
  assert.equal(meta.argTypes.title.control, 'text')
  assert.equal(meta.argTypes.fullscreen.description, 'Tela cheia')
  assert.deepEqual(meta.stories, ['Default', 'Fullscreen'])
})

test('lê options de um control select', () => {
  const meta = extractMeta(`
    const meta = {
      title: 'Components/Card',
      argTypes: { variant: { control: 'inline-radio', options: ['outline', 'soft'] } },
    }
    export default meta
  `)
  assert.deepEqual(meta.argTypes.variant.options, ['outline', 'soft'])
})

test('story sem argTypes devolve objeto vazio, não erro', () => {
  const meta = extractMeta(`
    const meta = { title: 'Components/Drawer' }
    export default meta
    export const BottomSheet = {}
  `)
  assert.deepEqual(meta.argTypes, {})
  assert.deepEqual(meta.stories, ['BottomSheet'])
})

test('lê a descrição de parameters.docs.description.component', () => {
  const meta = extractMeta(`
    const meta = {
      title: 'Components/Tooltip',
      parameters: { docs: { description: { component: 'Dica em hover.' } } },
    }
    export default meta
  `)
  assert.equal(meta.description, 'Dica em hover.')
})

test('arquivo sem meta devolve null em vez de explodir', () => {
  assert.equal(extractMeta('export const x = 1'), null)
})
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `node --test test/`
Expected: FALHA — `Cannot find module '../scripts/gen-ds-manifest.mjs'`

- [ ] **Step 3: Escrever o gerador**

Create `scripts/gen-ds-manifest.mjs`:

```js
#!/usr/bin/env node
// PONTE COM O STORYBOOK — lê as stories do DS e extrai o que o Inspector precisa:
// valores default (args), controles (argTypes) e a descrição de cada componente.
//
// Parse por AST do TypeScript, não por regex: regex sobre código quebra no
// primeiro objeto aninhado, e aqui todo argType é objeto aninhado.
//
// LIMITAÇÃO CONHECIDA: só 26 das 47 stories do DS declaram argTypes. As outras
// 21 (Drawer, DropdownMenu, Toast, Form entre elas) saem sem controle nenhum, e
// o Inspector cai nos `fields` escritos à mão no catálogo. O relatório impresso
// no fim existe para essa lacuna ficar visível em vez de silenciosa.
import ts from 'typescript'
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)))

/** Converte um nó literal do AST em valor JS. Devolve undefined no que não for literal. */
function literalOf(node) {
  if (!node) return undefined
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text
  if (ts.isNumericLiteral(node)) return Number(node.text)
  if (node.kind === ts.SyntaxKind.TrueKeyword) return true
  if (node.kind === ts.SyntaxKind.FalseKeyword) return false
  if (node.kind === ts.SyntaxKind.NullKeyword) return null
  if (ts.isArrayLiteralExpression(node)) {
    return node.elements.map(literalOf).filter((v) => v !== undefined)
  }
  if (ts.isObjectLiteralExpression(node)) {
    const out = {}
    for (const p of node.properties) {
      if (!ts.isPropertyAssignment(p)) continue
      const key = ts.isIdentifier(p.name) || ts.isStringLiteral(p.name) ? p.name.text : null
      if (!key) continue
      const value = literalOf(p.initializer)
      if (value !== undefined) out[key] = value
    }
    return out
  }
  return undefined
}

/** Acha a propriedade `name` num object literal e devolve o nó do valor. */
function prop(objNode, name) {
  if (!objNode || !ts.isObjectLiteralExpression(objNode)) return undefined
  for (const p of objNode.properties) {
    if (!ts.isPropertyAssignment(p)) continue
    const key = ts.isIdentifier(p.name) || ts.isStringLiteral(p.name) ? p.name.text : null
    if (key === name) return p.initializer
  }
  return undefined
}

/**
 * Extrai o meta de uma story. Exportada para teste — é aqui que mora toda a
 * lógica frágil, e é ela que os testes cobrem.
 */
export function extractMeta(source) {
  const sf = ts.createSourceFile('s.ts', source, ts.ScriptTarget.Latest, true)

  let metaObj = null
  const stories = []

  for (const stmt of sf.statements) {
    // const meta = { ... }
    if (ts.isVariableStatement(stmt)) {
      for (const d of stmt.declarationList.declarations) {
        if (ts.isIdentifier(d.name) && d.name.text === 'meta' && d.initializer) {
          metaObj = ts.isObjectLiteralExpression(d.initializer) ? d.initializer : null
        }
        // export const Default: Story = {}
        const exported = stmt.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)
        if (exported && ts.isIdentifier(d.name) && d.name.text !== 'meta') {
          stories.push(d.name.text)
        }
      }
    }
  }

  if (!metaObj) return null

  const title = literalOf(prop(metaObj, 'title')) ?? ''
  const component = String(title).split('/').pop() ?? ''

  const description =
    literalOf(prop(prop(prop(prop(metaObj, 'parameters'), 'docs'), 'description'), 'component')) ?? null

  const args = literalOf(prop(metaObj, 'args')) ?? {}

  const argTypes = {}
  const argTypesNode = prop(metaObj, 'argTypes')
  if (argTypesNode && ts.isObjectLiteralExpression(argTypesNode)) {
    for (const p of argTypesNode.properties) {
      if (!ts.isPropertyAssignment(p)) continue
      const key = ts.isIdentifier(p.name) || ts.isStringLiteral(p.name) ? p.name.text : null
      if (!key) continue
      const control = literalOf(prop(p.initializer, 'control'))
      // `control` pode vir como objeto ({ type: 'select' }); só o formato string
      // é suportado, e o resto é ignorado de propósito em vez de adivinhado.
      if (typeof control !== 'string') continue
      const entry = { control }
      const options = literalOf(prop(p.initializer, 'options'))
      if (Array.isArray(options)) entry.options = options
      const d = literalOf(prop(p.initializer, 'description'))
      if (typeof d === 'string') entry.description = d
      argTypes[key] = entry
    }
  }

  return { title, component, description, args, argTypes, stories }
}

function main() {
  const DS_ROOT =
    process.env.DS_ROOT ??
    (existsSync(join(ROOT, 'vendor/nacionalbet-ds/tokens.css'))
      ? join(ROOT, 'vendor/nacionalbet-ds')
      : '/Volumes/SSD Interno/Projetos Embrioes/NacionalBet')

  const dir = join(DS_ROOT, 'storybook/src')
  if (!existsSync(dir)) {
    console.error(`[gen:ds] Stories do DS não encontradas em "${dir}".`)
    console.error(`Ajuste DS_ROOT ou rode: git submodule update --init --recursive`)
    process.exit(1)
  }

  const manifest = {}
  const semControles = []

  for (const file of readdirSync(dir).filter((f) => f.endsWith('.stories.ts'))) {
    const meta = extractMeta(readFileSync(join(dir, file), 'utf8'))
    if (!meta?.component) continue
    manifest[meta.component] = meta
    if (!Object.keys(meta.argTypes).length) semControles.push(meta.component)
  }

  const out = `// AUTO-GERADO por scripts/gen-ds-manifest.mjs — NÃO editar à mão.
// Fonte: <DS_ROOT>/storybook/src/*.stories.ts
// ${Object.keys(manifest).length} componentes lidos do Storybook do DS.
//
// O Inspector usa estes campos QUANDO existem; quando o Storybook não declara
// argTypes, ele cai nos \`fields\` escritos à mão em src/builder/catalog.ts.
export interface StoryArgType {
  control: string
  options?: string[]
  description?: string
}
export interface StoryMeta {
  title: string
  component: string
  description: string | null
  args: Record<string, unknown>
  argTypes: Record<string, StoryArgType>
  stories: string[]
}
export const DS_MANIFEST: Record<string, StoryMeta> = ${JSON.stringify(manifest, null, 2)}
`

  writeFileSync(resolve(ROOT, 'src/ds/storybook-manifest.generated.ts'), out)

  console.log(`✓ ${Object.keys(manifest).length} componentes lidos do Storybook do DS.`)
  if (semControles.length) {
    console.log(`\n⚠ ${semControles.length} sem argTypes no Storybook — Inspector cai nos campos manuais:`)
    console.log(`  ${semControles.sort().join(', ')}\n`)
  }
}

// Só roda como script; importado por teste, apenas exporta.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main()
```

- [ ] **Step 4: Rodar os testes e ver passar**

Run: `node --test test/`
Expected: PASS — 5 testes, 0 falhas

- [ ] **Step 5: Registrar os scripts no package.json**

Em `package.json`, na seção `scripts`:

```json
    "gen:ds": "node scripts/gen-ds-manifest.mjs",
    "test": "node --test test/",
```

- [ ] **Step 6: Gerar o manifesto de verdade e ler o relatório**

Run: `npm run gen:ds`
Expected: `✓ 47 componentes lidos do Storybook do DS.` seguido do aviso listando os sem argTypes (`Drawer, DropdownMenu, Form, Toast, …`).

Run: `head -30 src/ds/storybook-manifest.generated.ts`
Expected: `DS_MANIFEST` com a entrada `Modal` contendo `argTypes.fullscreen.control === 'boolean'`

- [ ] **Step 7: Commit**

```bash
git add scripts/gen-ds-manifest.mjs test/gen-ds-manifest.test.mjs src/ds/storybook-manifest.generated.ts package.json
git commit -m "feat: gerador lê args e argTypes das stories do Storybook do DS

Parse por AST do TypeScript. Imprime relatório das 21 stories que não
declaram argTypes, para a lacuna ficar visível em vez de silenciosa."
```

---

### Task 6: Inspector consome o manifesto, entende boolean e mostra a árvore

**Files:**
- Modify: `src/builder/catalog.ts` (campo `story?`, função `fieldsFor`)
- Modify: `src/builder/Inspector.vue`
- Modify: `src/App.vue` (seleção de filho, `setProp` em filho)

**Interfaces:**
- Consumes: `DS_MANIFEST` de `src/ds/storybook-manifest.generated.ts`; `Piece.slots` da Task 2
- Produces:
  - `export function fieldsFor(piece: Piece): Field[]` em `src/builder/catalog.ts`
  - `export function descriptionFor(piece: Piece): string | null`
  - `export function findNode(root: SlotChild, id: string): SlotChild | null` em `src/builder/types.ts`

- [ ] **Step 1: Escrever os testes que falham para `findNode`**

Create `test/find-node.test.mjs`:

```js
import test from 'node:test'
import assert from 'node:assert/strict'
import { findNode } from '../src/builder/find-node.mjs'

const arvore = {
  id: 'b1', piece: 'UModal', props: {},
  slots: {
    default: [{ id: 'c1', piece: 'UButton', props: { label: 'Abrir' } }],
    footer: [
      { id: 'c2', piece: 'UButton', props: { label: 'Cancelar' } },
      { id: 'c3', piece: 'UCard', props: {}, slots: { default: [{ id: 'n1', piece: 'texto', props: {} }] } },
    ],
  },
}

test('acha a raiz', () => assert.equal(findNode(arvore, 'b1').piece, 'UModal'))
test('acha filho direto', () => assert.equal(findNode(arvore, 'c2').props.label, 'Cancelar'))
test('acha neto', () => assert.equal(findNode(arvore, 'n1').piece, 'texto'))
test('id inexistente devolve null', () => assert.equal(findNode(arvore, 'zzz'), null))
test('nó sem slots não quebra', () => {
  assert.equal(findNode({ id: 'x', piece: 'UButton', props: {} }, 'y'), null)
})
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `node --test test/`
Expected: FALHA — `Cannot find module '../src/builder/find-node.mjs'`

- [ ] **Step 3: Implementar `findNode` em módulo testável**

Create `src/builder/find-node.mjs`:

```js
// Busca em profundidade na árvore de um bloco. Em .mjs, não .ts, porque o
// runner nativo do Node não transpila TypeScript e este é o tipo de função
// que merece teste de verdade: o Inspector inteiro depende dela para achar
// qual filho está selecionado.
export function findNode(root, id) {
  if (!root) return null
  if (root.id === id) return root
  for (const children of Object.values(root.slots ?? {})) {
    for (const c of children) {
      const hit = findNode(c, id)
      if (hit) return hit
    }
  }
  return null
}
```

E reexportar com tipos em `src/builder/types.ts`:

```ts
export { findNode } from './find-node.mjs'
```

Se o TypeScript reclamar da importação `.mjs` sem tipos, criar `src/builder/find-node.d.mts`:

```ts
import type { SlotChild } from './types'
export declare function findNode(root: SlotChild | null, id: string): SlotChild | null
```

- [ ] **Step 4: Rodar os testes e ver passar**

Run: `node --test test/`
Expected: PASS — 10 testes no total (5 do gerador + 5 do findNode), 0 falhas

- [ ] **Step 5: Ligar o catálogo ao manifesto do Storybook**

Em `src/builder/catalog.ts`, importar o manifesto e acrescentar em `interface Piece`:

```ts
  /** Nome da story no Storybook do DS. Default: a chave sem o "U" inicial. */
  story?: string
```

Acrescentar ao **topo** do arquivo, junto dos outros imports (import em ESM não
pode ficar no fim do arquivo):

```ts
import { DS_MANIFEST } from '../ds/storybook-manifest.generated'
```

E no fim do arquivo, as funções:

```ts
/** Mapa de control do Storybook → tipo de campo do Inspector. */
const CONTROL_TO_FIELD: Record<string, Field['type']> = {
  text: 'text',
  boolean: 'boolean',
  select: 'select',
  'inline-radio': 'select',
  radio: 'select',
}

const storyOf = (piece: Piece) => DS_MANIFEST[piece.story ?? piece.key.replace(/^U/, '')]

/**
 * Campos do Inspector. O Storybook manda QUANDO documenta; senão valem os
 * `fields` escritos à mão. Não inventamos controle que o DS não declara —
 * 21 das 47 stories não têm argTypes nenhum.
 */
export function fieldsFor(piece: Piece): Field[] {
  const meta = storyOf(piece)
  if (!meta) return piece.fields
  const doStorybook: Field[] = []
  for (const [key, at] of Object.entries(meta.argTypes)) {
    const type = CONTROL_TO_FIELD[at.control]
    if (!type) continue
    if (type === 'select') {
      if (!at.options?.length) continue
      doStorybook.push({ key, label: at.description || key, type: 'select', options: at.options })
    } else {
      doStorybook.push({ key, label: at.description || key, type })
    }
  }
  if (!doStorybook.length) return piece.fields
  // Campos manuais que o Storybook não cobre continuam valendo.
  const vistos = new Set(doStorybook.map((f) => f.key))
  return [...doStorybook, ...piece.fields.filter((f) => !vistos.has(f.key))]
}

/** Descrição do componente, direto do Storybook do DS quando existe. */
export function descriptionFor(piece: Piece): string | null {
  return storyOf(piece)?.description ?? null
}
```

- [ ] **Step 6: Inspector — boolean, campos do manifesto, e a árvore**

Em `src/builder/Inspector.vue`:

Trocar o import:

```ts
import { descriptionFor, fieldsFor, findPiece } from './catalog'
import { findNode, gridFor, type Align, type Breakpoint, type LayoutBlock, type Position, type SlotChild } from './types'
```

Acrescentar props e emits:

```ts
const props = defineProps<{
  block: LayoutBlock | null
  breakpoint: Breakpoint
  pos: Position | null
  ownedBy: Breakpoint | null
  positioned: boolean
  /** Id do nó em edição — a raiz, ou um filho dentro de um slot. */
  nodeId: string | null
}>()

const emit = defineEmits<{
  patch: [Partial<Position>]
  prop: [key: string, value: unknown]
  reset: []
  remove: []
  pickNode: [id: string]
}>()
```

Acrescentar computeds:

```ts
/** O nó realmente em edição: a raiz por padrão, ou o filho escolhido na árvore. */
const node = computed<SlotChild | null>(() =>
  props.block ? (props.nodeId ? findNode(props.block, props.nodeId) : props.block) : null,
)
const nodePiece = computed(() => (node.value ? findPiece(node.value.piece) : undefined))
const campos = computed(() => (nodePiece.value ? fieldsFor(nodePiece.value) : []))
const descricao = computed(() => (nodePiece.value ? descriptionFor(nodePiece.value) : null))

/** Linhas do outline: slot → filhos, um nível de indentação por profundidade. */
interface Linha { id: string; label: string; depth: number; slot?: string }
function outlineOf(n: SlotChild, depth = 0): Linha[] {
  const out: Linha[] = []
  for (const [slot, children] of Object.entries(n.slots ?? {})) {
    const rotulo = findPiece(n.piece)?.slots?.find((s) => s.key === slot)?.label ?? slot
    out.push({ id: `slot:${slot}:${n.id}`, label: rotulo, depth, slot })
    for (const c of children) {
      out.push({ id: c.id, label: findPiece(c.piece)?.label ?? c.piece, depth: depth + 1 })
      out.push(...outlineOf(c, depth + 2))
    }
  }
  return out
}
const outline = computed(() => (props.block ? outlineOf(props.block) : []))
```

No template, substituir a `<section v-if="piece?.fields.length">` inteira por:

```html
      <section v-if="outline.length" class="border-b border-default p-4">
        <h3 class="mb-2 text-xs font-medium uppercase tracking-wide text-muted">Conteúdo</h3>
        <button
          class="mb-1 block w-full rounded px-1.5 py-1 text-left text-xs"
          :class="!nodeId || nodeId === block.id ? 'bg-primary text-inverted' : 'text-highlighted hover:bg-default'"
          @click="emit('pickNode', block.id)"
        >
          {{ piece?.label ?? block.piece }}
        </button>
        <template v-for="l in outline" :key="l.id">
          <p v-if="l.slot" class="px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-dimmed"
             :style="{ paddingLeft: 6 + l.depth * 10 + 'px' }">
            {{ l.label }}
          </p>
          <button
            v-else
            class="block w-full rounded px-1.5 py-1 text-left text-xs"
            :class="nodeId === l.id ? 'bg-primary text-inverted' : 'text-highlighted hover:bg-default'"
            :style="{ paddingLeft: 6 + l.depth * 10 + 'px' }"
            @click="emit('pickNode', l.id)"
          >
            {{ l.label }}
          </button>
        </template>
      </section>

      <section v-if="campos.length || descricao" class="border-b border-default p-4">
        <h3 class="mb-1 text-xs font-medium uppercase tracking-wide text-muted">
          {{ nodePiece?.label }}
        </h3>
        <p v-if="descricao" class="mb-3 text-[11px] leading-snug text-dimmed">{{ descricao }}</p>
        <p v-if="nodePiece?.fixedSlide" class="mb-3 text-[11px] leading-snug text-warning">
          O slide deste carrossel é fixo nesta versão — o conteúdo vem de um scoped slot,
          que ainda não é editável aqui.
        </p>
        <div v-if="node" class="flex flex-col gap-3">
          <label v-for="f in campos" :key="f.key" class="text-xs text-muted">
            <template v-if="f.type === 'boolean'">
              <span class="flex items-center gap-2">
                <input
                  type="checkbox"
                  class="accent-primary"
                  :checked="Boolean(node.props[f.key])"
                  @change="emit('prop', f.key, ($event.target as HTMLInputElement).checked)"
                />
                {{ f.label }}
              </span>
            </template>
            <template v-else>
              {{ f.label }}
              <input
                v-if="f.type === 'text'"
                type="text"
                :value="node.props[f.key] ?? ''"
                class="mt-1 w-full rounded-md border border-default bg-default px-2 py-1 text-sm text-highlighted"
                @input="emit('prop', f.key, ($event.target as HTMLInputElement).value)"
              />
              <select
                v-else
                :value="node.props[f.key] ?? ''"
                class="mt-1 w-full rounded-md border border-default bg-default px-2 py-1 text-sm text-highlighted"
                @change="emit('prop', f.key, ($event.target as HTMLSelectElement).value)"
              >
                <option value="">padrão do DS</option>
                <option v-for="o in f.options" :key="o" :value="o">{{ o }}</option>
              </select>
            </template>
          </label>
        </div>
      </section>
```

- [ ] **Step 7: App passa o nó selecionado e escreve nele**

Em `src/App.vue`:

```ts
const nodeId = ref<string | null>(null)
```

Trocar `setProp` para escrever no nó em edição, não sempre na raiz:

```ts
function setProp(key: string, value: unknown) {
  const block = blocks.value.find((b) => b.id === selected.value)
  if (!block) return
  // O Inspector pode estar editando um FILHO (o botão dentro do Modal, por
  // exemplo). Escrever sempre na raiz mudaria a peça errada.
  const alvo = nodeId.value ? findNode(block, nodeId.value) : block
  if (!alvo) return
  if (value === '' || value === undefined) delete alvo.props[key]
  else alvo.props[key] = value
}
```

Acrescentar `findNode` ao import de `./builder/types`.

Trocar de bloco zera o nó em edição:

```ts
watch(selected, () => { nodeId.value = null })
```

(acrescentar `watch` ao import de `vue`)

E no template do Inspector:

```html
      <Inspector
        ...
        :node-id="nodeId"
        @pick-node="nodeId = $event"
      />
```

- [ ] **Step 8: Verificar no navegador**

Run: `npm run test` → PASS (10 testes)
Run: `npm run check:ds` → PASS
Run: `npm run build` → sem erro
Run: `npm run dev`

- Arrastar um **Modal**, selecionar. O Inspector mostra "Conteúdo" com `Gatilho → Botão` e `Rodapé → Botão, Botão`.
- Clicar no `Botão` sob Gatilho. Trocar o campo Texto para `Abrir cupom`.
  Expected: o botão no palco muda; o título do modal **não** muda.
- Selecionar a raiz (Modal) e marcar a caixa **Tela cheia**.
  Expected: em Testar, o modal abre em tela cheia.
- Selecionar um **Cartão**. Conferir que a descrição vinda do Storybook aparece em cinza sob o nome.

- [ ] **Step 9: Commit**

```bash
git add src/builder/catalog.ts src/builder/Inspector.vue src/builder/types.ts src/builder/find-node.mjs src/builder/find-node.d.mts src/App.vue test/find-node.test.mjs
git commit -m "feat: Inspector lê o Storybook, entende boolean e edita filhos

Campos vêm do manifesto quando o Storybook documenta e caem nos manuais
quando não. Outline permite selecionar um filho dentro de um slot."
```

---

### Task 7: Publicar no GitHub Pages

**Files:**
- Create: `.gitmodules` (via `git submodule add`)
- Modify: `vite.config.ts`
- Create: `.github/workflows/deploy.yml`
- Create: `README.md`

**Interfaces:**
- Consumes: tudo das tasks anteriores
- Produces: site em `https://cbitran.github.io/nacional-builder/`

- [ ] **Step 1: Confirmar que o remoto do DS está acessível antes de qualquer escrita**

Run: `git -C "/Volumes/SSD Interno/Projetos Embrioes/NacionalBet" remote -v`
Expected: `origin https://github.com/cbitran/nacionalbet-ds.git`

Run: `git ls-remote https://github.com/cbitran/nacionalbet-ds.git | head -3`
Expected: lista de refs — confirma que o CI vai conseguir clonar

- [ ] **Step 2: Adicionar o DS como submodule**

```bash
git submodule add https://github.com/cbitran/nacionalbet-ds.git vendor/nacionalbet-ds
git submodule update --init --recursive
ls vendor/nacionalbet-ds/tokens.css
```

Expected: o arquivo existe.

Remover a linha `vendor/` do `.gitignore` — ela foi posta antes do submodule existir e impediria o `.gitmodules` de funcionar.

- [ ] **Step 3: `vite.config.ts` resolve o DS em três níveis**

Substituir o bloco de `DS_ROOT` por:

```ts
// FONTE DA VERDADE: o Design System vive no repo nacionalbet-ds e NÃO é copiado
// pra cá. Três origens, nesta ordem:
//   1. DS_ROOT no ambiente — escapatória para quem tem o repo noutro lugar
//   2. vendor/nacionalbet-ds — o submodule; é por aqui que o CI resolve
//   3. o caminho local do SSD — o ambiente de desenvolvimento do Celio
// Se nenhuma existir, o build para com erro explícito em vez de rodar com
// tokens velhos.
const CANDIDATES = [
  process.env.DS_ROOT,
  resolve(__dirname, 'vendor/nacionalbet-ds'),
  '/Volumes/SSD Interno/Projetos Embrioes/NacionalBet',
].filter(Boolean) as string[]

const DS_ROOT = CANDIDATES.find((p) => existsSync(resolve(p, 'tokens.css')))

if (!DS_ROOT) {
  throw new Error(
    `[builder] Design System não encontrado.\n` +
    `Procurado em:\n${CANDIDATES.map((p) => `  - ${p}`).join('\n')}\n` +
    `O builder não tem tokens próprios de propósito — ele lê os do DS.\n` +
    `Rode: git submodule update --init --recursive`
  )
}
```

E no `defineConfig`, acrescentar o `base`:

```ts
export default defineConfig({
  // O Pages serve em /nacional-builder/, não na raiz do domínio. Sem base
  // explícito, os assets são pedidos em / e a página sobe em branco.
  base: process.env.BUILD_BASE ?? '/nacional-builder/',
  plugins: [vue(), ui()],
  ...
```

Acrescentar `__dirname` ao topo do arquivo (o projeto é ESM):

```ts
import { fileURLToPath } from 'node:url'
const __dirname = dirname(fileURLToPath(import.meta.url))
```

e `dirname` ao import de `node:path`.

- [ ] **Step 4: Provar que o `base` está certo ANTES de publicar**

Run: `npm run build`
Run: `grep -o 'src="[^"]*"' dist/index.html`
Expected: `src="/nacional-builder/assets/index-*.js"` — **com** o prefixo. Se sair `src="/assets/...`, o base não pegou e a página publicada subirá em branco.

Run: `npm run preview -- --base=/nacional-builder/` e abrir o endereço mostrado com `/nacional-builder/` no fim.
Expected: o builder carrega, a biblioteca lista as peças, arrastar funciona. Console sem 404 de asset.

- [ ] **Step 5: Workflow do Pages**

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy no GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      # O Design System vem por submodule — sem ele o vite.config para com erro.
      - uses: actions/checkout@v4
        with:
          submodules: recursive

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm

      - run: npm ci

      # Regenera o manifesto a partir do Storybook do DS que veio no submodule,
      # para o que é publicado nunca ficar mais velho que o DS.
      - run: npm run gen:ds
        env:
          DS_ROOT: vendor/nacionalbet-ds

      - run: npm test
      - run: npm run build

      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 6: README com o passo do submodule**

Create `README.md`:

```markdown
# Nacional · Builder

Montador de layout por arrastar e soltar sobre o **nacional.bet Design System**.
As peças vêm do DS; as de comportamento (Modal, Painel deslizante, Menu de ações,
Dica, Balão, Carrossel) caem no palco já montadas e funcionam no modo **Testar**.

No ar: https://cbitran.github.io/nacional-builder/

## Rodar localmente

O Design System **não é copiado** para cá — ele entra como submodule.

```bash
git clone --recurse-submodules https://github.com/cbitran/nacional-builder.git
cd nacional-builder
npm install
npm run dev
```

Se você já clonou sem `--recurse-submodules`:

```bash
git submodule update --init --recursive
```

## Comandos

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run gen:ds` | Relê as stories do Storybook do DS e regenera o manifesto |
| `npm test` | Testes do gerador e da busca na árvore |
| `npm run check:ds` | Trava: nada de cor, fonte ou ícone fora do DS |
| `npm run build` | `check:ds` + build de produção |

## Modos

- **Editar** — o clique seleciona o bloco. Malha, colunas e alças visíveis.
- **Testar** (tecla `P`) — o clique aciona o componente: o modal abre, o
  carrossel navega, a dica aparece.

## Limitações conhecidas

- O slide do carrossel é fixo: vem de um *scoped slot*, que não cabe na árvore
  de blocos desta versão.
- `UToast` não está no catálogo: é disparado por `useToast()` e renderizado pelo
  `<UApp>`, não é um bloco posicionável.
- 21 das 47 stories do DS não declaram `argTypes`; as peças correspondentes usam
  campos escritos à mão. `npm run gen:ds` lista quais.
```

- [ ] **Step 7: Criar o repositório e publicar**

**Antes de rodar:** confirmar com o Celio. O repositório não existe hoje
(`gh repo view cbitran/nacional-builder` → *Could not resolve*), mas criar
repositório é ação externa e irreversível o suficiente para pedir o OK.

```bash
git add -A
git commit -m "feat: publicação no GitHub Pages com o DS por submodule"
gh repo create cbitran/nacional-builder --public --source=. --remote=origin --push
gh api -X POST repos/cbitran/nacional-builder/pages -f build_type=workflow
```

- [ ] **Step 8: Verificar que está realmente no ar**

Run: `gh run watch` (ou `gh run list --limit 1`)
Expected: workflow verde

Run: `curl -sI https://cbitran.github.io/nacional-builder/ | head -1`
Expected: `HTTP/2 200`

Abrir `https://cbitran.github.io/nacional-builder/` no navegador.
Expected: o builder carrega; a biblioteca lista as peças; arrastar um Modal e
trocar para Testar abre o modal. Console sem 404.

**Só depois de ver o 200 e o modal abrindo no endereço público** é que se diz
que está publicado.

- [ ] **Step 9: Commit final**

```bash
git add -A
git commit -m "docs: README com o passo do submodule e as limitações conhecidas"
git push
```

---

## Ordem e pontos de corte

1 → 2 → 3 → 4 são a espinha: sem elas não há comportamento nenhum.
5 → 6 é a ponte com o Storybook.
7 é a publicação.

**Se o tempo apertar**, corte na seguinte ordem:
1. Task 6 Steps 6-8 (outline do Inspector) — as peças continuam caindo montadas
2. Task 5 inteira — o Inspector fica só com os campos manuais
3. Nunca cortar 1-4: são o pedido original.
