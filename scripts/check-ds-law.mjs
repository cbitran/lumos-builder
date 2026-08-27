#!/usr/bin/env node
// GUARDA-CORPO — o Design System é a única fonte da verdade.
// Falha o build se algo de fora dele entrar no código do builder.
// Regra que depende de disciplina humana morre no terceiro sprint; esta é mecânica.

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

// fileURLToPath, não .pathname: o caminho tem espaços e viria com %20.
const ROOT = dirname(dirname(fileURLToPath(import.meta.url)))
const SRC = join(ROOT, 'src')

// Set de ícone autorizado: o Storybook do DS usa Lucide em 100% das stories
// (83 ocorrências, zero heroicons) e é o padrão do @nuxt/ui v4. O ADR-005 do DS
// diz que o DS possui o SLOT, não a biblioteca — então a trava não existe para
// impor um set "oficial" do DS, e sim para impedir set MISTO dentro do builder.
const ALLOWED_ICON_PREFIX = /^i-lucide-/
const FONT_ALLOWED = /Outfit|var\(--font-/

const RULES = [
  {
    name: 'cor literal',
    // #fff, #ffffff, rgb(), hsl() — cor tem que vir de token.
    re: /#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(/g,
    why: 'cor sai de tokens.css / themes-*.css, nunca literal',
  },
  {
    name: 'font-family fora do DS',
    re: /font-family\s*:\s*(?!.*(?:Outfit|var\(--font-))[^;]+/gi,
    why: 'a fonte do DS é Outfit — não existe Montserrat, Gotham ou Lato',
  },
  {
    name: 'classe de cor crua do Tailwind',
    // bg-black, text-white, border-gray-500… O DS expõe papéis semânticos
    // (default, muted, elevated, highlighted, inverted, primary) — use esses.
    re: /\b(?:bg|text|border|ring|from|to|via|fill|stroke)-(?:black|white|slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)(?:-\d{2,3})?\b/g,
    why: 'use os papéis semânticos do DS (default/muted/elevated/highlighted/inverted/primary)',
  },
  {
    name: 'ícone de set não autorizado',
    re: /["'`]i-(?!lucide-)[a-z0-9]+[:-][^"'`]+["'`]/g,
    why: 'o builder usa Lucide — mesmo set do Storybook do DS',
  },
]

function walk(dir) {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f)
    return statSync(p).isDirectory() ? walk(p) : [p]
  })
}

const violations = []
for (const file of walk(SRC).filter((f) => /\.(vue|ts|css)$/.test(f))) {
  const src = readFileSync(file, 'utf8')
  const lines = src.split('\n')
  for (const rule of RULES) {
    lines.forEach((line, i) => {
      // Comentários explicam a regra citando o que é proibido — não são violação.
      if (/^\s*(\/\/|\*|\/\*)/.test(line)) return
      const hit = line.match(rule.re)
      if (hit) violations.push({ file: relative(ROOT, file), line: i + 1, rule: rule.name, why: rule.why, text: line.trim().slice(0, 90) })
    })
  }
}

if (violations.length) {
  console.error(`\n✗ ${violations.length} violação(ões) da lei do Design System:\n`)
  for (const v of violations) console.error(`  ${v.file}:${v.line}  [${v.rule}]\n    ${v.text}\n    → ${v.why}\n`)
  process.exit(1)
}
console.log('✓ Lei do Design System respeitada: nenhuma cor, fonte ou ícone fora do DS.')
