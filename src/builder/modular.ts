/**
 * MODELO DO LAYOUT — o contrato que sai do builder e que o site real consome.
 * O Renderer entende este objeto sozinho; o Editor não precisa existir para ele
 * funcionar.
 *
 * Portado de `Builder Modular v2.dc.html` (o desenho feito no Claude Design). O que veio de lá: a grade 2D em x/y/w/h, os 5 breakpoints, a colisão
 * e a ideia de que uma `secao` CONTÉM outras peças em vez de colidir com elas.
 * O que NÃO veio de lá: nenhuma cor, sombra ou tamanho literal — no protótipo
 * eles eram `rgb(...)` fixos; aqui tudo isso é responsabilidade do DS.
 */

export const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), max)

/** Escalas do protótipo, com as colunas de cada uma. */
export const BREAKPOINTS = [
  { w: 1440, h: 900, cols: 12 },
  { w: 1280, h: 720, cols: 12 },
  { w: 768, h: 1024, cols: 8 },
  { w: 640, h: 840, cols: 6 },
  { w: 390, h: 844, cols: 4 },
] as const

export type BreakpointW = (typeof BREAKPOINTS)[number]['w']
export const LARGURAS = BREAKPOINTS.map((b) => b.w) as unknown as BreakpointW[]
export const bpDe = (w: BreakpointW) => BREAKPOINTS.find((b) => b.w === w) ?? BREAKPOINTS[0]

/** Altura da grade em linhas. 22 é o valor do protótipo. */
export const LINHAS_PADRAO = 22

/**
 * Uma peça no palco. `x`/`y` são célula da grade (base 0), `w`/`h` em células.
 * Duas dimensões, não uma: foi assim que o Modular v2 foi desenhado, e é o que
 * permite `secao` conter outras peças.
 */
export interface Peca {
  id: string
  /** Chave no catálogo (ex.: 'botao', 'grade', 'modal'). */
  tipo: string
  x: number
  y: number
  w: number
  h: number
  /** Valores dos campos declarados em FIELDS. Nunca cor, fonte ou tamanho literal do DS. */
  props: Record<string, unknown>
}

export interface Pagina {
  id: string
  nome: string
  pecas: Peca[]
}

export interface Layout {
  version: 1
  /** Largura de referência em que o layout foi montado. */
  base: BreakpointW
  linhas: number
  paginas: Pagina[]
}

// ── Geometria ───────────────────────────────────────────────────────────────

type Caixa = { id?: string; tipo?: string; x: number; y: number; w: number; h: number }

/** `c` contém `p` inteiramente? É isto que permite uma seção abrigar peças. */
export const contem = (c: Caixa, p: Caixa) =>
  c.x <= p.x && c.y <= p.y && c.x + c.w >= p.x + p.w && c.y + c.h >= p.y + p.h

export const sobrepoe = (a: Caixa, b: Caixa) =>
  a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h

/**
 * Sobreposição que CONTA como colisão.
 * Uma `secao` que contém a peça não colide com ela — é o mecanismo de container:
 * sem esta exceção, soltar qualquer coisa dentro de um painel seria empurrado
 * para fora imediatamente.
 */
export function colide(a: Caixa, b: Caixa) {
  if (a.id && a.id === b.id) return false
  if (a.tipo === 'secao' && contem(a, b)) return false
  if (b.tipo === 'secao' && contem(b, a)) return false
  return sobrepoe(a, b)
}

/** Peças que uma seção abriga, para mover junto. */
export const filhosDaSecao = (secao: Peca, todas: Peca[]) =>
  secao.tipo === 'secao' ? todas.filter((p) => p.id !== secao.id && contem(secao, p)) : []

/**
 * Converte a grade de uma escala para outra, proporcionalmente.
 * Uma peça que ocupa metade continua ocupando metade. A LINHA não converte — é
 * ela que mantém a peça no mesmo lugar vertical entre escalas.
 */
export function converter(p: Peca, deCols: number, paraCols: number): Peca {
  if (deCols === paraCols) return p
  const f = paraCols / deCols
  const w = clamp(Math.round(p.w * f), 1, paraCols)
  const x = clamp(Math.round(p.x * f), 0, Math.max(0, paraCols - w))
  return { ...p, x, w }
}

let seq = 0
export const novoId = () => `p${++seq}`

/**
 * Editar: o clique seleciona a peça e os componentes ficam inertes.
 * Visualizar: o clique chega ao componente e o comportamento roda de verdade.
 * Sem esta separação, um Modal que abre ao clique impede mover a própria peça.
 * No protótipo isto era o estado `preview`.
 */
export type Modo = 'editar' | 'visualizar'
