import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import ui from '@nuxt/ui/vite'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

// FONTE DA VERDADE: o Design System vive no repo nacionalbet-ds e NÃO é copiado
// pra cá. Alias absoluto = uma verdade só. Se o repo mudar de lugar, o build para
// com erro explícito em vez de rodar com tokens velhos.
const DS_ROOT = '/Volumes/SSD Interno/Projetos Embrioes/NacionalBet'

if (!existsSync(resolve(DS_ROOT, 'tokens.css'))) {
  throw new Error(
    `[builder] Design System não encontrado em "${DS_ROOT}".\n` +
    `O builder não tem tokens próprios de propósito — ele lê os do DS.\n` +
    `Ajuste DS_ROOT em vite.config.ts para o caminho real do repo nacionalbet-ds.`
  )
}

export default defineConfig({
  // vue() ANTES de ui(): o unplugin-vue-components do @nuxt/ui precisa que os .vue
  // já estejam compilados pra conseguir auto-importar os <U*>.
  plugins: [vue(), ui()],
  resolve: { alias: { '@ds': DS_ROOT } },
  // O DS está fora da raiz do projeto — sem isso o dev server recusa servir os arquivos.
  server: { fs: { allow: [resolve('.'), DS_ROOT] } },
})
