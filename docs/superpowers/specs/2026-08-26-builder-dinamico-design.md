# Builder dinâmico — comportamento e composição vindos do Design System

**Data:** 2026-08-26
**Autor:** Celio Bitran + Claude
**Status:** Aprovado (design) — pendente plano de implementação

---

## 1. Problema

O builder monta layouts arrastando peças do Design System para um palco em grade
de 12 colunas. Hoje cada peça vira um `LayoutBlock` que guarda apenas
`props: Record<string, unknown>` e uma posição por breakpoint. O `BlockRenderer`
resolve isso como `<component :is="nome" v-bind="props" />` — **props planas, sem
filhos, sem slots**.

No `@nuxt/ui` v4, o comportamento dos componentes de overlay não vive em props:
vive em **slots**. No `UModal`, o slot default é o gatilho e `#footer` recebe
`{ close }`. No `UDrawer`, o slot default é o gatilho e `#body` é o conteúdo. No
`UChip`, o slot default é o elemento que recebe o indicador.

O resultado está documentado no próprio código, em `src/builder/catalog.ts`:

> FORA por ora — precisam de FILHOS e o builder ainda não permite aninhar
> blocos: UButtonGroup, UCarousel e UChip. Renderizavam com altura zero, o que
> na prática é uma peça que some ao ser solta.

E `UModal`, `UDrawer`, `UDropdownMenu`, `UTooltip` e `UPopover` nunca chegaram ao
catálogo pela mesma razão.

**A causa raiz não é falta de conexão com o Design System.** O builder já lê o DS
como fonte única (alias `@ds` no `vite.config.ts`, 121 componentes registrados a
partir de manifesto gerado, 9 marcas trocáveis, trava `check:ds` no build). A
causa raiz é que **o modelo de dados do bloco não tem onde guardar composição.**

## 2. Objetivo

Ao arrastar uma peça de comportamento para o palco, ela cai **já montada e
funcionando** — o Modal com gatilho e rodapé, o Drawer com gatilho e corpo, o
Dropdown com seus itens — e é possível **testar o comportamento dentro do
builder**, sem exportar nada.

Fora de escopo nesta rodada: consumir qualquer API; transformar as stories do
Storybook em peças prontas de biblioteca (avaliado e adiado); drag-and-drop de
blocos para dentro de um slot.

## 3. Arquitetura

### 3.1 O bloco vira árvore

Filho e raiz são tipos **diferentes**, e essa separação é deliberada: só a raiz
ocupa colunas da grade.

```ts
/** Um nó da árvore de conteúdo. Não ocupa grade — flui dentro de um slot. */
interface SlotChild {
  id: string
  piece: string
  props: Record<string, unknown>
  slots?: Record<string, SlotChild[]>
  /** Liga onClick ao `close` que o slot expõe no escopo. Ver 3.4. */
  action?: 'close'
}

/** Bloco raiz: é o único que tem posição. */
interface LayoutBlock extends SlotChild {
  mode: 'pure' | 'recipe'
  positions: Partial<Record<Breakpoint, Position>> & { 1440: Position }
}
```

Regras:

- **Só o bloco raiz é posicionado.** Um `SlotChild` não tem — e não pode ter —
  `positions`. Dar `positions` a um filho criaria posições-fantasma que a grade
  nunca lê. `resolvePosition`, `positionAt` e `convert` ficam intactos e
  continuam sendo chamados apenas sobre `LayoutBlock`.
- `blocks: LayoutBlock[]` no `Layout` não muda de tipo.
- `Layout.version` passa de `2` para `3`. Layouts v2 continuam legíveis: a
  ausência de `slots` é o comportamento atual.
- Entra uma peça mínima **`texto`**, que renderiza um `<span>` com o conteúdo de
  `props.text`. Sem ela não há como colocar um rótulo dentro de um slot.

### 3.2 `BlockRenderer` recursivo

Passa de `<template>` para render function (`h`), porque a quantidade de slots é
dinâmica e um `v-if` dentro de `<component>` não resolve isso.

Uma lição já paga e documentada no arquivo atual **precisa sobreviver**: nunca
declarar um slot default vazio. O comentário existente registra que componentes
de formulário quebram com *"Cannot set properties of null"* ao receber slot
default vazio. Regra do renderer novo:

> Um slot só entra no objeto de slots se tiver ao menos um filho. Slot vazio não
> é declarado.

### 3.3 Catálogo com descritor de slots e semente

`Piece` ganha dois campos:

```ts
/** Semente = um SlotChild sem `id`; o id é gerado no momento do drop. */
type ChildSeed = Omit<SlotChild, 'id'> & { slots?: Record<string, ChildSeed[]> }

interface Piece {
  slots?: { key: string; label: string }[]
  seed?: Record<string, ChildSeed[]>
}
```

`seed` é o que faz a peça cair montada. **É aqui que mora o pedido original.**

Slots confirmados por leitura direta das stories do DS
(`storybook/src/*.stories.ts`), não por suposição sobre a API:

| Peça | Slot default | Outros slots | Conteúdo vem de |
|---|---|---|---|
| `UModal` | gatilho | `#body`, `#footer` (escopo `{ close }`) | slots |
| `UDrawer` | gatilho | `#body` | slots + prop `direction` |
| `UDropdownMenu` | gatilho | — | **prop `items`** (array de grupos) |
| `UTooltip` | gatilho | — | **prop `text`** |
| `UPopover` | gatilho | `#content` | slots |
| `UChip` | elemento envolvido | — | props `text`/`color`/`position` |
| `UButtonGroup` | botões | — | slots |
| `UCard` | corpo | `#header`, `#footer` | slots |
| `UCarousel` | **scoped slot `{ item }`** | — | prop `items` + template por slide |

**`UToast` fica fora do catálogo**, e a razão é arquitetural, não preguiça: ele é
disparado por `useToast().add()` e renderizado pelo container do `<UApp>` — não é
um bloco posicionável numa grade. Modelá-lo como bloco seria mentir sobre o
sistema.

**`UCarousel` entra com limitação declarada.** Seu slide é um *scoped slot*
repetido por item — um template, não uma árvore estática de filhos. Não há como
representá-lo no modelo de `slots` sem inventar uma linguagem de template dentro
do JSON. Solução: a peça entra com a prop `items` editável e um **renderizador de
slide embutido e fixo** (o card de jogo, espelhando a story), documentado no
Inspector como não-editável nesta versão. Alternativa rejeitada: parsear o
template da story — frágil e fora do escopo aprovado.

### 3.4 Ações de escopo de slot

O rodapé do `UModal` recebe `{ close }` e a story usa `@click="close"`. Sem isso,
os botões Cancelar/Confirmar não fecham o modal e o comportamento fica pela
metade.

Mecanismo mínimo: o bloco-filho pode declarar `action: 'close'`. Quando o slot em
que ele vive expõe `close` no escopo, o renderer liga `onClick` nessa função.
Nenhuma outra ação é suportada nesta rodada.

### 3.5 Ponte com o Storybook — `scripts/gen-ds-manifest.mjs`

Lê `<DS_ROOT>/storybook/src/*.stories.ts` e extrai, **via AST do TypeScript**
(`typescript` já é devDependency — nada de regex sobre código), por componente:

- `meta.args` → valores default das props
- `meta.argTypes` → campos do Inspector (`control: 'text' | 'select' | 'boolean' | 'inline-radio'` + `options`)
- `meta.parameters.docs.description.component` → descrição mostrada no Inspector
- nomes das stories → referência textual ("documentado no Storybook como: Playground, Fullscreen")

Saída: `src/ds/storybook-manifest.generated.ts`, no mesmo padrão do
`gen-nuxt-ui-components.mjs` já existente.

**Limitação medida, não estimada.** Das 47 stories do DS, **26 declaram
`argTypes` e 21 não declaram nenhum** — entre as vazias estão `DropdownMenu`,
`Drawer`, `Toast` e `Form`, justamente peças de comportamento. Portanto:

- O Inspector usa o manifesto **quando ele traz campos**;
- Cai nos `fields` escritos à mão no `catalog.ts` quando não traz;
- O script imprime um **relatório de lacunas** ao rodar, listando os componentes
  que o Storybook não descreve.

Esse relatório é um subproduto útil: é um raio-x do que falta documentar no DS.
O que **não** vamos fazer é apresentar isso como sincronia automática total.

### 3.6 Modo Editar / Testar

Sem isso, comportamento e edição brigam: se o Modal abre ao clique, o bloco não
pode mais ser selecionado nem movido.

- **Editar** — clique seleciona o bloco; os componentes ficam inertes; grade e
  colunas visíveis. É o builder de hoje.
- **Testar** — clique chega ao componente; Modal abre, Drawer desliza, Dropdown
  abre, Tooltip aparece no hover, Carousel navega; grade some; seleção desligada.

Um toggle no `Topbar`, ao lado dos controles de grade que já existem.

### 3.7 Inspector com outline

Um outline compacto `bloco → slot → filho` para selecionar e editar filhos, mais
um botão de adicionar filho num slot. Sem drag-and-drop dentro do slot.

**Este é o item cortável** se o prazo apertar: os comportamentos funcionam sem
ele, porque as sementes já entregam as peças montadas. O que se perde é a
capacidade de editar o conteúdo de um slot pela interface.

## 4. Lei do Design System — correção da trava

Auditoria feita durante o design encontrou uma contradição entre fontes:

| Fonte | Diz |
|---|---|
| Storybook do DS | 83 usos de `i-lucide-*`, **zero** de heroicons |
| `ADR-005-Icones-e-Composicao.md` (Aceito 2026-07-06) | *"o DS possui o SLOT, não a BIBLIOTECA de ícones… NÃO embute nem enumera"* |
| `builder/scripts/check-ds-law.mjs` | Falha o build em qualquer coisa que não seja `i-heroicons-` |
| `builder/src/builder/catalog.ts` | Usa `i-heroicons-magnifying-glass`, `i-heroicons-star` |

As únicas 5 menções a heroicons no repo do DS estão em texto de ADR e relatórios
de QA (`ds-b1/contexto/`, `ds-b1/relatorios/`), como exemplo de fidelidade ao
Nuxt v2 — nenhuma em código de componente.

**Decisão (aprovada por Celio, 2026-08-26):** a regra passa a exigir
`i-lucide-*`, e os dois ícones heroicons hoje presentes no `catalog.ts` são
trocados. A trava continua existindo — ela impede set misto; apenas passa a
apontar para o set que o DS realmente usa.

Sem essa correção o objetivo é impossível: semear as peças com os ícones das
stories faria `npm run build` falhar, porque `build` roda `check:ds` antes do
`vite build`.

## 5. Hospedagem

- Repositório novo **`cbitran/nacional-builder`**, público, GitHub Pages via
  Actions. Verificado com `gh repo view` em 2026-08-26: **não existe** — não há
  risco de sobrescrever nada publicado.
- Raiz do repositório = a pasta `builder/`.
- `nacionalbet-ds` entra como **git submodule** em `vendor/nacionalbet-ds`,
  preso num commit. O DS continua sendo uma verdade só, versionada.
- `vite.config.ts`: `DS_ROOT = process.env.DS_ROOT ?? vendor/nacionalbet-ds ??`
  caminho atual do SSD. O ambiente local do Celio não muda; o CI resolve pelo
  submodule. A mensagem de erro explícita que já existe é preservada.
- `base: '/nacional-builder/'` explícito no Vite. O base path do GitHub Pages já
  causou um loop de depuração neste ecossistema antes — **será conferido no
  build antes de qualquer afirmação de que está no ar.**
- `.gitignore`: `node_modules/`, `dist/`, `*.zip` (há dois arquivos de 66 MB e
  10 MB na pasta hoje) e `.DS_Store`.
- **Nada é escrito no repositório `nacionalbet-ds`.** Apenas leitura.

## 6. Verificação

Não existe suíte de testes no builder, e véspera de demo não é hora de inventar
uma. A verificação é executada e evidenciada:

1. `npm run check:ds` passa (com a regra corrigida).
2. `npm run build` passa.
3. No navegador, com screenshot de cada um: Modal abre e fecha pelo rodapé;
   Drawer desliza; Dropdown abre com os itens; Tooltip aparece no hover; Chip
   envolve o elemento; ButtonGroup agrupa; Carousel navega; toggle Editar/Testar
   alterna corretamente.
4. Build servido a partir do `base` de produção, para pegar erro de caminho antes
   do deploy.

Nada é declarado pronto sem a saída do comando ou a imagem correspondente.

## 7. Riscos aceitos

- **21 das 47 stories não declaram `argTypes`.** Os controles dessas peças ficam
  escritos à mão. O relatório de lacunas torna isso visível em vez de silencioso.
- **`UCarousel` tem slide fixo** nesta versão (3.3).
- **`UToast` não entra** como bloco (3.3).
- **Aninhar blocos dentro de posicionamento absoluto** pode gerar arestas de
  altura; o modo Testar isola a maior parte do problema.
- **Submodule adiciona um passo** ao clonar em outra máquina
  (`git clone --recurse-submodules`), que precisa estar no README.
