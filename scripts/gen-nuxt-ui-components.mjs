// Gera src/ds/nuxt-ui-components.generated.ts
// Cópia do gerador do Storybook do DS (nacionalbet-ds/storybook/scripts). Mesma
// lógica, mesmo destino conceitual: registrar TODOS os componentes do @nuxt/ui
// fora do Nuxt, com o override Vue-safe do Icon. — o manifesto de TODOS os
// componentes do @nuxt/ui para registro global no Storybook (preview.ts).
//
// Por que existe: as stories usam <U*> em template string runtime, que NÃO passa
// pelo auto-import build-time do @nuxt/ui. Então registramos os componentes
// globalmente. Em vez de manter a lista à mão, este script varre o filesystem do
// @nuxt/ui instalado e gera o manifesto — qualquer componente novo entra sozinho.
//
// A única armadilha (que quebrava o build-storybook): o `components/Icon.vue` CRU
// importa o pacote @nuxt/icon, que puxa virtuals só-Nuxt (#build/nuxt-icon-client-bundle,
// onServerPrefetch). Por isso:
//   - Icon  -> redireciona para o override Vue-safe (@nuxt/ui/runtime/vue/components/Icon.vue,
//             que usa @iconify/vue e não toca em @nuxt/icon);
//   - qualquer OUTRO .vue que importe @nuxt/icon cru -> é excluído (defensivo p/ futuras versões).
//
// Rode manualmente com `node scripts/gen-nuxt-ui-components.mjs`. O main.ts também
// chama generate() no boot, então o manifesto fica sempre em dia com o node_modules.

import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const projectRoot = join(here, '..')
const componentsDir = join(projectRoot, 'node_modules/@nuxt/ui/dist/runtime/components')
const outFile = join(projectRoot, 'src/ds/nuxt-ui-components.generated.ts')

// Subpath público do override Vue-safe do Icon (exports './runtime/*').
const ICON_OVERRIDE = '@nuxt/ui/runtime/vue/components/Icon.vue'
const importsRawNuxtIcon = (src) => /from\s+['"]@nuxt\/icon\b/.test(src)

export function generate({ silent = false } = {}) {
  let uiVersion = 'unknown'
  try {
    uiVersion = JSON.parse(
      readFileSync(join(projectRoot, 'node_modules/@nuxt/ui/package.json'), 'utf8'),
    ).version
  } catch {}

  const files = readdirSync(componentsDir)
    .filter((f) => f.endsWith('.vue'))
    .map((f) => f.replace(/\.vue$/, ''))
    .sort()

  const entries = [] // { comp, path }
  const excluded = []

  for (const name of files) {
    if (name === 'Icon') {
      entries.push({ comp: 'UIcon', path: ICON_OVERRIDE })
      continue
    }
    const src = readFileSync(join(componentsDir, `${name}.vue`), 'utf8')
    if (importsRawNuxtIcon(src)) {
      excluded.push(name) // alcança @nuxt/icon cru -> quebraria o build
      continue
    }
    entries.push({ comp: `U${name}`, path: `@nuxt/ui/components/${name}.vue` })
  }

  const importLines = entries.map((e) => `import ${e.comp} from '${e.path}'`).join('\n')
  const mapLines = entries.map((e) => `  ${e.comp},`).join('\n')

  const out = `// AUTO-GERADO por scripts/gen-nuxt-ui-components.mjs — NÃO editar à mão.
// Fonte: node_modules/@nuxt/ui/dist/runtime/components/*.vue  (@nuxt/ui v${uiVersion})
// ${entries.length} componentes registrados${excluded.length ? ` · excluídos (importam @nuxt/icon cru): ${excluded.join(', ')}` : ''}.
// Icon usa o override Vue-safe (@iconify/vue) para não quebrar o build-storybook.
import type { Component } from 'vue'
${importLines}

export const nuxtUiComponents: Record<string, Component> = {
${mapLines}
}
`

  writeFileSync(outFile, out)
  if (!silent) {
    console.log(
      `[gen-nuxt-ui-components] ${entries.length} componentes -> ${outFile}` +
        (excluded.length ? `\n  excluídos (@nuxt/icon cru): ${excluded.join(', ')}` : ''),
    )
  }
  return { count: entries.length, excluded }
}

// Execução direta: `node scripts/gen-nuxt-ui-components.mjs`
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  generate()
}
