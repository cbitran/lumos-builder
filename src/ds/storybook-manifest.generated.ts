// AUTO-GERADO por scripts/gen-ds-manifest.mjs — NÃO editar à mão.
// Fonte: <DS_ROOT>/storybook/src/*.stories.ts
// 46 componentes lidos do Storybook do DS.
//
// O Inspector usa estes campos QUANDO existem; quando o Storybook não declara
// argTypes, ele cai nos `fields` escritos à mão em src/builder/catalog.ts.
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
export const DS_MANIFEST: Record<string, StoryMeta> = {
  "Accordion": {
    "title": "Components/Accordion",
    "component": "Accordion",
    "description": "Seções expansíveis (FAQ, detalhes de aposta). Espelha o `UAccordion` do @nuxt/ui v4. `items` = `{ label, content }[]`.",
    "args": {
      "type": "single",
      "collapsible": true,
      "disabled": false
    },
    "argTypes": {
      "type": {
        "control": "select",
        "options": [
          "single",
          "multiple"
        ],
        "description": "Abrir um ou vários itens ao mesmo tempo"
      },
      "collapsible": {
        "control": "boolean",
        "description": "Permite fechar o item aberto (modo single)"
      },
      "disabled": {
        "control": "boolean"
      },
      "trailingIcon": {
        "control": "text",
        "description": "Ícone indicador (padrão chevron-down)"
      },
      "unmountOnHide": {
        "control": "boolean",
        "description": "Desmonta o conteúdo ao fechar"
      }
    },
    "stories": [
      "Default",
      "Multiple"
    ]
  },
  "Alert": {
    "title": "Components/Alert",
    "component": "Alert",
    "description": "Aviso para chamar a atenção (`UAlert` do @nuxt/ui): banner com ícone, título, descrição e ações/close opcionais. Use para mensagens de sistema (aposta confirmada, depósito recebido, erro, KYC pendente). `variant` solid/outline/soft/subtle × `color` (estado). `actions` insere botões; `close` mostra o X.",
    "args": {
      "color": "success",
      "variant": "soft",
      "title": "Aposta confirmada",
      "description": "Sua aposta foi registrada com sucesso.",
      "icon": "i-lucide-circle-check"
    },
    "argTypes": {
      "color": {
        "control": "select",
        "options": [
          "primary",
          "secondary",
          "success",
          "info",
          "warning",
          "error",
          "neutral"
        ],
        "description": "Cor/estado."
      },
      "variant": {
        "control": "inline-radio",
        "options": [
          "solid",
          "outline",
          "soft",
          "subtle"
        ],
        "description": "Estilo visual."
      },
      "title": {
        "control": "text",
        "description": "Título."
      },
      "description": {
        "control": "text",
        "description": "Descrição."
      },
      "icon": {
        "control": "text",
        "description": "Ícone (ex.: i-lucide-check-circle)."
      },
      "close": {
        "control": "boolean",
        "description": "Mostra botão de fechar."
      }
    },
    "stories": [
      "Playground",
      "Variants",
      "Colors",
      "WithActions"
    ]
  },
  "Avatar": {
    "title": "Components/Avatar",
    "component": "Avatar",
    "description": "Avatar (`UAvatar` do @nuxt/ui): imagem com fallback de iniciais ou ícone, em círculo. Use para perfil do usuário, times/escudos, lista de participantes. `text` = iniciais, `src` = imagem, `icon` = ícone; `color` tinge o fallback; `chip` adiciona um indicador de status no canto. Tamanhos do DS: sm/md/lg.",
    "args": {
      "text": "CB",
      "color": "primary",
      "size": "md"
    },
    "argTypes": {
      "text": {
        "control": "text",
        "description": "Iniciais (fallback)."
      },
      "src": {
        "control": "text",
        "description": "URL da imagem."
      },
      "icon": {
        "control": "text",
        "description": "Ícone (ex.: i-lucide-user)."
      },
      "color": {
        "control": "select",
        "options": [
          "primary",
          "secondary",
          "success",
          "info",
          "warning",
          "error",
          "neutral"
        ],
        "description": "Cor do fallback."
      },
      "size": {
        "control": "inline-radio",
        "options": [
          "sm",
          "md",
          "lg"
        ],
        "description": "Tamanho."
      }
    },
    "stories": [
      "Playground",
      "Sizes",
      "Colors",
      "Content",
      "WithStatus",
      "Group"
    ]
  },
  "Badge": {
    "title": "Components/Badge",
    "component": "Badge",
    "description": null,
    "args": {
      "label": "Badge",
      "color": "primary",
      "variant": "solid",
      "size": "md"
    },
    "argTypes": {
      "color": {
        "control": "select",
        "options": [
          "primary",
          "secondary",
          "success",
          "info",
          "warning",
          "error",
          "neutral"
        ]
      },
      "variant": {
        "control": "select",
        "options": [
          "solid",
          "outline",
          "soft",
          "subtle"
        ]
      },
      "size": {
        "control": "select",
        "options": [
          "xs",
          "sm",
          "md",
          "lg",
          "xl"
        ]
      },
      "label": {
        "control": "text"
      }
    },
    "stories": [
      "Playground",
      "Colors",
      "Variants",
      "Live",
      "Sizes"
    ]
  },
  "Brand": {
    "title": "Foundations/Brand",
    "component": "Brand",
    "description": "Modes da coleção **Brand** do Figma. Cada mode é uma marca (white-label) que redefine a escala `primary/50…950` — o resto do DS (botões, links, estados ativos) segue automaticamente via `--ui-primary`. Para trocar a marca em runtime, use o seletor **Brand** no toolbar (ícone de pincel).",
    "args": {},
    "argTypes": {},
    "stories": [
      "Modes",
      "Aplicacao"
    ]
  },
  "Button": {
    "title": "Components/Button",
    "component": "Button",
    "description": null,
    "args": {
      "label": "Button",
      "color": "primary",
      "variant": "solid",
      "size": "md",
      "shape": "rectangular",
      "disabled": false
    },
    "argTypes": {
      "color": {
        "control": "select",
        "options": [
          "primary",
          "secondary",
          "success",
          "info",
          "warning",
          "error",
          "neutral"
        ]
      },
      "variant": {
        "control": "select",
        "options": [
          "solid",
          "outline",
          "soft",
          "subtle",
          "ghost",
          "link"
        ]
      },
      "size": {
        "control": "select",
        "options": [
          "xs",
          "sm",
          "md",
          "lg",
          "xl"
        ]
      },
      "shape": {
        "control": "inline-radio",
        "options": [
          "rectangular",
          "pill",
          "circular"
        ],
        "description": "Forma (espelha o Figma). No código: pill = `rounded-full`; circular = `square` + `rounded-full` (só ícone). rectangular é o padrão."
      },
      "disabled": {
        "control": "boolean"
      },
      "loading": {
        "control": "boolean"
      },
      "block": {
        "control": "boolean"
      },
      "label": {
        "control": "text"
      },
      "icon": {
        "control": "text"
      }
    },
    "stories": [
      "Playground",
      "Variants",
      "Colors",
      "Sizes",
      "WithIcon",
      "FullWidth",
      "Shapes",
      "Pill",
      "Circular",
      "States"
    ]
  },
  "Card": {
    "title": "Components/Card",
    "component": "Card",
    "description": "Container de conteúdo (`UCard` do @nuxt/ui) com header, body e footer. Base de cards de jogo/evento, blocos de conta e painéis. `variant`: **outline** (borda + divisórias, padrão), **soft** (superfície elevada), **subtle** (elevado + borda), **solid** (invertido/claro). Use os slots `#header`, default (corpo) e `#footer`; `title`/`description` são atalhos para o header.",
    "args": {
      "variant": "outline",
      "title": "Flamengo x Palmeiras",
      "description": "Brasileirão · Série A · Hoje 21:30"
    },
    "argTypes": {
      "variant": {
        "control": "inline-radio",
        "options": [
          "outline",
          "soft",
          "subtle",
          "solid"
        ],
        "description": "Estilo da superfície."
      },
      "title": {
        "control": "text",
        "description": "Título (atalho do header)."
      },
      "description": {
        "control": "text",
        "description": "Descrição (atalho do header)."
      }
    },
    "stories": [
      "Playground",
      "Variants",
      "GameCard",
      "TitleDescription"
    ]
  },
  "Carousel": {
    "title": "Components/Carousel",
    "component": "Carousel",
    "description": "Carrossel horizontal (`UCarousel` do @nuxt/ui, base Embla) — rails de jogos/eventos do cassino. Props principais: **arrows** (setas prev/next), **dots** (indicadores), **loop**, **align** (start/center/end), **slidesToScroll**, **autoScroll**, **dragFree**. Cada slide vem do slot `#default=\"{ item }\"`. Largura do slide via `:ui=\"{ item: 'basis-...' }\"`.",
    "args": {
      "arrows": true,
      "dots": false,
      "loop": false,
      "align": "start",
      "dragFree": false
    },
    "argTypes": {
      "arrows": {
        "control": "boolean",
        "description": "Setas prev/next."
      },
      "dots": {
        "control": "boolean",
        "description": "Indicadores de slide."
      },
      "loop": {
        "control": "boolean",
        "description": "Loop infinito."
      },
      "align": {
        "control": "inline-radio",
        "options": [
          "start",
          "center",
          "end"
        ],
        "description": "Alinhamento do snap."
      },
      "dragFree": {
        "control": "boolean",
        "description": "Arraste livre (sem snap rígido)."
      }
    },
    "stories": [
      "Playground",
      "ComDots",
      "DragLivre"
    ]
  },
  "Checkbox": {
    "title": "Components/Checkbox",
    "component": "Checkbox",
    "description": "Caixa de seleção (`UCheckbox` do @nuxt/ui). `variant=\"list\"` é o checkbox inline padrão; `variant=\"card\"` é um cartão com borda (a área toda é clicável; quando marcado ganha borda primária) — ótimo para escolher opções de aposta/planos. Estado por `v-model` (use `\"indeterminate\"` para o estado parcial). `indicator` controla o lado do check (start/end/hidden).",
    "args": {
      "variant": "list",
      "color": "primary",
      "size": "md",
      "label": "Aceito os termos"
    },
    "argTypes": {
      "variant": {
        "control": "inline-radio",
        "options": [
          "list",
          "card"
        ],
        "description": "list = inline; card = cartão com borda."
      },
      "color": {
        "control": "select",
        "options": [
          "primary",
          "success",
          "warning",
          "error",
          "neutral"
        ],
        "description": "Cor quando marcado."
      },
      "size": {
        "control": "inline-radio",
        "options": [
          "sm",
          "md",
          "lg"
        ],
        "description": "Tamanho (escala oficial do DS)."
      },
      "indicator": {
        "control": "inline-radio",
        "options": [
          "start",
          "end",
          "hidden"
        ],
        "description": "Posição do indicador (check)."
      },
      "label": {
        "control": "text",
        "description": "Rótulo."
      },
      "description": {
        "control": "text",
        "description": "Texto auxiliar."
      },
      "disabled": {
        "control": "boolean",
        "description": "Desabilita."
      }
    },
    "stories": [
      "Playground",
      "Variants",
      "States",
      "Sizes",
      "CardSelection"
    ]
  },
  "Chip": {
    "title": "Components/Chip",
    "component": "Chip",
    "description": "Indicador de canto (`UChip` do @nuxt/ui): um ponto de status ou contador sobreposto a outro elemento. **Não confundir com Badge** (a pílula com texto). Use para notificações (contador no sino), status online (ponto no avatar) ou nº de seleções no bet slip. Envolve o elemento no slot e mostra o indicador via `position` (top-right…); `text` exibe um número; sem `text` é um ponto.",
    "args": {
      "color": "error",
      "position": "top-right"
    },
    "argTypes": {
      "color": {
        "control": "select",
        "options": [
          "primary",
          "secondary",
          "success",
          "info",
          "warning",
          "error",
          "neutral"
        ],
        "description": "Cor do indicador."
      },
      "text": {
        "control": "text",
        "description": "Número/conteúdo (vazio = ponto)."
      },
      "size": {
        "control": "select",
        "options": [
          "sm",
          "md",
          "lg",
          "xl",
          "2xl",
          "3xl"
        ],
        "description": "Tamanho do indicador."
      },
      "position": {
        "control": "inline-radio",
        "options": [
          "top-right",
          "bottom-right",
          "top-left",
          "bottom-left"
        ],
        "description": "Canto."
      },
      "inset": {
        "control": "boolean",
        "description": "Mantém dentro p/ elementos arredondados."
      }
    },
    "stories": [
      "Playground",
      "DotVsCount",
      "Colors",
      "Show",
      "BetSlipCount"
    ]
  },
  "Colors": {
    "title": "Foundations/Colors",
    "component": "Colors",
    "description": null,
    "args": {},
    "argTypes": {},
    "stories": [
      "Semantic"
    ]
  },
  "Contrast": {
    "title": "Foundations/Contrast",
    "component": "Contrast",
    "description": "Auditoria de contraste **WCAG** calculada ao vivo a partir dos tokens resolvidos (`getComputedStyle`). Como lê os valores efetivos, é **white-label aware**: se outra marca sobrescrever os tokens de cor, a matriz recalcula. Limiares: **AA** 4.5:1 (texto normal), **AA Large** 3:1 (≥18.66px ou ≥14px bold), **AAA** 7:1. Use para prever problemas antes do handoff.",
    "args": {},
    "argTypes": {},
    "stories": [
      "TextOnSurfaces",
      "SemanticPairs"
    ]
  },
  "Drawer": {
    "title": "Components/Drawer",
    "component": "Drawer",
    "description": "Painel deslizante (`UDrawer` do @nuxt/ui). Use para bet slip, filtros e menu no mobile. `direction` (bottom/top/left/right); no mobile o bottom-sheet com `handle` é o padrão. Abre a partir de um gatilho.",
    "args": {},
    "argTypes": {},
    "stories": [
      "BottomSheet",
      "RightSide"
    ]
  },
  "DropdownMenu": {
    "title": "Components/DropdownMenu",
    "component": "DropdownMenu",
    "description": "Menu de ações (`UDropdownMenu` do @nuxt/ui): abre um painel a partir de um gatilho. Use para menu da conta, ações de um jogo/aposta, filtros. `items` é um array de grupos `{ label, icon, kbds, color, onSelect, children }`; grupos viram seções separadas.",
    "args": {},
    "argTypes": {},
    "stories": [
      "Playground",
      "States",
      "WithSubmenu"
    ]
  },
  "Empty": {
    "title": "Patterns/Empty",
    "component": "Empty",
    "description": "Estado vazio: ícone + título + descrição + ação opcional. Use quando uma lista não tem itens (sem apostas, sem favoritos, busca sem resultados). É um **pattern** (composição), não um componente do @nuxt/ui — no Figma vive como o componente `EmptyState` com Ícone/Ação por boolean.",
    "args": {},
    "argTypes": {},
    "stories": [
      "Default",
      "NoResults",
      "NoFavorites"
    ]
  },
  "FileUpload": {
    "title": "Components/FileUpload",
    "component": "FileUpload",
    "description": "Upload de arquivos (`UFileUpload` do @nuxt/ui). `variant=\"area\"` é a zona de arrastar-e-soltar (com ícone, label e descrição) — usada para documentos de KYC; `variant=\"button\"` é um disparador simples. `accept` restringe os tipos (ex.: `image/png,application/pdf`), `multiple` permite vários arquivos, `layout` (list/grid) controla a lista de arquivos enviados.",
    "args": {
      "variant": "area",
      "size": "md",
      "icon": "i-lucide-upload",
      "label": "Arraste arquivos ou clique",
      "description": "PNG, JPG ou PDF · até 5MB"
    },
    "argTypes": {
      "variant": {
        "control": "inline-radio",
        "options": [
          "area",
          "button"
        ],
        "description": "area = dropzone (arrastar/soltar); button = disparador simples."
      },
      "color": {
        "control": "select",
        "options": [
          "primary",
          "error",
          "neutral"
        ],
        "description": "Cor do realce. `error` para estado inválido."
      },
      "size": {
        "control": "select",
        "options": [
          "sm",
          "md",
          "lg"
        ],
        "description": "Tamanho."
      },
      "layout": {
        "control": "inline-radio",
        "options": [
          "list",
          "grid"
        ],
        "description": "Como os arquivos enviados são exibidos (variant=area)."
      },
      "label": {
        "control": "text",
        "description": "Título da zona de upload."
      },
      "description": {
        "control": "text",
        "description": "Texto auxiliar (tipos/limite)."
      },
      "accept": {
        "control": "text",
        "description": "Tipos aceitos (MIME/extensão)."
      },
      "multiple": {
        "control": "boolean",
        "description": "Permite múltiplos arquivos."
      },
      "disabled": {
        "control": "boolean",
        "description": "Desabilita o upload."
      }
    },
    "stories": [
      "Playground",
      "Sizes",
      "States",
      "Button",
      "KYC"
    ]
  },
  "Form": {
    "title": "Patterns/Form",
    "component": "Form",
    "description": "Padrões de formulário compondo `UForm` + `UFormField` + campos. Exemplos: tela de login e preferências de conta. Sem tabela de props única por ser uma composição.",
    "args": {},
    "argTypes": {},
    "stories": [
      "SignIn",
      "Validation",
      "AccountPreferences"
    ]
  },
  "Gradients": {
    "title": "Foundations/Gradients",
    "component": "Gradients",
    "description": "Gradientes do DS. O @nuxt/ui só conhece cores sólidas — gradiente é uma camada de estilo aplicada via classe `bg-gradient-primary` (ou `var(--gradient-primary)`), não uma prop `color`. Hoje: `gradient/primary` (primary-500 → info-600), para hero/CTA de marca e destaques. No Figma é um Paint Style.",
    "args": {},
    "argTypes": {},
    "stories": [
      "Primary",
      "Usage"
    ]
  },
  "Input": {
    "title": "Components/Input",
    "component": "Input",
    "description": null,
    "args": {
      "placeholder": "Placeholder",
      "variant": "outline",
      "size": "md"
    },
    "argTypes": {
      "color": {
        "control": "select",
        "options": [
          "primary",
          "error",
          "neutral"
        ]
      },
      "variant": {
        "control": "select",
        "options": [
          "outline",
          "soft",
          "subtle",
          "ghost",
          "none"
        ]
      },
      "size": {
        "control": "select",
        "options": [
          "sm",
          "md",
          "lg"
        ]
      },
      "placeholder": {
        "control": "text"
      },
      "icon": {
        "control": "text"
      },
      "disabled": {
        "control": "boolean"
      },
      "required": {
        "control": "boolean"
      },
      "readonly": {
        "control": "boolean"
      }
    },
    "stories": [
      "Playground",
      "Variants",
      "States",
      "WithIcon"
    ]
  },
  "InputDate": {
    "title": "Components/InputDate",
    "component": "InputDate",
    "description": "Campo de data (`UInputDate` do @nuxt/ui): campo fechado com segmentos DD/MM/YYYY e ícone de calendário; abre um date picker ao focar. Use para data de nascimento, KYC, filtros por data. Compartilha a casca do Input (mesmos `variant`, `size`, `color` e estado de erro). `range` permite selecionar um intervalo.",
    "args": {
      "variant": "outline",
      "size": "md",
      "trailingIcon": "i-lucide-calendar"
    },
    "argTypes": {
      "color": {
        "control": "select",
        "options": [
          "primary",
          "error",
          "neutral"
        ],
        "description": "Cor do anel/realce. `error` para estado inválido."
      },
      "variant": {
        "control": "select",
        "options": [
          "outline",
          "soft",
          "subtle",
          "ghost"
        ],
        "description": "Estilo visual do campo."
      },
      "size": {
        "control": "select",
        "options": [
          "sm",
          "md",
          "lg"
        ],
        "description": "Tamanho (padding e tipografia)."
      },
      "range": {
        "control": "boolean",
        "description": "Permite selecionar um intervalo de datas."
      },
      "highlight": {
        "control": "boolean",
        "description": "Força o realce do anel (como foco)."
      },
      "disabled": {
        "control": "boolean",
        "description": "Desabilita o campo."
      }
    },
    "stories": [
      "Playground",
      "Variants",
      "Sizes",
      "States"
    ]
  },
  "InputNumber": {
    "title": "Components/InputNumber",
    "component": "InputNumber",
    "description": "Campo numérico com steppers (`UInputNumber` do @nuxt/ui). Use para valores controlados — valor de aposta, depósito, quantidades — onde `min`/`max`/`step` definem a faixa válida. Compartilha a casca do Input (mesmos `variant`, `size`, `color` e estado de erro) e acrescenta botões de incremento/decremento.",
    "args": {
      "variant": "outline",
      "size": "md",
      "orientation": "horizontal",
      "min": 0,
      "max": 100,
      "step": 1
    },
    "argTypes": {
      "color": {
        "control": "select",
        "options": [
          "primary",
          "error",
          "neutral"
        ],
        "description": "Cor do anel/realce. `error` para estado inválido."
      },
      "variant": {
        "control": "select",
        "options": [
          "outline",
          "soft",
          "subtle",
          "ghost"
        ],
        "description": "Estilo visual da borda/fundo."
      },
      "size": {
        "control": "select",
        "options": [
          "sm",
          "md",
          "lg"
        ],
        "description": "Tamanho (padding e tipografia)."
      },
      "orientation": {
        "control": "inline-radio",
        "options": [
          "horizontal",
          "vertical"
        ],
        "description": "Posição dos steppers: laterais (horizontal) ou empilhados (vertical)."
      },
      "min": {
        "control": "number",
        "description": "Valor mínimo permitido."
      },
      "max": {
        "control": "number",
        "description": "Valor máximo permitido."
      },
      "step": {
        "control": "number",
        "description": "Incremento de cada passo."
      },
      "placeholder": {
        "control": "text",
        "description": "Texto exibido quando vazio."
      },
      "highlight": {
        "control": "boolean",
        "description": "Força o realce do anel (como foco)."
      },
      "disabled": {
        "control": "boolean",
        "description": "Desabilita o campo e os steppers."
      }
    },
    "stories": [
      "Playground",
      "Sizes",
      "Orientation",
      "States",
      "BetAmount"
    ]
  },
  "Introduction": {
    "title": "Introduction",
    "component": "Introduction",
    "description": null,
    "args": {},
    "argTypes": {},
    "stories": [
      "Welcome"
    ]
  },
  "Modal": {
    "title": "Components/Modal",
    "component": "Modal",
    "description": "Diálogo modal sobreposto. Slot default = gatilho (trigger); slots `#body`/`#footer` para o conteúdo. Espelha o `UModal` do @nuxt/ui v4.",
    "args": {
      "title": "Modal title",
      "description": "This is the modal body. Use it for descriptions, forms or any content.",
      "fullscreen": false,
      "overlay": true,
      "dismissible": true
    },
    "argTypes": {
      "title": {
        "control": "text"
      },
      "description": {
        "control": "text"
      },
      "fullscreen": {
        "control": "boolean"
      },
      "overlay": {
        "control": "boolean",
        "description": "Exibe o fundo escurecido"
      },
      "dismissible": {
        "control": "boolean",
        "description": "Fecha ao clicar fora / Esc"
      }
    },
    "stories": [
      "Default",
      "Fullscreen"
    ]
  },
  "Pagination": {
    "title": "Components/Pagination",
    "component": "Pagination",
    "description": "Paginação (`UPagination` do @nuxt/ui): navega listas longas (histórico de apostas/transações, resultados de busca). `total` + `items-per-page` definem as páginas; `page` é v-model; `color`/`variant` estilizam, `sibling-count` controla quantos números aparecem.",
    "args": {
      "color": "primary",
      "variant": "solid"
    },
    "argTypes": {
      "color": {
        "control": "select",
        "options": [
          "primary",
          "neutral"
        ],
        "description": "Cor da página ativa."
      },
      "variant": {
        "control": "select",
        "options": [
          "solid",
          "outline",
          "soft",
          "subtle",
          "ghost"
        ],
        "description": "Estilo dos botões."
      }
    },
    "stories": [
      "Playground",
      "Soft",
      "States"
    ]
  },
  "PinInput": {
    "title": "Components/PinInput",
    "component": "PinInput",
    "description": "Campo de PIN/OTP (`UPinInput` do @nuxt/ui): uma fileira de N caixas de um caractere. Use para verificação em 2 etapas (2FA), código de SMS/e-mail, PIN de saque. `length` define o nº de caixas, `mask` esconde (tipo senha), `otp` ativa o autofill de código no mobile, `separator` agrupa as caixas. Compartilha a casca do Input (mesmos `variant`, `size`, `color` e estado de erro).",
    "args": {
      "variant": "outline",
      "size": "md",
      "length": 4
    },
    "argTypes": {
      "color": {
        "control": "select",
        "options": [
          "primary",
          "error",
          "neutral"
        ],
        "description": "Cor do anel/realce. `error` para estado inválido."
      },
      "variant": {
        "control": "select",
        "options": [
          "outline",
          "soft",
          "subtle",
          "ghost"
        ],
        "description": "Estilo visual das caixas."
      },
      "size": {
        "control": "select",
        "options": [
          "sm",
          "md",
          "lg"
        ],
        "description": "Tamanho das caixas."
      },
      "length": {
        "control": "number",
        "description": "Número de caixas (dígitos do código)."
      },
      "mask": {
        "control": "boolean",
        "description": "Esconde os dígitos (tipo senha)."
      },
      "otp": {
        "control": "boolean",
        "description": "Autofill de código (OTP) no mobile."
      },
      "placeholder": {
        "control": "text",
        "description": "Caractere placeholder das caixas vazias."
      },
      "highlight": {
        "control": "boolean",
        "description": "Força o realce do anel (como foco)."
      },
      "disabled": {
        "control": "boolean",
        "description": "Desabilita o campo."
      }
    },
    "stories": [
      "Playground",
      "Variants",
      "Sizes",
      "States",
      "Masked",
      "SixDigitsSeparator"
    ]
  },
  "Progress": {
    "title": "Components/Progress",
    "component": "Progress",
    "description": "Barra de progresso (`UProgress` do @nuxt/ui). Use para limites de depósito/aposta, barra de tempo de jogo ao vivo, upload de KYC, etapas de cadastro. `value`/`max` definem o preenchimento; sem `value` fica indeterminada (animada). `color` e `size` (espessura).",
    "args": {
      "modelValue": 60,
      "color": "primary",
      "size": "md"
    },
    "argTypes": {
      "color": {
        "control": "select",
        "options": [
          "primary",
          "secondary",
          "success",
          "info",
          "warning",
          "error",
          "neutral"
        ],
        "description": "Cor."
      },
      "size": {
        "control": "inline-radio",
        "options": [
          "sm",
          "md",
          "lg"
        ],
        "description": "Espessura."
      }
    },
    "stories": [
      "Playground",
      "Sizes",
      "Colors",
      "Indeterminate",
      "DepositLimit"
    ]
  },
  "Radius": {
    "title": "Foundations/Radius",
    "component": "Radius",
    "description": null,
    "args": {},
    "argTypes": {},
    "stories": [
      "Scale"
    ]
  },
  "Search": {
    "title": "Components/Search",
    "component": "Search",
    "description": null,
    "args": {
      "size": "md"
    },
    "argTypes": {
      "size": {
        "control": "select",
        "options": [
          "sm",
          "md",
          "lg"
        ]
      }
    },
    "stories": [
      "Default",
      "Sizes"
    ]
  },
  "SectionHeader": {
    "title": "Patterns/SectionHeader",
    "component": "SectionHeader",
    "description": "Cabeçalho de seção / carrossel: uma linha (`USeparator`) com um cluster `‹ Ver todos ›` (setas de navegação + ação) posicionável via `position` (start/center/end). Use no topo de carrosséis de jogos/mercados. É um **pattern** (composição de `USeparator` + `UButton`), não um componente único — no Figma vive como o composite `SectionHeader` com setas/botão trocáveis por instance-swap.",
    "args": {},
    "argTypes": {},
    "stories": [
      "Positions",
      "SeeAllOnly",
      "CarouselHeader"
    ]
  },
  "Select": {
    "title": "Components/Select",
    "component": "Select",
    "description": null,
    "args": {
      "placeholder": "Select option",
      "variant": "outline",
      "size": "md"
    },
    "argTypes": {
      "variant": {
        "control": "select",
        "options": [
          "outline",
          "soft",
          "subtle",
          "ghost",
          "none"
        ]
      },
      "size": {
        "control": "select",
        "options": [
          "sm",
          "md",
          "lg"
        ]
      },
      "placeholder": {
        "control": "text"
      },
      "disabled": {
        "control": "boolean"
      },
      "required": {
        "control": "boolean"
      },
      "multiple": {
        "control": "boolean"
      }
    },
    "stories": [
      "Playground",
      "SelectMenu",
      "RequiredAndMultiple",
      "States"
    ]
  },
  "Separator": {
    "title": "Components/Separator",
    "component": "Separator",
    "description": "Divisória que separa conteúdo na horizontal ou vertical (`USeparator` do @nuxt/ui). Use entre blocos de uma tela, itens de lista, ou com `label`/`icon` no meio (ex.: o clássico \"ou\" entre login e cadastro). `orientation` horizontal/vertical, `type` solid/dashed/dotted, `size` controla a espessura, `position` alinha o conteúdo (start/center/end).",
    "args": {
      "type": "solid",
      "color": "neutral",
      "orientation": "horizontal"
    },
    "argTypes": {
      "label": {
        "control": "text",
        "description": "Texto centralizado na linha."
      },
      "icon": {
        "control": "text",
        "description": "Ícone centralizado (ex.: i-lucide-star)."
      },
      "orientation": {
        "control": "inline-radio",
        "options": [
          "horizontal",
          "vertical"
        ],
        "description": "Direção da divisória."
      },
      "type": {
        "control": "inline-radio",
        "options": [
          "solid",
          "dashed",
          "dotted"
        ],
        "description": "Estilo da linha."
      },
      "color": {
        "control": "select",
        "options": [
          "neutral",
          "primary",
          "success",
          "warning",
          "error"
        ],
        "description": "Cor da linha."
      },
      "size": {
        "control": "inline-radio",
        "options": [
          "xs",
          "sm",
          "md",
          "lg",
          "xl"
        ],
        "description": "Espessura."
      },
      "position": {
        "control": "inline-radio",
        "options": [
          "start",
          "center",
          "end"
        ],
        "description": "Posição do conteúdo."
      }
    },
    "stories": [
      "Playground",
      "Content",
      "Types",
      "Vertical",
      "LoginDivider"
    ]
  },
  "Shadows": {
    "title": "Foundations/Shadows",
    "component": "Shadows",
    "description": null,
    "args": {},
    "argTypes": {},
    "stories": [
      "Elevation",
      "Glow"
    ]
  },
  "Skeleton": {
    "title": "Components/Skeleton",
    "component": "Skeleton",
    "description": "Placeholder de carregamento animado (`USkeleton` do @nuxt/ui). Use enquanto listas/cards de jogos carregam. É um bloco que você dimensiona via classes (`h-*`, `w-*`, `rounded-*`); combine vários para montar o esqueleto de um card.",
    "args": {},
    "argTypes": {},
    "stories": [
      "Shapes",
      "GameCardSkeleton",
      "ListSkeleton"
    ]
  },
  "Slider": {
    "title": "Components/Slider",
    "component": "Slider",
    "description": null,
    "args": {
      "size": "md"
    },
    "argTypes": {
      "size": {
        "control": "select",
        "options": [
          "xs",
          "sm",
          "md",
          "lg",
          "xl"
        ]
      },
      "disabled": {
        "control": "boolean"
      }
    },
    "stories": [
      "Playground",
      "WithLabel",
      "Disabled"
    ]
  },
  "Spacing": {
    "title": "Foundations/Spacing",
    "component": "Spacing",
    "description": null,
    "args": {},
    "argTypes": {},
    "stories": [
      "Scale"
    ]
  },
  "Spacing Semântico": {
    "title": "Foundations/Spacing Semântico",
    "component": "Spacing Semântico",
    "description": "Camada semântica de espaçamento. Use **`gap/*`** para o espaço **entre** itens e **`padding/*`** para o espaço **interno**. Ambos são aliases da escala `space-*`/`--spacing-*` — mesmos valores, nomes distintos para aplicar com intenção.",
    "args": {},
    "argTypes": {},
    "stories": [
      "QuandoUsar",
      "Gap",
      "Padding"
    ]
  },
  "Stepper": {
    "title": "Components/Stepper",
    "component": "Stepper",
    "description": "Indicador de etapas (`UStepper` do @nuxt/ui): mostra o progresso num fluxo multi-etapa (cadastro, KYC, depósito). `items` define as etapas `{ title, description, icon, disabled }`; `model-value` é a etapa atual; `orientation` horizontal/vertical. Cada etapa tem 3 estados visuais (concluída/ativa/futura) + disabled — espelha a página UStepper do Figma.",
    "args": {
      "orientation": "horizontal",
      "color": "primary"
    },
    "argTypes": {
      "orientation": {
        "control": "inline-radio",
        "options": [
          "horizontal",
          "vertical"
        ],
        "description": "Direção."
      },
      "color": {
        "control": "select",
        "options": [
          "primary",
          "neutral"
        ],
        "description": "Cor."
      }
    },
    "stories": [
      "Playground",
      "Vertical",
      "States"
    ]
  },
  "Switch": {
    "title": "Components/Switch",
    "component": "Switch",
    "description": "Alterna entre dois estados (`USwitch` do @nuxt/ui). Use para preferências on/off — notificações, lembrar login, modo escuro, aceitar promoções. O estado é `v-model`; `label`/`description` rotulam ao lado; `loading` mostra spinner; `checked-icon`/`unchecked-icon` colocam ícones no thumb. Tamanhos do DS: sm/md/lg.",
    "args": {
      "color": "primary",
      "size": "md",
      "label": "Receber notificações"
    },
    "argTypes": {
      "color": {
        "control": "select",
        "options": [
          "primary",
          "success",
          "warning",
          "error",
          "neutral"
        ],
        "description": "Cor quando ligado."
      },
      "size": {
        "control": "inline-radio",
        "options": [
          "sm",
          "md",
          "lg"
        ],
        "description": "Tamanho (escala oficial do DS)."
      },
      "label": {
        "control": "text",
        "description": "Rótulo ao lado do switch."
      },
      "description": {
        "control": "text",
        "description": "Texto auxiliar abaixo do rótulo."
      },
      "loading": {
        "control": "boolean",
        "description": "Mostra spinner (ação em andamento)."
      },
      "disabled": {
        "control": "boolean",
        "description": "Desabilita o switch."
      }
    },
    "stories": [
      "Playground",
      "Sizes",
      "States",
      "Colors",
      "WithDescription"
    ]
  },
  "Table": {
    "title": "Components/Table",
    "component": "Table",
    "description": "Tabela de dados (`UTable` do @nuxt/ui, sobre TanStack Table). Use para histórico de apostas/transações, ranking. `data` são as linhas e `columns` define `{ accessorKey, header }`; suporta ordenação, seleção e células customizadas via slots.",
    "args": {},
    "argTypes": {},
    "stories": [
      "BetHistory",
      "States"
    ]
  },
  "Tabs": {
    "title": "Components/Tabs",
    "component": "Tabs",
    "description": "Abas (`UTabs` do @nuxt/ui): alterna entre seções. Use para Esportes/Ao vivo/Cassino, abas da conta, mercados de um jogo. `variant` **pill** (fundo elevado na ativa) ou **link** (sublinhado); `items` define as abas `{ label, icon, content }`.",
    "args": {
      "variant": "pill",
      "color": "primary"
    },
    "argTypes": {
      "variant": {
        "control": "inline-radio",
        "options": [
          "pill",
          "link"
        ],
        "description": "Estilo das abas."
      },
      "color": {
        "control": "select",
        "options": [
          "primary",
          "neutral"
        ],
        "description": "Cor do indicador."
      }
    },
    "stories": [
      "Pill",
      "Link",
      "States",
      "WithContent"
    ]
  },
  "Textarea": {
    "title": "Components/Textarea",
    "component": "Textarea",
    "description": "Campo de texto multilinha (`UTextarea` do @nuxt/ui). Use para entradas longas — comentários, observações de KYC, descrições. No DS a altura é fixa em `rows=3` (sem autoresize), com rolagem no overflow e alça de redimensionamento vertical. Parente do Input: mesmos `variant`, `size`, `color` e estado de erro.",
    "args": {
      "placeholder": "Placeholder",
      "variant": "outline",
      "size": "md",
      "rows": 3,
      "autoresize": false,
      "ui": {
        "base": "min-h-[76px]"
      }
    },
    "argTypes": {
      "color": {
        "control": "select",
        "options": [
          "primary",
          "error",
          "neutral"
        ],
        "description": "Cor do anel/realce. `error` para estado inválido."
      },
      "variant": {
        "control": "select",
        "options": [
          "outline",
          "soft",
          "subtle",
          "ghost"
        ],
        "description": "Estilo visual da borda/fundo."
      },
      "size": {
        "control": "select",
        "options": [
          "sm",
          "md",
          "lg"
        ],
        "description": "Tamanho (padding e tipografia)."
      },
      "rows": {
        "control": "number",
        "description": "Altura em linhas. Padrão do DS: 3."
      },
      "placeholder": {
        "control": "text",
        "description": "Texto exibido quando vazio."
      },
      "autoresize": {
        "control": "boolean",
        "description": "Cresce com o conteúdo. No DS fica desligado (altura fixa)."
      },
      "highlight": {
        "control": "boolean",
        "description": "Força o realce do anel (como foco)."
      },
      "disabled": {
        "control": "boolean",
        "description": "Desabilita o campo."
      }
    },
    "stories": [
      "Playground",
      "Variants",
      "Sizes",
      "States",
      "Autoresize"
    ]
  },
  "Toast": {
    "title": "Components/Toast",
    "component": "Toast",
    "description": "Notificação flutuante (`UToast` via `useToast()` do @nuxt/ui). Disparada por código após uma ação (aposta feita, depósito recebido, erro). Card elevado com ícone, título, descrição e close. `color` indica o estado; `variant` o estilo. O container (`<UApp>`) renderiza os toasts empilhados.",
    "args": {},
    "argTypes": {},
    "stories": [
      "Triggers"
    ]
  },
  "Toggles": {
    "title": "Components/Toggles",
    "component": "Toggles",
    "description": "Controles de seleção do @nuxt/ui — `UCheckbox`, `URadioGroup` e `USwitch` (acento = primary). Cada story abaixo mostra um tipo. Sem tabela de props única por agrupar 3 componentes.",
    "args": {},
    "argTypes": {},
    "stories": [
      "Checkbox",
      "Radio",
      "Switch"
    ]
  },
  "Tooltip": {
    "title": "Components/Tooltip",
    "component": "Tooltip",
    "description": "Dica em hover (`UTooltip` do @nuxt/ui): bolha com texto sobre um elemento. Use para explicar ícones, mostrar info de odds, atalhos. `text` é o conteúdo, `kbds` mostra atalho de teclado, `arrow` liga a setinha. Abre ao passar o mouse no slot.",
    "args": {
      "text": "Odds em tempo real",
      "arrow": true
    },
    "argTypes": {
      "text": {
        "control": "text",
        "description": "Texto da dica."
      },
      "arrow": {
        "control": "boolean",
        "description": "Mostra a seta."
      }
    },
    "stories": [
      "Playground",
      "WithShortcut",
      "States",
      "Open"
    ]
  },
  "Typography": {
    "title": "Foundations/Typography",
    "component": "Typography",
    "description": null,
    "args": {},
    "argTypes": {},
    "stories": [
      "Scale",
      "Weights",
      "Tracking"
    ]
  },
  "Typography Responsive": {
    "title": "Foundations/Typography Responsive",
    "component": "Typography Responsive",
    "description": "Escala tipográfica **responsiva**: `font-size` E `line-height` mudam no breakpoint `lg` (1024px). Mobile-first — o valor base vale abaixo de 1024px, `lg:` vale a partir de 1024px. Use as classes de papel `.t-display`, `.t-h1`…`.t-caption` (só tamanho + entrelinha; peso/cor são separados). **Redimensione a janela** cruzando 1024px para ver a troca. Espelha a coleção \"Type Scale\" (modos Mobile/Desktop) no Figma.",
    "args": {},
    "argTypes": {},
    "stories": [
      "Scale",
      "BodyReadability",
      "Usage"
    ]
  }
}
