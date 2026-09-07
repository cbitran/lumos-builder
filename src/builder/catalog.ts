/**
 * CATÁLOGO — as peças da biblioteca.
 *
 * `pure`   = o componente do DS como ele é, sem opinião.
 * `recipe` = o mesmo componente no arranjo em que a Nacional o usa hoje.
 *            A receita herda do site APENAS o arranjo (o que anda junto, em que
 *            ordem, com que texto). Cor, fonte, ícone e tamanho vêm sempre do DS.
 *            Ex.: a busca no ar usa `mingcute:search-2-line`; aqui usa Lucide,
 *            o mesmo set do Storybook do DS.
 *
 * `renders` é o nome do componente registrado globalmente a partir do manifesto
 * gerado (src/ds/nuxt-ui-components.generated.ts) — os mesmos 121 componentes do
 * @nuxt/ui 4.9.0 que o Storybook do DS documenta.
 */

export type Field =
  | { key: string; label: string; type: 'text' }
  | { key: string; label: string; type: 'select'; options: string[] }
  | { key: string; label: string; type: 'boolean' }

const SIZES = ['xs', 'sm', 'md', 'lg', 'xl']
const COLORS = ['primary', 'secondary', 'success', 'info', 'warning', 'error', 'neutral']

const F = {
  size: { key: 'size', label: 'Tamanho', type: 'select', options: SIZES } as Field,
  color: { key: 'color', label: 'Papel de cor', type: 'select', options: COLORS } as Field,
  label: { key: 'label', label: 'Texto', type: 'text' } as Field,
  placeholder: { key: 'placeholder', label: 'Placeholder', type: 'text' } as Field,
  variantBtn: {
    key: 'variant', label: 'Variante', type: 'select',
    options: ['solid', 'outline', 'soft', 'subtle', 'ghost', 'link'],
  } as Field,
  variantBox: {
    key: 'variant', label: 'Variante', type: 'select',
    options: ['outline', 'soft', 'subtle', 'ghost', 'none'],
  } as Field,
}

export interface Recipe {
  label: string
  description: string
  props: Record<string, unknown>
}

export interface Piece {
  key: string
  label: string
  /** Grupo na biblioteca. */
  group: 'Ação' | 'Formulário' | 'Navegação' | 'Conteúdo' | 'Sinalização' | 'Nacional'
  /** Nome do componente do DS registrado globalmente. */
  renders: string
  /** Conteúdo do slot default, quando o componente precisa de um. */
  slot?: string
  defaultSpan: number
  pure: { description: string; props: Record<string, unknown> }
  recipe?: Recipe
  fields: Field[]
}

const ITEMS = [
  { label: 'Cassino', value: 'cassino' },
  { label: 'Esportes', value: 'esportes' },
  { label: 'Ao vivo', value: 'ao-vivo' },
]

// FORA por ora — precisam de FILHOS e o builder ainda não permite aninhar
// blocos: UButtonGroup (agrupa botões), UCarousel (slides) e UChip (envolve um
// elemento). Renderizavam com altura zero, o que na prática é uma peça que some
// ao ser solta. Voltam quando existir composição.
export const CATALOG: Piece[] = [
  // ── Ação ────────────────────────────────────────────────────────────────
  {
    key: 'UButton', label: 'Botão', group: 'Ação', renders: 'UButton', defaultSpan: 3,
    pure: { description: 'UButton do DS.', props: { label: 'Botão', size: 'md', color: 'primary' } },
    fields: [F.label, F.variantBtn, F.size, F.color],
  },
  // ULink FORA por enquanto: fora do Nuxt ele quebra no resolve da rota
  // ("Cannot destructure property 'href' of 'undefined'"), tanto com `to` quanto
  // com `href`, e um erro de render derruba o ciclo inteiro do Vue — a tela para
  // de atualizar. Reavaliar quando houver um NuxtLink stub ou router completo.

  // ── Formulário ──────────────────────────────────────────────────────────
  {
    key: 'UInput', label: 'Campo de texto', group: 'Formulário', renders: 'UInput', defaultSpan: 6,
    pure: { description: 'UInput do DS.', props: { placeholder: 'Digite aqui', size: 'md' } },
    fields: [F.placeholder, F.size, F.variantBox],
  },
  {
    key: 'busca', label: 'Busca', group: 'Nacional', renders: 'UInput', defaultSpan: 6,
    pure: { description: 'UInput do DS, sem configuração.', props: { placeholder: 'Digite aqui', size: 'md' } },
    recipe: {
      label: 'Receita Nacional',
      description: 'Campo com ícone à frente e placeholder de jogo — como no site, sem botão.',
      props: { placeholder: 'Pesquise um jogo de cassino...', icon: 'i-lucide-search', size: 'lg' },
    },
    fields: [F.placeholder, F.size],
  },
  {
    key: 'UTextarea', label: 'Área de texto', group: 'Formulário', renders: 'UTextarea', defaultSpan: 6,
    pure: { description: 'UTextarea do DS.', props: { placeholder: 'Escreva…', rows: 3 } },
    fields: [F.placeholder, F.size, F.variantBox],
  },
  {
    key: 'USelect', label: 'Seleção', group: 'Formulário', renders: 'USelect', defaultSpan: 4,
    pure: { description: 'USelect do DS.', props: { items: ITEMS, placeholder: 'Escolha', size: 'md' } },
    fields: [F.placeholder, F.size],
  },
  {
    key: 'USelectMenu', label: 'Menu de seleção', group: 'Formulário', renders: 'USelectMenu', defaultSpan: 4,
    pure: { description: 'USelectMenu do DS.', props: { items: ITEMS, placeholder: 'Escolha', size: 'md' } },
    fields: [F.placeholder, F.size],
  },
  {
    key: 'UInputMenu', label: 'Campo com menu', group: 'Formulário', renders: 'UInputMenu', defaultSpan: 4,
    pure: { description: 'UInputMenu do DS.', props: { items: ITEMS, placeholder: 'Buscar…', size: 'md' } },
    fields: [F.placeholder, F.size],
  },
  {
    key: 'UInputNumber', label: 'Campo numérico', group: 'Formulário', renders: 'UInputNumber', defaultSpan: 3,
    pure: { description: 'UInputNumber do DS.', props: { modelValue: 1, size: 'md' } },
    fields: [F.size],
  },
  {
    key: 'UPinInput', label: 'Código (PIN)', group: 'Formulário', renders: 'UPinInput', defaultSpan: 4,
    pure: { description: 'UPinInput do DS.', props: { length: 4, size: 'md' } },
    fields: [F.size],
  },
  {
    key: 'UCheckbox', label: 'Caixa de seleção', group: 'Formulário', renders: 'UCheckbox', defaultSpan: 3,
    pure: { description: 'UCheckbox do DS.', props: { label: 'Aceito os termos' } },
    fields: [F.label, F.size, F.color],
  },
  {
    key: 'URadioGroup', label: 'Opções', group: 'Formulário', renders: 'URadioGroup', defaultSpan: 3,
    pure: { description: 'URadioGroup do DS.', props: { items: ITEMS, defaultValue: 'cassino' } },
    fields: [F.size, F.color],
  },
  {
    key: 'USwitch', label: 'Interruptor', group: 'Formulário', renders: 'USwitch', defaultSpan: 3,
    pure: { description: 'USwitch do DS.', props: { label: 'Receber promoções' } },
    fields: [F.label, F.size, F.color],
  },
  {
    key: 'USlider', label: 'Controle deslizante', group: 'Formulário', renders: 'USlider', defaultSpan: 4,
    pure: { description: 'USlider do DS.', props: { defaultValue: 50 } },
    fields: [F.size, F.color],
  },
  {
    key: 'UFormField', label: 'Campo com rótulo', group: 'Formulário', renders: 'UFormField', defaultSpan: 4,
    pure: { description: 'UFormField do DS.', props: { label: 'E-mail', description: 'Usaremos para login' } },
    fields: [F.label, F.size],
  },
  {
    key: 'UFileUpload', label: 'Envio de arquivo', group: 'Formulário', renders: 'UFileUpload', defaultSpan: 4,
    pure: { description: 'UFileUpload do DS.', props: { label: 'Solte o arquivo aqui' } },
    fields: [F.label, F.size],
  },
  {
    key: 'UCalendar', label: 'Calendário', group: 'Formulário', renders: 'UCalendar', defaultSpan: 4,
    pure: { description: 'UCalendar do DS.', props: {} },
    fields: [F.size, F.color],
  },

  // ── Navegação ───────────────────────────────────────────────────────────
  {
    key: 'UTabs', label: 'Abas', group: 'Navegação', renders: 'UTabs', defaultSpan: 6,
    pure: { description: 'UTabs do DS.', props: { items: ITEMS, size: 'md' } },
    fields: [F.size, F.color],
  },
  {
    key: 'UNavigationMenu', label: 'Menu de navegação', group: 'Navegação', renders: 'UNavigationMenu', defaultSpan: 6,
    pure: { description: 'UNavigationMenu do DS.', props: { items: ITEMS } },
    fields: [],
  },
  {
    key: 'UBreadcrumb', label: 'Trilha', group: 'Navegação', renders: 'UBreadcrumb', defaultSpan: 6,
    pure: { description: 'UBreadcrumb do DS.', props: { items: [{ label: 'Início' }, { label: 'Cassino' }, { label: 'Slots' }] } },
    fields: [],
  },
  {
    key: 'UPagination', label: 'Paginação', group: 'Navegação', renders: 'UPagination', defaultSpan: 4,
    pure: { description: 'UPagination do DS.', props: { total: 100, defaultPage: 1 } },
    fields: [F.size, F.color],
  },
  {
    key: 'UStepper', label: 'Etapas', group: 'Navegação', renders: 'UStepper', defaultSpan: 8,
    pure: { description: 'UStepper do DS.', props: { items: [{ title: 'Conta' }, { title: 'Dados' }, { title: 'Pronto' }] } },
    fields: [F.size, F.color],
  },

  // ── Conteúdo ────────────────────────────────────────────────────────────
  {
    key: 'UCard', label: 'Cartão', group: 'Conteúdo', renders: 'UCard', slot: 'Conteúdo do cartão', defaultSpan: 4,
    pure: { description: 'UCard do DS.', props: {} },
    fields: [F.variantBox],
  },
  {
    key: 'UAccordion', label: 'Acordeão', group: 'Conteúdo', renders: 'UAccordion', defaultSpan: 6,
    pure: { description: 'UAccordion do DS.', props: { items: [{ label: 'Como funciona', content: 'Texto de exemplo.' }, { label: 'Regras', content: 'Texto de exemplo.' }] } },
    fields: [],
  },
  {
    key: 'UTable', label: 'Tabela', group: 'Conteúdo', renders: 'UTable', defaultSpan: 8,
    pure: {
      description: 'UTable do DS.',
      props: {
        data: [
          { jogo: 'Fortune Tiger', valor: 'R$ 1.618,00' },
          { jogo: 'Aviator', valor: 'R$ 754,00' },
        ],
      },
    },
    fields: [],
  },
  {
    key: 'UAvatar', label: 'Avatar', group: 'Conteúdo', renders: 'UAvatar', defaultSpan: 1,
    pure: { description: 'UAvatar do DS.', props: { alt: 'Perfil', size: 'md' } },
    fields: [F.size],
  },
  {
    key: 'USeparator', label: 'Divisor', group: 'Conteúdo', renders: 'USeparator', defaultSpan: 12,
    pure: { description: 'USeparator do DS.', props: {} },
    fields: [F.size, F.color],
  },
  {
    key: 'USkeleton', label: 'Esqueleto', group: 'Conteúdo', renders: 'USkeleton', defaultSpan: 4,
    pure: { description: 'USkeleton do DS — placeholder de carregamento.', props: { class: 'h-8 w-full' } },
    fields: [],
  },
  {
    key: 'UIcon', label: 'Ícone', group: 'Conteúdo', renders: 'UIcon', defaultSpan: 1,
    pure: { description: 'UIcon do DS (Lucide).', props: { name: 'i-lucide-star', class: 'size-6' } },
    fields: [],
  },
  {
    key: 'UKbd', label: 'Tecla', group: 'Conteúdo', renders: 'UKbd', slot: 'K', defaultSpan: 1,
    pure: { description: 'UKbd do DS.', props: {} },
    fields: [F.size],
  },

  // ── Sinalização ─────────────────────────────────────────────────────────
  {
    key: 'UAlert', label: 'Alerta', group: 'Sinalização', renders: 'UAlert', defaultSpan: 6,
    pure: { description: 'UAlert do DS.', props: { title: 'Atenção', description: 'Mensagem de exemplo.', color: 'info' } },
    fields: [{ key: 'title', label: 'Título', type: 'text' }, F.color, F.variantBox],
  },
  {
    key: 'UBadge', label: 'Etiqueta', group: 'Sinalização', renders: 'UBadge', defaultSpan: 1,
    pure: { description: 'UBadge do DS.', props: { label: 'Novo', color: 'primary' } },
    fields: [F.label, F.size, F.color, F.variantBtn],
  },
  {
    key: 'UProgress', label: 'Progresso', group: 'Sinalização', renders: 'UProgress', defaultSpan: 6,
    pure: { description: 'UProgress do DS.', props: { modelValue: 60 } },
    fields: [F.size, F.color],
  },
]

export const findPiece = (key: string) => CATALOG.find((p) => p.key === key)

export const GROUPS = [...new Set(CATALOG.map((p) => p.group))]
