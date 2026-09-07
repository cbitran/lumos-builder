#!/usr/bin/env node
// PONTE COM O STORYBOOK — lê as stories do DS e extrai o que o Inspector precisa:
// valores default (args), controles (argTypes) e a descrição de cada componente.
//
// Parse por AST do TypeScript, não por regex: regex sobre código quebra no
// primeiro objeto aninhado, e aqui todo argType é objeto aninhado.
//
// LIMITAÇÃO CONHECIDA: só parte das stories do DS declara argTypes. As outras
// (Drawer, DropdownMenu, Toast, Form entre elas) saem sem controle nenhum, e
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
