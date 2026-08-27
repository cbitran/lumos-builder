#!/usr/bin/env node
// Compila as peças vivas E carimba o selo de versão no builder.
// Os dois passos andam juntos de propósito: um rebuild sem selo novo deixa o
// navegador servindo o bundle velho, e o sintoma disso parece bug de componente.
import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)))
execFileSync('npx', ['vite', 'build', '--config', 'vite.pecas.config.ts'], { cwd: ROOT, stdio: 'inherit' })

const alvo = join(ROOT, 'lumos-builder/Builder Modular v2.dc.html')
const selo = Date.now()
let html = readFileSync(alvo, 'utf8')
html = html
  .replace(/href="_pecas\/nacional-builder\.css(\?v=\d+)?"/, `href="_pecas/nacional-builder.css?v=${selo}"`)
  .replace(/src="_pecas\/lumos-pecas\.js(\?v=\d+)?"/, `src="_pecas/lumos-pecas.js?v=${selo}"`)
writeFileSync(alvo, html)
console.log(`✓ peças compiladas e carimbadas com o selo ${selo}`)
