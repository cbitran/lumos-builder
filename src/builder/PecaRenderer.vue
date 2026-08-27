<script lang="ts">
/**
 * RENDERER DAS PEÇAS — é aqui que o `Builder Modular v2` encosta no Design System.
 *
 * No protótipo do Claude Design cada peça era desenhada à mão: um `botao` era uma
 * `<div>` com `background: linear-gradient(145deg, rgb(40,43,49), rgb(29,31,36))`
 * e sombra literal. Bonito e morto — não abria, não navegava, não validava.
 *
 * Aqui cada peça É o componente do DS, resolvido pelo manifesto de 121
 * componentes do @nuxt/ui 4.9 que o Storybook documenta. O `modal` abre de
 * verdade; o `carrossel` navega; o `accordion` sanfona; a `notificação` dispara
 * o toast que o `<UApp>` desenha por cima de tudo.
 *
 * Render function em vez de <template>: são 29 tipos com formas de slot muito
 * diferentes, e um `v-if` dentro de <component> declara slot default SEMPRE —
 * o que quebra os componentes de formulário com "Cannot set properties of null".
 */
import { defineComponent, h, type Component, type PropType, type VNode } from 'vue'
import { useToast } from '@nuxt/ui/composables'
import { nuxtUiComponents } from '../ds/nuxt-ui-components.generated'
import { acharTipo } from './modular-catalog'
import type { Peca } from './modular'

const C = (nome: string): Component | undefined => nuxtUiComponents[nome]

// ── Tradutores: vocabulário do desenho → vocabulário do DS ──────────────────
// O protótipo fala "Primário/Secundário/Fantasma"; o DS fala color+variant.
// Esta tabela é a única ponte entre os dois, e existe para o Inspector poder
// continuar mostrando as palavras que o Celio escolheu.

const TAMANHO: Record<string, string> = { Pequeno: 'sm', 'Médio': 'md', Grande: 'lg' }

const VARIANTE_BOTAO: Record<string, { color: string; variant: string }> = {
  'Primário': { color: 'primary', variant: 'solid' },
  'Secundário': { color: 'neutral', variant: 'outline' },
  Fantasma: { color: 'neutral', variant: 'ghost' },
}

const VARIANTE_BADGE: Record<string, { color: string; variant: string }> = {
  Marca: { color: 'primary', variant: 'solid' },
  Neutra: { color: 'neutral', variant: 'soft' },
  Contorno: { color: 'neutral', variant: 'outline' },
}

/** Tom do protótipo → papel de cor semântico do DS. Nunca cor literal. */
const TOM: Record<string, string> = {
  Info: 'info', Sucesso: 'success', Aviso: 'warning', Erro: 'error',
}

/** Superfície da seção → variante do UCard. */
const SUPERFICIE: Record<string, string> = {
  Plana: 'outline', Relevo: 'subtle', Rebaixada: 'soft', Marca: 'solid',
}

const ALINHA: Record<string, string> = {
  Esquerda: 'left', Centro: 'center', Direita: 'right',
}

const PESO: Record<string, number> = {
  Regular: 400, Medium: 500, Semibold: 600, Bold: 700,
}

/** Cor do título → papel semântico. `text-*` do DS, não do Tailwind cru. */
const COR_TITULO: Record<string, string> = {
  'Padrão': 'text-highlighted', Suave: 'text-muted', Marca: 'text-primary',
}

const RAZAO: Record<string, string> = {
  '1:1': '1 / 1', '3:4': '3 / 4', '16:9': '16 / 9', Livre: 'auto',
}

const n = (v: unknown, padrao: number) => (typeof v === 'number' ? v : padrao)
const s = (v: unknown, padrao = '') => (v == null ? padrao : String(v))
const b = (v: unknown) => Boolean(v)
const lista = (q: number) => Array.from({ length: Math.max(0, q) }, (_, i) => i)

const ITENS_MENU = ['Cassino', 'Esportes', 'Ao vivo', 'Promoções', 'Cassino ao vivo', 'Aviator']
const JOGOS = [
  { n: 'Aviator', p: 'Spribe' }, { n: 'Gates of Olympus', p: 'Pragmatic' },
  { n: 'Fortune Tiger', p: 'PG Soft' }, { n: 'Sweet Bonanza', p: 'Pragmatic' },
  { n: 'Mahjong Ways', p: 'PG Soft' }, { n: 'Spaceman', p: 'Pragmatic' },
]

export default defineComponent({
  name: 'PecaRenderer',
  props: {
    peca: { type: Object as PropType<Peca>, required: true },
    /** Em 'editar' o componente é inerte; o escudo do palco intercepta o clique. */
    inerte: { type: Boolean, default: false },
  },
  setup() {
    // O toast é global: quem o desenha é o container do <UApp>, não a grade.
    // Por isso a peça `toast` é um GATILHO, exatamente como a story do DS.
    const toast = useToast()
    return { toast }
  },
  render() {
    const p = this.peca.props
    const tipo = this.peca.tipo
    const meta = acharTipo(tipo)
    if (!meta) return h('div')

    const cheio = { width: '100%', height: '100%' }

    switch (tipo) {
      // ── Layout ───────────────────────────────────────────────────────────
      case 'secao': {
        // A seção é um container: as peças que ela abriga vivem na grade, por
        // cima dela — não são filhas no DOM. Ver `colide` em modular.ts.
        return h(C('UCard')!, {
          variant: SUPERFICIE[s(p.fundo, 'Relevo')] ?? 'subtle',
          style: { ...cheio, padding: n(p.preenchimento, 16) + 'px' },
          ui: { body: { padding: '0' } },
        })
      }
      case 'divisor':
        return h('div', { style: { ...cheio, display: 'flex', alignItems: 'center' } }, [
          h(C('USeparator')!, {
            color: s(p.tom) === 'Marca' ? 'primary' : 'neutral',
            size: s(p.tom) === 'Forte' ? 'lg' : 'xs',
            style: { width: '100%' },
          }),
        ])
      case 'barraNav': {
        const filhos: VNode[] = []
        if (b(p.comLogo)) {
          filhos.push(h('span', { class: 'font-semibold text-highlighted' }, s(p.marca, 'Marca')))
        }
        filhos.push(
          h(C('UNavigationMenu')!, {
            items: lista(n(p.itens, 4)).map((i) => ({ label: ITENS_MENU[i % ITENS_MENU.length] })),
          }),
        )
        if (b(p.comAcao)) {
          filhos.push(h('div', { style: { marginLeft: 'auto' } }, [
            h(C('UButton')!, { label: s(p.acao, 'Entrar'), color: 'primary' }),
          ]))
        }
        return h('div', {
          class: 'flex items-center gap-4 rounded-lg border border-default bg-elevated px-4',
          style: cheio,
        }, filhos)
      }
      case 'abas':
        return h(C('UTabs')!, {
          items: lista(n(p.itens, 3)).map((i) => ({ label: ITENS_MENU[i % ITENS_MENU.length] })),
          variant: s(p.formato) === 'Sublinhado' ? 'link' : 'pill',
          style: { width: '100%' },
        })

      // ── Conteúdo ─────────────────────────────────────────────────────────
      case 'titulo':
        return h('div', {
          class: COR_TITULO[s(p.cor, 'Padrão')] ?? 'text-highlighted',
          style: {
            ...cheio,
            fontSize: n(p.tamanho, 26) + 'px',
            fontWeight: PESO[s(p.peso, 'Semibold')] ?? 600,
            textAlign: ALINHA[s(p.alinhamento, 'Esquerda')],
            lineHeight: 1.2,
          },
        }, s(p.texto, 'Título da seção'))
      case 'texto':
        return h('div', {
          class: 'text-muted',
          style: {
            ...cheio,
            fontSize: n(p.tamanho, 14) + 'px',
            textAlign: ALINHA[s(p.alinhamento, 'Esquerda')],
            lineHeight: 1.5,
          },
        }, s(p.texto, ''))
      case 'imagem':
        return h('div', {
          class: 'grid place-items-center rounded-lg border border-dashed border-default bg-muted text-dimmed',
          style: { ...cheio, aspectRatio: RAZAO[s(p.proporcao, 'Livre')] },
        }, [
          h(C('UIcon')!, { name: 'i-lucide-image', class: 'size-6' }),
          h('span', { class: 'ml-2 text-sm' }, s(p.rotulo, 'Imagem')),
        ])
      case 'badge': {
        const v = VARIANTE_BADGE[s(p.variante, 'Marca')] ?? VARIANTE_BADGE.Marca
        return h(C('UBadge')!, {
          label: s(p.texto, 'Etiqueta'),
          size: s(p.tamanho) === 'Pequeno' ? 'sm' : 'md',
          ...v,
        })
      }

      // ── Ações ────────────────────────────────────────────────────────────
      case 'botao': {
        const v = VARIANTE_BOTAO[s(p.variante, 'Primário')] ?? VARIANTE_BOTAO['Primário']
        const lado = s(p.icone, 'Nenhum')
        return h(C('UButton')!, {
          label: s(p.texto, 'Ação principal'),
          size: TAMANHO[s(p.tamanho, 'Médio')] ?? 'md',
          ...v,
          ...(lado === 'Esquerda' ? { icon: 'i-lucide-rocket' } : {}),
          ...(lado === 'Direita' ? { trailingIcon: 'i-lucide-arrow-right' } : {}),
        })
      }
      case 'grupoBotoes':
        // UFieldGroup, NÃO UButtonGroup — este não existe no @nuxt/ui 4.9.
        return h(C('UFieldGroup')!, {}, {
          default: () => [
            h(C('UButton')!, { label: s(p.primario, 'Confirmar'), color: 'primary' }),
            h(C('UButton')!, { label: s(p.secundario, 'Cancelar'), color: 'neutral', variant: 'outline' }),
          ],
        })
      case 'campo':
      case 'busca':
        return h(C('UInput')!, {
          placeholder: s(p.placeholder, 'Digite aqui'),
          ...(b(p.comIcone) ? { icon: 'i-lucide-search' } : {}),
          required: b(p.obrigatorio),
          style: { width: '100%' },
        })

      // ── Coleções ─────────────────────────────────────────────────────────
      case 'grade': {
        const cols = n(p.colunas, 3)
        const rows = n(p.linhas, 2)
        const cabeca = b(p.mostrarTitulo)
          ? h('div', { class: 'mb-3 flex items-center justify-between' }, [
              h('span', { class: 'font-semibold text-highlighted' }, s(p.titulo, '')),
              h(C('UButton')!, { label: s(p.acao, 'Ver todos'), variant: 'link', color: 'primary', size: 'sm' }),
            ])
          : null
        const celulas = lista(cols * rows).map((i) =>
          h(C('UCard')!, { variant: 'subtle', ui: { body: { padding: 'p-2' } } }, {
            default: () => [
              h('div', { class: 'grid aspect-[3/4] place-items-center rounded bg-muted text-dimmed' }, [
                h(C('UIcon')!, { name: 'i-lucide-gamepad-2', class: 'size-5' }),
              ]),
              b(p.legenda)
                ? h('div', { class: 'mt-1.5 truncate text-xs text-highlighted' }, JOGOS[i % JOGOS.length].n)
                : null,
            ].filter(Boolean),
          }),
        )
        return h('div', { style: { ...cheio, display: 'flex', flexDirection: 'column', overflow: 'hidden' } }, [
          cabeca,
          h('div', {
            style: {
              display: 'grid',
              gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
              gap: n(p.gap, 12) + 'px',
              flex: '1',
              minHeight: '0',
            },
          }, celulas),
        ].filter(Boolean) as VNode[])
      }
      case 'carrossel':
        return h(C('UCarousel')!, {
          items: JOGOS,
          arrows: true,
          dots: b(p.indicadores),
          autoplay: b(p.autoplay) ? { delay: n(p.intervalo, 6) * 1000 } : false,
          ui: { item: `basis-1/${Math.max(1, n(p.slides, 3))}`, container: 'gap-3' },
          style: { width: '100%' },
        }, {
          default: ({ item }: { item: { n: string; p: string } }) => [
            h('div', { class: 'w-full overflow-hidden rounded-lg border border-default bg-elevated' }, [
              h('div', { class: 'grid aspect-[3/4] place-items-center bg-muted text-dimmed' }, [
                h(C('UIcon')!, { name: 'i-lucide-gamepad-2', class: 'size-6' }),
              ]),
              h('div', { class: 'px-2 py-1.5' }, [
                h('div', { class: 'truncate text-xs font-semibold text-highlighted' }, item.n),
                h('div', { class: 'truncate text-[11px] text-muted' }, item.p),
              ]),
            ]),
          ],
        })
      case 'lista': {
        const linhas = lista(n(p.itens, 4)).map((i) =>
          h('div', {
            class: [
              'flex items-center gap-3 py-2',
              b(p.divisorias) && i > 0 ? 'border-t border-default' : '',
            ].filter(Boolean).join(' '),
          }, [
            b(p.comIcone) ? h(C('UIcon')!, { name: 'i-lucide-gamepad-2', class: 'size-4 text-dimmed' }) : null,
            h('span', { class: 'flex-1 truncate text-sm text-highlighted' }, JOGOS[i % JOGOS.length].n),
            b(p.comValor) ? h('span', { class: 'text-sm tabular-nums text-muted' }, 'R$ ' + (100 + i * 37) + ',00') : null,
          ].filter(Boolean) as VNode[]),
        )
        return h(C('UCard')!, { variant: 'subtle', style: cheio }, { default: () => linhas })
      }
      case 'tabela': {
        const cols = n(p.colunas, 4)
        const rows = n(p.linhas, 4)
        const chaves = ['jogo', 'provedor', 'rodadas', 'valor', 'multiplicador', 'data'].slice(0, cols)
        const dados = lista(rows).map((i) => {
          const linha: Record<string, string> = {}
          chaves.forEach((k, j) => {
            linha[k] = j === 0 ? JOGOS[i % JOGOS.length].n
              : j === 1 ? JOGOS[i % JOGOS.length].p
              : String((i + 1) * (j + 7))
          })
          return linha
        })
        return h(C('UTable')!, { data: dados, style: cheio })
      }

      // ── Feedback ─────────────────────────────────────────────────────────
      case 'alerta':
        return h(C('UAlert')!, {
          title: s(p.titulo, 'Título do aviso'),
          description: s(p.texto, ''),
          color: TOM[s(p.tom, 'Info')] ?? 'info',
          variant: 'soft',
          style: { width: '100%' },
        })
      case 'progresso':
        return h('div', { style: { ...cheio, display: 'flex', flexDirection: 'column', gap: '6px', justifyContent: 'center' } }, [
          h('span', { class: 'text-xs text-muted' }, s(p.rotulo, 'Progresso')),
          h(C('UProgress')!, { modelValue: n(p.valor, 60) }),
        ])
      case 'skeleton':
        return h('div', { style: { ...cheio, display: 'flex', flexDirection: 'column', gap: '8px' } },
          lista(n(p.linhas, 3)).map((i) =>
            h(C('USkeleton')!, { class: 'h-4', style: { width: i % 2 ? '70%' : '100%' } }),
          ),
        )
      case 'modal':
        // COMPORTAMENTO REAL: o slot default é o gatilho; o rodapé recebe
        // `{ close }` e é isso que faz Cancelar/Confirmar fecharem o diálogo.
        return h(C('UModal')!, {
          title: s(p.titulo, 'Título do modal'),
          description: s(p.texto, ''),
          fullscreen: b(p.telaCheia),
        }, {
          default: () => [h(C('UButton')!, { label: s(p.gatilho, 'Abrir modal'), color: 'primary' })],
          footer: ({ close }: { close: () => void }) => [
            h('div', { class: 'flex w-full justify-end gap-2' }, [
              h(C('UButton')!, { label: 'Cancelar', color: 'neutral', variant: 'outline', onClick: close }),
              h(C('UButton')!, { label: 'Confirmar', color: 'primary', onClick: close }),
            ]),
          ],
        })
      case 'toast':
        return h(C('UButton')!, {
          label: s(p.gatilho, 'Mostrar notificação'),
          color: TOM[s(p.tom, 'Sucesso')] ?? 'success',
          icon: 'i-lucide-bell-ring',
          onClick: () => {
            // Em modo Editar o palco intercepta o clique antes daqui; esta
            // guarda existe para o caso de o renderer ser usado fora do palco.
            if (this.inerte) return
            this.toast.add({
              title: s(p.titulo, 'Aposta confirmada'),
              description: s(p.texto, ''),
              color: TOM[s(p.tom, 'Sucesso')] ?? 'success',
              icon: 'i-lucide-circle-check',
            })
          },
        })

      // ── Formulário ───────────────────────────────────────────────────────
      case 'checkbox':
        return h(C('UCheckbox')!, {
          label: s(p.rotulo, 'Aceito os termos'),
          defaultValue: b(p.marcado),
          disabled: b(p.desabilitado),
        })
      case 'radioGroup':
        return h(C('URadioGroup')!, {
          items: lista(n(p.itens, 3)).map((i) => ({ label: ITENS_MENU[i % ITENS_MENU.length], value: String(i) })),
          defaultValue: String(n(p.selecionado, 0)),
        })
      case 'select':
        return h(C('USelect')!, {
          items: ITENS_MENU.slice(0, 4).map((l) => ({ label: l, value: l })),
          placeholder: s(p.opcao, 'Selecionar opção'),
          ...(b(p.comIcone) ? { icon: 'i-lucide-list-filter' } : {}),
          style: { width: '100%' },
        })
      case 'avatar':
        return h(C('UAvatar')!, { text: s(p.iniciais, 'MR'), size: s(p.tamanho, 'md') })

      // ── Navegação ────────────────────────────────────────────────────────
      case 'breadcrumb':
        return h(C('UBreadcrumb')!, {
          items: lista(n(p.itens, 3)).map((i) => ({ label: ['Início', 'Cassino', 'Slots', 'Fortune Tiger'][i] ?? 'Nível' })),
        })
      case 'pagination':
        return h(C('UPagination')!, {
          total: n(p.paginas, 5) * 10,
          itemsPerPage: 10,
          defaultPage: n(p.atual, 1),
        })
      case 'chip':
        // UChip envolve outro elemento — é um indicador de canto, não uma pílula.
        return h(C('UChip')!, { color: 'error', text: b(p.removivel) ? '3' : undefined }, {
          default: () => [h(C('UButton')!, { label: s(p.texto, 'Chip'), color: 'neutral', variant: 'subtle' })],
        })
      case 'kbd':
        return h(C('UKbd')!, {}, { default: () => [s(p.texto, '⌘K')] })
      case 'accordion':
        return h(C('UAccordion')!, {
          items: lista(n(p.itens, 3)).map((i) => ({
            label: ['Como funciona', 'Regras do bônus', 'Prazos de saque', 'Limites', 'Suporte'][i] ?? 'Item',
            content: 'Conteúdo de exemplo deste item.',
          })),
          defaultValue: String(n(p.aberto, 0)),
          style: { width: '100%' },
        })

      default:
        return h('div')
    }
  },
})
</script>
