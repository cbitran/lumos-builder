// Schema do layout — o contrato que sai do builder e que o site real vai consumir.
// O Renderer entende este objeto sozinho; o Editor não precisa existir pra ele funcionar.

export const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), max)

export const BREAKPOINTS = [1440, 1280, 768, 640, 390] as const
export type Breakpoint = (typeof BREAKPOINTS)[number]

/**
 * GRADE POR ESCALA — vem do DS, não de convenção minha.
 * Colunas: `--breakpoint-*` no tokens.css (xs/sm 4 · md 8 · lg/xl/2xl 12).
 * Gutter e margem: coleção `Responsive` do Figma — Desktop usa Spacing/6 (24) e
 * Spacing/8 (32); Mobile usa Spacing/4 (16) nos dois.
 *
 * NÃO CONFIRMADO: a coleção Responsive só tem os modes "Desktop" e "Mobile", e
 * não diz de que lado 768 cai. Assumido Desktop a partir de 768 — reverter é
 * mudar a comparação abaixo.
 */
export interface Grid { columns: number; gutter: number; margin: number }

export function gridFor(bp: Breakpoint): Grid {
  const columns = bp >= 1024 ? 12 : bp >= 768 ? 8 : 4
  const desktop = bp >= 768
  return { columns, gutter: desktop ? 24 : 16, margin: desktop ? 32 : 16 }
}

/** Colunas da escala base (1440), referência de tudo que é herdado. */
export const BASE_COLUMNS = 12

/** Passo do ímã e da malha visível. 8px = 2 unidades do spacing-grid-4 do DS. */
export const MAGNET_UNIT = 8
/** Unidade real da linha do grid — sempre 1px, ligada ou desligada a malha. */
export const ROW_UNIT = 1

/** Como o componente se acomoda dentro das colunas que ocupa. */
export type Align = 'start' | 'center' | 'end' | 'stretch'

export interface Position {
  /** Coluna inicial, 1–12. */
  col: number
  /**
   * Posição vertical em PIXELS (a linha do grid vale sempre 1px).
   * Não pode depender do ímã: se a unidade mudasse junto com ele, desligar o
   * ímã reinterpretaria o mesmo número e o bloco saltaria de lugar.
   */
  row: number
  /** Colunas ocupadas. */
  span: number
  /** Padrão: 'stretch' — o componente preenche as colunas que recebeu. */
  align?: Align
}

/**
 * Converte posição entre grades de tamanhos diferentes (12 col → 4 col, etc.).
 * Proporcional: um bloco que ocupa metade continua ocupando metade.
 */
export function convert(pos: Position, from: number, to: number): Position {
  if (from === to) return pos
  const f = to / from
  const span = clamp(Math.round(pos.span * f), 1, to)
  const col = clamp(Math.round((pos.col - 1) * f) + 1, 1, Math.max(1, to - span + 1))
  return { col, row: pos.row, span, align: pos.align }
}

export interface LayoutBlock {
  id: string
  /** Chave da peça no catálogo (ex.: 'UButton', 'busca'). */
  piece: string
  /** 'pure' = componente cru do DS · 'recipe' = arranjo observado no site da Nacional. */
  mode: 'pure' | 'recipe'
  /** Props passadas ao componente do DS. Nunca contém cor, fonte ou tamanho literal. */
  props: Record<string, unknown>
  /**
   * Posição POR ESCALA, em cascata. 1440 é a base e sempre existe; as outras só
   * aparecem quando alguém ajustou naquela escala. Guardar só o que foi decidido
   * evita cinco cópias do mesmo layout dentro do JSON.
   */
  positions: Partial<Record<Breakpoint, Position>> & { 1440: Position }
}

/**
 * Altura do palco por escala. Ausente ou null = automática (cresce com o
 * conteúdo). Uma altura fixa é o equivalente ao frame do Figma — 390×844, 1280×900.
 */
export type CanvasHeights = Partial<Record<Breakpoint, number | null>>

export interface Layout {
  version: 2
  blocks: LayoutBlock[]
  canvas: CanvasHeights
}

export interface Resolved {
  pos: Position
  /** Escala de onde o valor veio. Igual ao bp atual = ajustado aqui; diferente = herdado. */
  ownedBy: Breakpoint
}

/**
 * Resolve a posição de um bloco numa escala, subindo a cascata até achar quem decidiu.
 * O bloco fica NO MESMO LUGAR em todas as escalas: a linha é preservada e só a
 * largura converte proporcionalmente. Empilhar automaticamente nas escalas
 * estreitas fazia o mesmo elemento aparecer em alturas diferentes.
 */
export function resolvePosition(block: LayoutBlock, bp: Breakpoint): Resolved {
  const i = BREAKPOINTS.indexOf(bp)
  for (let j = i; j >= 0; j--) {
    const at = BREAKPOINTS[j]
    const pos = block.positions[at]
    if (pos) return { pos, ownedBy: at }
  }
  return { pos: block.positions[1440], ownedBy: 1440 }
}

/**
 * Posição do bloco já CONVERTIDA para a grade da escala pedida.
 * Use sempre esta ao ler ou gravar: `resolvePosition` devolve o valor na grade
 * de ORIGEM, e gravar isso num slot de escala estreita cria colunas fantasma
 * (um span de 6/12 gravado num grid de 4 estoura a grade).
 */
export function positionAt(block: LayoutBlock, bp: Breakpoint): Resolved {
  const r = resolvePosition(block, bp)
  return { ...r, pos: convert(r.pos, gridFor(r.ownedBy).columns, gridFor(bp).columns) }
}

let seq = 0
export const newId = () => `b${++seq}`
