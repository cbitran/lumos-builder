#!/usr/bin/env node
/**
 * HARNESS DE CONFORMIDADE — o portão automático de cada entrega.
 *
 * Isto NÃO é lint. Cada regra aqui corresponde a uma decisão registrada em
 * docs/superpowers/specs/2026-08-26-builder-dinamico-design.md, e cita a seção.
 * Se uma regra parecer arbitrária, a resposta está no spec — não aqui.
 *
 * POR QUE ELE CARREGA O CATÁLOGO DE VERDADE (via esbuild) em vez de ler o
 * arquivo como texto: a única razão de `UButtonGroup` ter passado despercebido
 * meses foi ninguém ter conferido se o nome existia no manifesto do @nuxt/ui.
 * Regex sobre o fonte não pega isso; carregar o objeto e cruzar com o manifesto
 * pega. É exatamente a classe de erro que este harness existe para impedir.
 *
 * ENTREGA POR ENTREGA: cada regra declara em que task ela passa a valer.
 *   node scripts/check-conformance.mjs --task 3
 * cobra apenas o que já deveria estar pronto até a task 3. Sem isso, o portão
 * reprovaria a task 1 por não ter feito o trabalho da task 6.
 */
import esbuild from 'esbuild'
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)))
const SRC = join(ROOT, 'src')

const arg = process.argv.indexOf('--task')
const ATE = arg !== -1 ? Number(process.argv[arg + 1]) : 99

// ── utilidades ──────────────────────────────────────────────────────────────
const resultados = []
/** @param {{task:number, spec:string, nome:string}} meta */
function regra(meta, fn) {
  if (meta.task > ATE) return
  try {
    const problemas = fn() ?? []
    resultados.push({ ...meta, problemas })
  } catch (e) {
    resultados.push({ ...meta, problemas: [`a própria regra falhou: ${e.message}`] })
  }
}

const ler = (p) => (existsSync(join(ROOT, p)) ? readFileSync(join(ROOT, p), 'utf8') : null)

/**
 * Carrega um módulo TypeScript do src compilando-o em memória.
 * `external` mantém fora tudo que puxa .vue (o manifesto do @nuxt/ui), que o
 * Node não sabe importar.
 */
async function carregarTS(entrada, external = []) {
  const dir = mkdtempSync(join(tmpdir(), 'harness-'))
  const saida = join(dir, 'bundle.mjs')
  await esbuild.build({
    entryPoints: [join(ROOT, entrada)],
    outfile: saida,
    bundle: true,
    format: 'esm',
    platform: 'node',
    logLevel: 'silent',
    external,
  })
  const mod = await import(pathToFileURL(saida).href)
  rmSync(dir, { recursive: true, force: true })
  return mod
}

/** Nomes registrados no manifesto gerado do @nuxt/ui — lidos do bloco de export. */
function componentesDoDS() {
  const src = ler('src/ds/nuxt-ui-components.generated.ts')
  if (!src) return null
  const bloco = src.slice(src.indexOf('export const nuxtUiComponents'))
  return new Set([...bloco.matchAll(/^\s{2}(U[A-Za-z]+),$/gm)].map((m) => m[1]))
}

/** Percorre a árvore de sementes de uma peça. */
function* percorrerSeed(seed, caminho = '') {
  for (const [slot, filhos] of Object.entries(seed ?? {})) {
    for (const [i, filho] of (filhos ?? []).entries()) {
      const onde = `${caminho}${slot}[${i}]`
      yield { onde, filho }
      if (filho.slots) yield* percorrerSeed(filho.slots, `${onde}.`)
    }
  }
}

// ── carga ───────────────────────────────────────────────────────────────────
let CATALOG = null
let carregaFalhou = null
try {
  // O catálogo importa o manifesto de stories a partir da task 6; até lá o
  // arquivo pode não existir, e `external` evita que isso derrube a carga.
  const mod = await carregarTS('src/builder/catalog.ts', [
    '../ds/nuxt-ui-components.generated',
    '../ds/storybook-manifest.generated',
  ])
  CATALOG = mod.CATALOG
} catch (e) {
  carregaFalhou = e.message
}

const DS = componentesDoDS()

// ── REGRAS ──────────────────────────────────────────────────────────────────

regra(
  { task: 1, spec: '§4', nome: 'catálogo carrega e o manifesto do DS é legível' },
  () => {
    const p = []
    if (carregaFalhou) p.push(`não foi possível carregar src/builder/catalog.ts — ${carregaFalhou}`)
    if (!Array.isArray(CATALOG)) p.push('CATALOG não é um array exportado')
    if (!DS?.size) p.push('não consegui ler os nomes de src/ds/nuxt-ui-components.generated.ts')
    return p
  },
)

regra(
  { task: 1, spec: '§4', nome: 'nenhum ícone fora do set Lucide em src/' },
  () => {
    const p = []
    for (const peca of CATALOG ?? []) {
      const texto = JSON.stringify(peca)
      for (const m of texto.matchAll(/"(i-[a-z0-9]+[:-][^"]+)"/g)) {
        if (!m[1].startsWith('i-lucide-')) p.push(`peça "${peca.key}" usa ${m[1]}`)
      }
    }
    return p
  },
)

regra(
  {
    task: 3,
    spec: '§3.3',
    nome: 'todo `renders` existe de fato no manifesto do @nuxt/ui',
  },
  () => {
    // ESTA É A REGRA QUE TERIA PEGO O UButtonGroup.
    const p = []
    for (const peca of CATALOG ?? []) {
      if (peca.renders === 'text') continue // sentinela da peça `texto`
      if (DS && !DS.has(peca.renders)) {
        p.push(`peça "${peca.key}" renderiza "${peca.renders}", que NÃO existe no @nuxt/ui 4.9`)
      }
    }
    return p
  },
)

regra(
  { task: 3, spec: '§3.3', nome: 'toda peça citada numa semente existe no catálogo' },
  () => {
    const p = []
    const chaves = new Set((CATALOG ?? []).map((x) => x.key))
    for (const peca of CATALOG ?? []) {
      for (const { onde, filho } of percorrerSeed(peca.seed)) {
        if (!chaves.has(filho.piece)) {
          p.push(`"${peca.key}".seed.${onde} aponta para a peça inexistente "${filho.piece}"`)
        }
      }
    }
    return p
  },
)

regra(
  { task: 3, spec: '§3.1', nome: 'nenhum filho de semente carrega posição' },
  () => {
    const p = []
    for (const peca of CATALOG ?? []) {
      for (const { onde, filho } of percorrerSeed(peca.seed)) {
        if ('positions' in filho) p.push(`"${peca.key}".seed.${onde} tem \`positions\` — só a raiz posiciona`)
        if ('id' in filho) p.push(`"${peca.key}".seed.${onde} tem \`id\` fixo — o id nasce no drop`)
      }
    }
    return p
  },
)

regra(
  { task: 3, spec: '§3.3', nome: 'peça com semente declara os slots que semeia' },
  () => {
    const p = []
    for (const peca of CATALOG ?? []) {
      if (!peca.seed) continue
      const declarados = new Set((peca.slots ?? []).map((s) => s.key))
      for (const slot of Object.keys(peca.seed)) {
        if (!declarados.has(slot)) {
          p.push(`"${peca.key}" semeia o slot "${slot}" mas não o declara em \`slots\` — o Inspector não saberá rotulá-lo`)
        }
      }
    }
    return p
  },
)

regra(
  { task: 3, spec: '§3.3', nome: 'as peças de comportamento do spec estão no catálogo' },
  () => {
    const exigidas = ['UModal', 'UDrawer', 'UDropdownMenu', 'UTooltip', 'UPopover', 'UChip', 'UFieldGroup', 'UCarousel', 'texto']
    const chaves = new Set((CATALOG ?? []).map((x) => x.key))
    return exigidas.filter((k) => !chaves.has(k)).map((k) => `peça "${k}" ausente`)
  },
)

regra(
  { task: 3, spec: '§3.3', nome: 'UToast fica FORA do catálogo (decisão do spec)' },
  () => {
    const tem = (CATALOG ?? []).some((x) => x.renders === 'UToast' || x.key === 'UToast')
    return tem ? ['UToast entrou no catálogo — o spec §3.3 o exclui: ele é disparado por useToast() e renderizado pelo <UApp>, não é bloco posicionável'] : []
  },
)

regra(
  { task: 2, spec: '§3.1', nome: 'types.ts expõe o modelo de árvore' },
  () => {
    const src = ler('src/builder/types.ts') ?? ''
    const p = []
    for (const nome of ['SlotChild', 'LayoutBlock', 'ChildSeed']) {
      if (!new RegExp(`export (interface|type) ${nome}\\b`).test(src)) {
        p.push(`types.ts não exporta \`${nome}\``)
      }
    }
    if (!/version:\s*3/.test(src)) p.push('Layout.version não foi para 3')
    return p
  },
)

regra(
  { task: 2, spec: '§3.2', nome: 'o renderer nunca declara slot vazio' },
  () => {
    const src = ler('src/builder/BlockRenderer.vue') ?? ''
    const p = []
    if (!/children\?\.length|children\.length/.test(src) || !/continue/.test(src)) {
      p.push(
        'não encontrei a guarda que pula slot sem filhos. Sem ela, UInput/USelect quebram com "Cannot set properties of null" — lição já paga uma vez no catalog.ts',
      )
    }
    if (/<template>/.test(src)) {
      p.push('BlockRenderer ainda tem <template> — o spec §3.2 exige render function, porque a quantidade de slots é dinâmica')
    }
    return p
  },
)

regra(
  { task: 2, spec: '§3.4', nome: 'o renderer liga `action: close` ao escopo do slot' },
  () => {
    const src = ler('src/builder/BlockRenderer.vue') ?? ''
    return /action === 'close'/.test(src) && /scope/.test(src)
      ? []
      : ['sem a ligação de `action: close`, Cancelar e Confirmar não fecham o modal (spec §3.4)']
  },
)

regra(
  { task: 4, spec: '§3.6', nome: 'o palco separa Editar de Testar' },
  () => {
    const stage = ler('src/builder/Stage.vue') ?? ''
    const types = ler('src/builder/types.ts') ?? ''
    const p = []
    if (!/export type Modo/.test(types)) p.push('types.ts não exporta `Modo`')
    if (!/editando/.test(stage)) p.push('Stage.vue não tem a distinção de modo')
    if (!/:draggable="editando"/.test(stage)) {
      p.push('o bloco continua `draggable` em Testar — arrastar durante o preview é ruído')
    }
    if (!/absolute inset-0 z-10/.test(stage)) {
      p.push('não encontrei o escudo de clique. Sem ele, clicar no gatilho do Modal abre o modal em vez de selecionar o bloco, e a peça fica impossível de posicionar (spec §3.6)')
    }
    return p
  },
)

regra(
  { task: 5, spec: '§3.5', nome: 'o manifesto do Storybook foi gerado e tem conteúdo' },
  () => {
    const src = ler('src/ds/storybook-manifest.generated.ts')
    if (!src) return ['src/ds/storybook-manifest.generated.ts não existe — rode `npm run gen:ds`']
    const p = []
    if (!/export const DS_MANIFEST/.test(src)) p.push('não exporta DS_MANIFEST')
    // O DS tem 47 stories; menos de 30 componentes indica extração quebrada.
    const quantos = (src.match(/"title":/g) ?? []).length
    if (quantos < 30) p.push(`só ${quantos} componentes extraídos — o Storybook do DS tem 47 stories, extração provavelmente quebrada`)
    if (!/"control":\s*"boolean"/.test(src)) p.push('nenhum argType boolean extraído — o Modal declara `fullscreen: { control: boolean }`')
    return p
  },
)

regra(
  { task: 6, spec: '§3.5', nome: 'o Inspector consome o manifesto com fallback manual' },
  () => {
    const cat = ler('src/builder/catalog.ts') ?? ''
    const insp = ler('src/builder/Inspector.vue') ?? ''
    const p = []
    if (!/export function fieldsFor/.test(cat)) p.push('catalog.ts não exporta `fieldsFor`')
    if (!/return piece\.fields/.test(cat)) {
      p.push('`fieldsFor` não cai nos campos manuais. 21 das 47 stories do DS não declaram argTypes — sem fallback, essas peças ficam sem controle nenhum (spec §3.5)')
    }
    if (!/type === 'boolean'|f\.type === 'boolean'/.test(insp)) {
      p.push('o Inspector não trata campo boolean — hoje ele cai no <select> e vira um controle mentiroso')
    }
    return p
  },
)

regra(
  { task: 7, spec: '§5', nome: 'o build carrega os assets do base path do Pages' },
  () => {
    const html = ler('dist/index.html')
    if (!html) return ['dist/index.html não existe — rode `npm run build` antes deste portão']
    const refs = [...html.matchAll(/(?:src|href)="([^"]+)"/g)].map((m) => m[1])
    const assets = refs.filter((r) => r.includes('/assets/'))
    if (!assets.length) return ['nenhum asset referenciado no dist/index.html']
    const errados = assets.filter((a) => !a.startsWith('/nacional-builder/'))
    return errados.map(
      (a) => `asset "${a}" sem o prefixo /nacional-builder/ — publicado assim, a página sobe em branco`,
    )
  },
)

// ── relatório ───────────────────────────────────────────────────────────────
const falhas = resultados.filter((r) => r.problemas.length)

console.log(`\nHarness de conformidade — cobrando até a task ${ATE === 99 ? 'final' : ATE}\n`)
for (const r of resultados) {
  const marca = r.problemas.length ? '✗' : '✓'
  console.log(`  ${marca} [task ${r.task} · spec ${r.spec}] ${r.nome}`)
  for (const p of r.problemas) console.log(`      → ${p}`)
}

if (falhas.length) {
  console.error(`\n✗ ${falhas.length} de ${resultados.length} regras reprovadas.\n`)
  process.exit(1)
}
console.log(`\n✓ ${resultados.length} regras aprovadas.\n`)
