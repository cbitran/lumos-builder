/**
 * BATERIA DE COMPORTAMENTO — prova que as peças não só desenham, mas FUNCIONAM.
 *
 * O harness de tamanho pega a peça que some (altura zero). Esta bateria pega a
 * peça que aparece bonita e está morta: o modal que não abre, a aba que não
 * troca, o carrossel que não anda. Era isso que o protótipo do Claude Design
 * tinha — aparência sem comportamento — e é o que esta entrega existe para
 * consertar. Sem esta bateria, "conectei ao Storybook" seria afirmação sem prova.
 *
 * DESLIGA AS ANIMAÇÕES ENQUANTO RODA, e o motivo é uma lição paga:
 * o reka-ui só desmonta o overlay quando a animação de saída termina, e
 * animação CSS NÃO RODA em aba de segundo plano. Sem desligar, o modal fechava
 * de verdade (`data-state="closed"`) mas continuava na tela, e a bateria
 * acusava um bug que não existia.
 */

export interface Resultado {
  tipo: string
  o_que: string
  /** null = NÃO VERIFICÁVEL neste ambiente. Ver `naoVerificavel` abaixo. */
  passou: boolean | null
  detalhe: string
}

/**
 * Alguns comportamentos dependem de `requestAnimationFrame`, que o navegador
 * SUSPENDE em aba de segundo plano. O carrossel (Embla) é o caso: ele anima o
 * trilho por rAF, então numa aba oculta ele nunca se move — mesmo funcionando
 * perfeitamente para uma pessoa olhando.
 *
 * Reprovar isso seria mentira. Marcar como "não verificável" é a verdade, e
 * deixa explícito o que ainda precisa de um par de olhos.
 */
const abaOculta = () => document.visibilityState === 'hidden'

const esperar = (ms: number) => new Promise((r) => setTimeout(r, ms))
const caixa = (tipo: string) => document.querySelector(`[data-caso="${tipo}"]`)
const dialogos = () => document.querySelectorAll('[role="dialog"]').length

function semAnimacao() {
  const el = document.createElement('style')
  el.dataset.harness = 'sem-animacao'
  el.textContent = '*,*::before,*::after{animation:none!important;transition:none!important}'
  document.head.appendChild(el)
  return () => el.remove()
}

/**
 * Clique de verdade, com a sequência completa de eventos de ponteiro.
 * `.click()` puro NÃO serve: o reka-ui (base do @nuxt/ui) escuta `pointerdown`
 * em vários controles — as abas, entre eles. Testar com `.click()` acusava a
 * aba como quebrada quando ela funciona.
 */
function clicarReal(alvo: HTMLElement) {
  for (const t of ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click']) {
    alvo.dispatchEvent(new MouseEvent(t, { bubbles: true, cancelable: true }))
  }
}

/** Clica no primeiro elemento que casar com o seletor dentro da peça. */
async function clicar(tipo: string, seletor: string, indice = 0) {
  const alvos = caixa(tipo)?.querySelectorAll<HTMLElement>(seletor)
  const alvo = alvos?.[indice]
  if (!alvo) return false
  clicarReal(alvo)
  await esperar(150)
  return true
}

type Teste = { tipo: string; o_que: string; rodar: () => Promise<[boolean | null, string]> }

const TESTES: Teste[] = [
  {
    tipo: 'modal',
    o_que: 'o gatilho abre o diálogo e o rodapé fecha',
    rodar: async () => {
      if (dialogos() > 0) return [false, 'já havia um diálogo aberto antes do teste']
      await clicar('modal', 'button')
      if (dialogos() !== 1) return [false, 'o gatilho não abriu o diálogo']
      const dlg = document.querySelector('[role="dialog"]')!
      const cancelar = [...dlg.querySelectorAll('button')].find((b) => b.textContent?.trim() === 'Cancelar')
      if (!cancelar) return [false, 'o rodapé não tem o botão Cancelar']
      clicarReal(cancelar)
      await esperar(250)
      return dialogos() === 0
        ? [true, 'abriu e fechou pelo rodapé']
        : [false, 'Cancelar não fechou — o `close` do escopo do slot não chegou ao botão']
    },
  },
  {
    tipo: 'toast',
    o_que: 'o botão dispara a notificação flutuante',
    rodar: async () => {
      const antes = document.querySelectorAll('[data-slot="toast"], li[data-state]').length
      await clicar('toast', 'button')
      await esperar(350)
      const depois = document.querySelectorAll('[data-slot="toast"], li[data-state]').length
      return depois > antes
        ? [true, `${depois - antes} notificação(ões) na tela`]
        : [false, 'nada apareceu — o <UApp> provê o container do toast; confira se ele envolve a árvore']
    },
  },
  {
    tipo: 'accordion',
    o_que: 'clicar num item abre o conteúdo',
    rodar: async () => {
      const alvo = caixa('accordion')?.querySelectorAll<HTMLElement>('button')[1]
      if (!alvo) return [false, 'não achei o segundo item']
      const antes = alvo.getAttribute('data-state')
      clicarReal(alvo)
      await esperar(250)
      const depois = alvo.getAttribute('data-state')
      return antes !== depois
        ? [true, `data-state ${antes} → ${depois}`]
        : [false, `data-state não mudou (${antes})`]
    },
  },
  {
    tipo: 'abas',
    o_que: 'clicar troca a aba selecionada',
    rodar: async () => {
      const abas = caixa('abas')?.querySelectorAll<HTMLElement>('[role="tab"]')
      if (!abas || abas.length < 2) return [false, 'menos de duas abas no DOM']
      const antes = [...abas].findIndex((a) => a.getAttribute('aria-selected') === 'true')
      clicarReal(abas[1])
      await esperar(250)
      const depois = [...abas].findIndex((a) => a.getAttribute('aria-selected') === 'true')
      return depois === 1 && depois !== antes
        ? [true, `aba ${antes} → ${depois}`]
        : [false, `seleção não mudou (${antes} → ${depois})`]
    },
  },
  {
    tipo: 'carrossel',
    o_que: 'a seta avança os slides',
    rodar: async (): Promise<[boolean | null, string]> => {
      const ca = caixa('carrossel')
      const trilho = ca?.querySelector('.overflow-hidden')?.firstElementChild as HTMLElement | null
      if (!trilho) return [false, 'não achei o trilho do carrossel']

      // O Embla mede o contêiner ao iniciar. Numa aba oculta essa medida sai
      // errada e ele conclui que não há para onde rolar (Next nasce
      // desabilitado). Um `resize` força a remedição.
      window.dispatchEvent(new Event('resize'))
      await esperar(300)

      const next = [...(ca?.querySelectorAll<HTMLElement>('button') ?? [])]
        .find((b) => b.getAttribute('aria-label') === 'Next')
      if (!next) return [false, 'não achei a seta Next']
      if ((next as HTMLButtonElement).disabled) {
        return [false, 'a seta Next continua desabilitada mesmo após remedição — o trilho não tem overflow']
      }

      const antes = getComputedStyle(trilho).transform
      clicarReal(next)
      await esperar(500)
      const depois = getComputedStyle(trilho).transform

      if (antes === depois) {
        // O Embla anima por requestAnimationFrame, suspenso em aba oculta.
        if (abaOculta()) {
          return [null, 'não verificável: o Embla anima por requestAnimationFrame, suspenso em aba oculta. Abra a página numa aba visível para conferir']
        }
        return [false, 'o trilho não se moveu']
      }
      return [true, 'o trilho andou']
    },
  },
  {
    tipo: 'checkbox',
    o_que: 'clicar marca e desmarca',
    rodar: async () => {
      const cx = caixa('checkbox')?.querySelector<HTMLElement>('button[role="checkbox"], input[type="checkbox"]')
      if (!cx) return [false, 'não achei o controle']
      const antes = cx.getAttribute('aria-checked') ?? String((cx as HTMLInputElement).checked)
      clicarReal(cx)
      await esperar(250)
      const depois = cx.getAttribute('aria-checked') ?? String((cx as HTMLInputElement).checked)
      return antes !== depois ? [true, `${antes} → ${depois}`] : [false, `não mudou (${antes})`]
    },
  },
  {
    tipo: 'select',
    o_que: 'clicar abre a lista de opções',
    rodar: async () => {
      await clicar('select', 'button')
      await esperar(250)
      const lista = document.querySelectorAll('[role="listbox"], [role="option"]').length
      // fecha para não sujar os testes seguintes
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
      await esperar(150)
      return lista > 0 ? [true, `${lista} nó(s) de lista abertos`] : [false, 'nenhuma lista abriu']
    },
  },
  {
    tipo: 'pagination',
    o_que: 'clicar troca a página atual',
    rodar: async () => {
      const btns = caixa('pagination')?.querySelectorAll<HTMLElement>('button')
      if (!btns || btns.length < 3) return [false, 'poucos botões no DOM']
      const alvo = [...btns].find((b) => b.textContent?.trim() === '3')
      if (!alvo) return [false, 'não achei a página 3']
      clicarReal(alvo)
      await esperar(300)
      const ativo = [...(caixa('pagination')?.querySelectorAll<HTMLElement>('button') ?? [])]
        .find((b) => b.getAttribute('aria-current') === 'page' || b.dataset.state === 'active')
      return ativo?.textContent?.trim() === '3'
        ? [true, 'página atual virou 3']
        : [false, `página atual continua "${ativo?.textContent?.trim() ?? '?'}"`]
    },
  },
  {
    tipo: 'campo',
    o_que: 'aceita digitação',
    rodar: async () => {
      const input = caixa('campo')?.querySelector<HTMLInputElement>('input')
      if (!input) return [false, 'não achei o input']
      input.focus()
      input.value = 'teste'
      input.dispatchEvent(new Event('input', { bubbles: true }))
      await esperar(120)
      return input.value === 'teste' ? [true, 'o valor foi aceito'] : [false, 'o valor não entrou']
    },
  },
  {
    tipo: 'radioGroup',
    o_que: 'clicar troca a opção selecionada',
    rodar: async () => {
      const opcoes = caixa('radioGroup')?.querySelectorAll<HTMLElement>('[role="radio"]')
      if (!opcoes || opcoes.length < 2) return [false, 'menos de duas opções']
      const antes = [...opcoes].findIndex((o) => o.getAttribute('aria-checked') === 'true')
      clicarReal(opcoes[1])
      await esperar(250)
      const depois = [...opcoes].findIndex((o) => o.getAttribute('aria-checked') === 'true')
      return depois !== antes ? [true, `opção ${antes} → ${depois}`] : [false, `não mudou (${antes})`]
    },
  },
]

export async function rodarComportamentos(): Promise<Resultado[]> {
  const restaurar = semAnimacao()
  const saida: Resultado[] = []
  for (const t of TESTES) {
    try {
      const [passou, detalhe] = await t.rodar()
      saida.push({ tipo: t.tipo, o_que: t.o_que, passou, detalhe })
    } catch (e) {
      saida.push({ tipo: t.tipo, o_que: t.o_que, passou: false, detalhe: `erro: ${(e as Error).message}` })
    }
    await esperar(80)
  }
  restaurar()
  return saida
}

export const QUANTOS_TESTES = TESTES.length
