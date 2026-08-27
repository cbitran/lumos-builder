/**
 * CATÁLOGO MODULAR — as 29 peças do `Builder Modular v2.dc.html`, cada uma
 * ligada ao componente REAL do Design System.
 *
 * É este arquivo que responde ao pedido: "o Claude Design não conseguiu ler o
 * meu Storybook". No protótipo, cada peça era HTML desenhado à mão — um `botao`
 * era uma `<div>` com `background: linear-gradient(...)` e sombra literal. Aqui
 * um `botao` É o `UButton` do DS, com o comportamento que o Storybook documenta.
 *
 * O QUE VEIO DO PROTÓTIPO (é o desenho do Celio, preservado):
 *   - os 29 tipos, os 7 grupos da biblioteca e a ordem deles
 *   - o tamanho inicial de cada peça (w/h em células) e os mínimos
 *   - os campos do Inspector e as três abas: conteudo · estilo · regras
 *   - os valores padrão de cada campo
 *
 * O QUE NÃO VEIO (e não pode vir):
 *   - cor, sombra, gradiente e tamanho literais. No protótipo eram `rgb(...)`
 *     fixos porque não havia DS ligado. Aqui é o DS quem decide, sempre.
 */

import type { Peca } from './modular'

/** Aba do Inspector em que o campo aparece. Vem do protótipo. */
export type Aba = 'conteudo' | 'estilo' | 'regras'

export type Campo =
  | { key: string; label: string; tipo: 'text'; aba: Aba }
  | { key: string; label: string; tipo: 'switch'; aba: Aba }
  | { key: string; label: string; tipo: 'select'; aba: Aba; opcoes: string[] }
  | { key: string; label: string; tipo: 'range'; aba: Aba; min: number; max: number; passo: number; sufixo: string }

const texto = (key: string, label: string, aba: Aba = 'conteudo'): Campo => ({ key, label, tipo: 'text', aba })
const liga = (key: string, label: string, aba: Aba = 'estilo'): Campo => ({ key, label, tipo: 'switch', aba })
const opta = (key: string, label: string, opcoes: string[], aba: Aba = 'estilo'): Campo => ({ key, label, tipo: 'select', aba, opcoes })
const faixa = (key: string, label: string, min: number, max: number, passo: number, sufixo = '', aba: Aba = 'estilo'): Campo =>
  ({ key, label, tipo: 'range', aba, min, max, passo, sufixo })

/**
 * Campos comuns a TODAS as peças, na aba Regras. Vêm do `COMUNS` do protótipo.
 * São regras de exibição do layout — não afetam o componente do DS.
 */
export const COMUNS: Campo[] = [
  opta('visivelPara', 'Visível para', ['Todos', 'Visitantes', 'Usuários logados'], 'regras'),
  liga('ocultarMobile', 'Ocultar no mobile', 'regras'),
]

export interface TipoPeca {
  tipo: string
  nome: string
  grupo: 'Layout' | 'Conteúdo' | 'Ações' | 'Coleções' | 'Feedback' | 'Formulário' | 'Navegação'
  /**
   * Componente do DS que esta peça renderiza, resolvido pelo manifesto
   * `src/ds/nuxt-ui-components.generated.ts`.
   * `'composto'` = a peça é um arranjo de vários componentes do DS, montado pelo
   * renderer (barra de navegação, grade de cards, lista).
   * `'nativo'`  = não é componente do DS: é texto ou um slot de imagem.
   */
  renders: string
  /** Ícone da biblioteca. Set Lucide, o mesmo do Storybook do DS. */
  icone: string
  /** Tamanho inicial em células da grade. Do protótipo. */
  w: number
  h: number
  /** Mínimos ao redimensionar. Do protótipo (MIN_W/MIN_H). */
  minW?: number
  minH?: number
  padrao: Record<string, unknown>
  campos: Campo[]
  /**
   * Story do Storybook que documenta o comportamento desta peça, quando existe.
   * É por aqui que o Inspector puxa args/argTypes reais do DS.
   */
  story?: string
  /** Comportamento que só existe em modo Visualizar (abre, desliza, navega). */
  comportamento?: string
}

export const TIPOS: TipoPeca[] = [
  // ── Layout ───────────────────────────────────────────────────────────────
  {
    tipo: 'secao', nome: 'Painel / container', grupo: 'Layout', renders: 'UCard',
    icone: 'i-lucide-square-dashed', w: 12, h: 5,
    story: 'Card',
    // A seção é o único tipo que CONTÉM outras peças (ver `colide` em modular.ts).
    padrao: { fundo: 'Relevo', preenchimento: 16 },
    campos: [
      opta('fundo', 'Superfície', ['Plana', 'Relevo', 'Rebaixada', 'Marca']),
      faixa('preenchimento', 'Preenchimento', 0, 40, 4, 'px'),
    ],
  },
  {
    tipo: 'divisor', nome: 'Divisor', grupo: 'Layout', renders: 'USeparator',
    icone: 'i-lucide-minus', w: 12, h: 1, minW: 2, minH: 1,
    story: 'Separator',
    padrao: { espessura: 2, tom: 'Sutil' },
    campos: [
      faixa('espessura', 'Espessura', 1, 6, 1, 'px'),
      opta('tom', 'Tom', ['Sutil', 'Forte', 'Marca']),
    ],
  },
  {
    tipo: 'barraNav', nome: 'Barra de navegação', grupo: 'Layout', renders: 'composto',
    icone: 'i-lucide-panel-top', w: 12, h: 2, minW: 6, minH: 2,
    padrao: { marca: 'Marca', acao: 'Entrar', itens: 4, comLogo: true, comAcao: true },
    campos: [
      texto('marca', 'Nome da marca'),
      texto('acao', 'Botão de ação'),
      faixa('itens', 'Itens de menu', 2, 6, 1, '', 'conteudo'),
      liga('comLogo', 'Mostrar logo', 'conteudo'),
      liga('comAcao', 'Mostrar botão', 'conteudo'),
    ],
  },
  {
    tipo: 'abas', nome: 'Abas', grupo: 'Layout', renders: 'UTabs',
    icone: 'i-lucide-rows-3', w: 6, h: 1, minW: 3, minH: 1,
    story: 'Tabs', comportamento: 'Troca de aba ao clicar.',
    padrao: { itens: 3, formato: 'Pílula' },
    campos: [
      faixa('itens', 'Abas', 2, 6, 1, '', 'conteudo'),
      opta('formato', 'Formato', ['Pílula', 'Sublinhado']),
    ],
  },

  // ── Conteúdo ─────────────────────────────────────────────────────────────
  {
    tipo: 'titulo', nome: 'Título', grupo: 'Conteúdo', renders: 'nativo',
    icone: 'i-lucide-heading', w: 6, h: 2, minH: 1,
    story: 'Typography',
    padrao: { texto: 'Título da seção', tamanho: 26, peso: 'Semibold', alinhamento: 'Esquerda', cor: 'Padrão' },
    campos: [
      texto('texto', 'Texto'),
      faixa('tamanho', 'Tamanho', 14, 64, 2, 'px'),
      opta('peso', 'Peso', ['Regular', 'Medium', 'Semibold', 'Bold']),
      opta('alinhamento', 'Alinhamento', ['Esquerda', 'Centro', 'Direita']),
      opta('cor', 'Cor', ['Padrão', 'Suave', 'Marca']),
    ],
  },
  {
    tipo: 'texto', nome: 'Parágrafo', grupo: 'Conteúdo', renders: 'nativo',
    icone: 'i-lucide-text', w: 6, h: 3, minH: 1,
    story: 'Typography',
    padrao: { texto: 'Escreva aqui o texto de apoio desta seção.', tamanho: 14, alinhamento: 'Esquerda' },
    campos: [
      texto('texto', 'Texto'),
      faixa('tamanho', 'Tamanho', 10, 32, 1, 'px'),
      opta('alinhamento', 'Alinhamento', ['Esquerda', 'Centro', 'Direita']),
    ],
  },
  {
    tipo: 'imagem', nome: 'Slot de imagem', grupo: 'Conteúdo', renders: 'nativo',
    icone: 'i-lucide-image', w: 4, h: 5,
    padrao: { rotulo: 'Imagem', proporcao: 'Livre' },
    campos: [
      texto('rotulo', 'Rótulo do slot'),
      opta('proporcao', 'Proporção', ['Livre', '1:1', '3:4', '16:9']),
    ],
  },
  {
    tipo: 'badge', nome: 'Etiqueta', grupo: 'Conteúdo', renders: 'UBadge',
    icone: 'i-lucide-tag', w: 2, h: 1, minW: 1, minH: 1,
    story: 'Badge',
    padrao: { texto: 'Etiqueta', variante: 'Marca', tamanho: 'Médio' },
    campos: [
      texto('texto', 'Texto'),
      opta('variante', 'Variante', ['Marca', 'Neutra', 'Contorno']),
      opta('tamanho', 'Tamanho', ['Pequeno', 'Médio']),
    ],
  },

  // ── Ações ────────────────────────────────────────────────────────────────
  {
    tipo: 'botao', nome: 'Botão', grupo: 'Ações', renders: 'UButton',
    icone: 'i-lucide-mouse-pointer-click', w: 3, h: 1, minW: 2, minH: 1,
    story: 'Button',
    padrao: { texto: 'Ação principal', variante: 'Primário', tamanho: 'Médio', icone: 'Nenhum' },
    campos: [
      texto('texto', 'Rótulo'),
      opta('variante', 'Variante', ['Primário', 'Secundário', 'Fantasma']),
      opta('tamanho', 'Tamanho', ['Pequeno', 'Médio', 'Grande']),
      opta('icone', 'Ícone', ['Nenhum', 'Esquerda', 'Direita']),
    ],
  },
  {
    tipo: 'grupoBotoes', nome: 'Grupo de botões', grupo: 'Ações', renders: 'UFieldGroup',
    // UFieldGroup, NÃO UButtonGroup: este último não existe no @nuxt/ui 4.9.
    icone: 'i-lucide-columns-2', w: 5, h: 1, minW: 4, minH: 1,
    padrao: { primario: 'Confirmar', secundario: 'Cancelar', alinhamento: 'Esquerda' },
    campos: [texto('primario', 'Botão primário'), texto('secundario', 'Botão secundário')],
  },
  {
    tipo: 'campo', nome: 'Campo de formulário', grupo: 'Ações', renders: 'UInput',
    icone: 'i-lucide-text-cursor-input', w: 4, h: 2, minW: 3, minH: 2,
    story: 'Input', comportamento: 'Aceita digitação.',
    padrao: { placeholder: 'Digite aqui', comIcone: false, obrigatorio: false },
    campos: [
      texto('placeholder', 'Placeholder'),
      liga('comIcone', 'Ícone à esquerda'),
      liga('obrigatorio', 'Campo obrigatório', 'regras'),
    ],
  },
  {
    tipo: 'busca', nome: 'Campo de busca', grupo: 'Ações', renders: 'UInput',
    icone: 'i-lucide-search', w: 6, h: 1, minW: 3, minH: 1,
    story: 'Search', comportamento: 'Aceita digitação.',
    padrao: { placeholder: 'Buscar…', comIcone: true },
    campos: [texto('placeholder', 'Placeholder'), liga('comIcone', 'Ícone à esquerda')],
  },

  // ── Coleções ─────────────────────────────────────────────────────────────
  {
    tipo: 'grade', nome: 'Grade de cards', grupo: 'Coleções', renders: 'composto',
    icone: 'i-lucide-layout-grid', w: 6, h: 8,
    padrao: { titulo: 'Título da grade', acao: 'Ver todos', mostrarTitulo: true, colunas: 3, linhas: 2, gap: 12, legenda: true },
    campos: [
      texto('titulo', 'Título'),
      texto('acao', 'Link de ação'),
      liga('mostrarTitulo', 'Mostrar cabeçalho', 'conteudo'),
      liga('legenda', 'Legenda nos itens', 'conteudo'),
      faixa('colunas', 'Colunas internas', 1, 6, 1),
      faixa('linhas', 'Linhas internas', 1, 5, 1),
      faixa('gap', 'Espaçamento', 4, 24, 4, 'px'),
    ],
  },
  {
    tipo: 'carrossel', nome: 'Carrossel', grupo: 'Coleções', renders: 'UCarousel',
    icone: 'i-lucide-gallery-horizontal', w: 12, h: 5,
    story: 'Carousel', comportamento: 'As setas navegam; os indicadores saltam de slide.',
    padrao: { slides: 3, indicadores: true, autoplay: false, intervalo: 6 },
    campos: [
      faixa('slides', 'Slides visíveis', 1, 6, 1, '', 'conteudo'),
      liga('indicadores', 'Indicadores'),
      liga('autoplay', 'Rotação automática', 'regras'),
      faixa('intervalo', 'Intervalo', 3, 12, 1, 's', 'regras'),
    ],
  },
  {
    tipo: 'lista', nome: 'Lista', grupo: 'Coleções', renders: 'composto',
    icone: 'i-lucide-list', w: 4, h: 6,
    padrao: { itens: 4, comIcone: true, comValor: true, divisorias: true },
    campos: [
      faixa('itens', 'Itens', 2, 8, 1, '', 'conteudo'),
      liga('comValor', 'Valor à direita', 'conteudo'),
      liga('comIcone', 'Ícone à esquerda'),
      liga('divisorias', 'Divisórias'),
    ],
  },
  {
    tipo: 'tabela', nome: 'Tabela', grupo: 'Coleções', renders: 'UTable',
    icone: 'i-lucide-table', w: 8, h: 7,
    story: 'Table',
    padrao: { colunas: 4, linhas: 4, cabecalho: true, zebra: false },
    campos: [
      faixa('colunas', 'Colunas', 2, 6, 1, '', 'conteudo'),
      faixa('linhas', 'Linhas', 1, 8, 1, '', 'conteudo'),
      liga('cabecalho', 'Cabeçalho'),
      liga('zebra', 'Linhas zebradas'),
    ],
  },

  // ── Feedback ─────────────────────────────────────────────────────────────
  {
    tipo: 'alerta', nome: 'Alerta', grupo: 'Feedback', renders: 'UAlert',
    icone: 'i-lucide-triangle-alert', w: 6, h: 2,
    story: 'Alert',
    padrao: { titulo: 'Título do aviso', texto: 'Mensagem curta de contexto para o usuário.', tom: 'Info' },
    campos: [
      texto('titulo', 'Título'),
      texto('texto', 'Mensagem'),
      opta('tom', 'Tom', ['Info', 'Sucesso', 'Aviso', 'Erro']),
    ],
  },
  {
    tipo: 'progresso', nome: 'Barra de progresso', grupo: 'Feedback', renders: 'UProgress',
    icone: 'i-lucide-loader', w: 4, h: 2,
    story: 'Progress',
    padrao: { rotulo: 'Progresso', valor: 60 },
    campos: [texto('rotulo', 'Rótulo'), faixa('valor', 'Valor', 0, 100, 5, '%', 'conteudo')],
  },
  {
    tipo: 'skeleton', nome: 'Skeleton', grupo: 'Feedback', renders: 'USkeleton',
    icone: 'i-lucide-loader-circle', w: 4, h: 3,
    story: 'Skeleton',
    padrao: { linhas: 3 },
    campos: [faixa('linhas', 'Linhas', 1, 5, 1, '', 'conteudo')],
  },
  {
    tipo: 'modal', nome: 'Modal', grupo: 'Feedback', renders: 'UModal',
    icone: 'i-lucide-app-window', w: 6, h: 6,
    story: 'Modal',
    // No protótipo era "Modal (preview)" — um desenho estático do diálogo.
    // Aqui é o UModal de verdade: o gatilho abre, o rodapé fecha.
    comportamento: 'O gatilho abre o diálogo; Cancelar e Confirmar fecham.',
    padrao: { titulo: 'Título do modal', texto: 'Mensagem de confirmação para o usuário.', gatilho: 'Abrir modal', telaCheia: false },
    campos: [
      texto('titulo', 'Título'),
      texto('texto', 'Mensagem'),
      texto('gatilho', 'Texto do gatilho'),
      liga('telaCheia', 'Tela cheia'),
    ],
  },
  {
    tipo: 'toast', nome: 'Notificação', grupo: 'Feedback', renders: 'UButton',
    icone: 'i-lucide-bell-ring', w: 3, h: 1, minW: 2, minH: 1,
    story: 'Toast',
    // O UToast NÃO é posicionável: quem o desenha é o container do <UApp>.
    // A story `Triggers` do Storybook mostra o padrão certo — um botão que
    // chama useToast().add(). É esse gatilho que vira peça.
    comportamento: 'Dispara a notificação flutuante, que aparece por cima de tudo.',
    padrao: { gatilho: 'Mostrar notificação', titulo: 'Aposta confirmada', texto: 'R$ 50,00 em Flamengo x Palmeiras.', tom: 'Sucesso' },
    campos: [
      texto('gatilho', 'Texto do botão'),
      texto('titulo', 'Título da notificação'),
      texto('texto', 'Mensagem'),
      opta('tom', 'Tom', ['Info', 'Sucesso', 'Aviso', 'Erro']),
    ],
  },

  // ── Formulário ───────────────────────────────────────────────────────────
  {
    tipo: 'checkbox', nome: 'Checkbox', grupo: 'Formulário', renders: 'UCheckbox',
    icone: 'i-lucide-square-check', w: 4, h: 1, minW: 2, minH: 1,
    story: 'Checkbox', comportamento: 'Marca e desmarca ao clicar.',
    padrao: { rotulo: 'Aceito os termos', marcado: true, desabilitado: false },
    campos: [
      texto('rotulo', 'Rótulo'),
      liga('marcado', 'Marcado', 'conteudo'),
      liga('desabilitado', 'Desabilitado'),
    ],
  },
  {
    tipo: 'radioGroup', nome: 'Grupo de opções', grupo: 'Formulário', renders: 'URadioGroup',
    icone: 'i-lucide-circle-dot', w: 4, h: 3, minW: 3, minH: 2,
    story: 'Toggles', comportamento: 'Troca a opção selecionada ao clicar.',
    padrao: { itens: 3, selecionado: 0 },
    campos: [
      faixa('itens', 'Opções', 2, 5, 1, '', 'conteudo'),
      faixa('selecionado', 'Selecionada', 0, 4, 1, '', 'conteudo'),
    ],
  },
  {
    tipo: 'select', nome: 'Seletor', grupo: 'Formulário', renders: 'USelect',
    icone: 'i-lucide-chevron-down', w: 4, h: 2, minW: 3, minH: 2,
    story: 'Select', comportamento: 'Abre a lista de opções ao clicar.',
    padrao: { opcao: 'Selecionar opção', comIcone: false },
    campos: [texto('opcao', 'Texto exibido'), liga('comIcone', 'Ícone à esquerda')],
  },
  {
    tipo: 'avatar', nome: 'Avatar', grupo: 'Formulário', renders: 'UAvatar',
    icone: 'i-lucide-user', w: 1, h: 1, minW: 1, minH: 1,
    story: 'Avatar',
    padrao: { iniciais: 'MR', tamanho: 'md', alinhamento: 'Esquerda' },
    campos: [
      texto('iniciais', 'Iniciais'),
      opta('tamanho', 'Tamanho', ['xs', 'sm', 'md', 'lg', 'xl']),
    ],
  },

  // ── Navegação ────────────────────────────────────────────────────────────
  {
    tipo: 'breadcrumb', nome: 'Breadcrumb', grupo: 'Navegação', renders: 'UBreadcrumb',
    icone: 'i-lucide-chevron-right', w: 5, h: 1, minW: 3, minH: 1,
    padrao: { itens: 3, alinhamento: 'Esquerda' },
    campos: [faixa('itens', 'Níveis', 2, 4, 1, '', 'conteudo')],
  },
  {
    tipo: 'pagination', nome: 'Paginação', grupo: 'Navegação', renders: 'UPagination',
    icone: 'i-lucide-ellipsis', w: 5, h: 1, minW: 3, minH: 1,
    story: 'Pagination', comportamento: 'Troca de página ao clicar.',
    padrao: { paginas: 5, atual: 1, alinhamento: 'Esquerda' },
    campos: [
      faixa('paginas', 'Páginas', 3, 9, 1, '', 'conteudo'),
      faixa('atual', 'Página atual', 1, 9, 1, '', 'conteudo'),
    ],
  },
  {
    tipo: 'chip', nome: 'Chip', grupo: 'Navegação', renders: 'UChip',
    icone: 'i-lucide-badge', w: 2, h: 1, minW: 1, minH: 1,
    story: 'Chip',
    // UChip envolve outro elemento — o indicador de canto. Renderizado com um
    // UButton dentro, como a story do DS demonstra.
    padrao: { texto: 'Chip', removivel: true, alinhamento: 'Esquerda' },
    campos: [texto('texto', 'Texto'), liga('removivel', 'Removível')],
  },
  {
    tipo: 'kbd', nome: 'Atalho (Kbd)', grupo: 'Navegação', renders: 'UKbd',
    icone: 'i-lucide-keyboard', w: 2, h: 1, minW: 1, minH: 1,
    padrao: { texto: '⌘K', alinhamento: 'Esquerda' },
    campos: [texto('texto', 'Texto')],
  },
  {
    tipo: 'accordion', nome: 'Acordeão', grupo: 'Navegação', renders: 'UAccordion',
    icone: 'i-lucide-chevron-down', w: 6, h: 4,
    story: 'Accordion', comportamento: 'Abre e fecha cada item ao clicar.',
    padrao: { itens: 3, aberto: 0 },
    campos: [
      faixa('itens', 'Itens', 2, 5, 1, '', 'conteudo'),
      faixa('aberto', 'Item aberto', 0, 4, 1, '', 'conteudo'),
    ],
  },
]

export const GRUPOS = [...new Set(TIPOS.map((t) => t.grupo))]
export const acharTipo = (tipo: string) => TIPOS.find((t) => t.tipo === tipo)

/** Todos os campos de uma peça, incluindo os comuns da aba Regras. */
export const camposDe = (tipo: string): Campo[] => {
  const t = acharTipo(tipo)
  return t ? [...t.campos, ...COMUNS] : []
}

/** Uma peça nova, com os valores padrão do tipo. */
export function novaPeca(tipo: string, id: string, x: number, y: number): Peca | null {
  const t = acharTipo(tipo)
  if (!t) return null
  return { id, tipo, x, y, w: t.w, h: t.h, props: { ...t.padrao } }
}
