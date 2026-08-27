import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import ui from '@nuxt/ui/vite'
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Mesma resolução do vite.config.ts principal: o DS é fonte única e vive fora.
const CANDIDATOS = [
  process.env.DS_ROOT,
  resolve(__dirname, 'vendor/nacionalbet-ds'),
  '/Volumes/SSD Interno/Projetos Embrioes/NacionalBet',
].filter(Boolean) as string[]
const DS_ROOT = CANDIDATOS.find((p) => existsSync(resolve(p, 'tokens.css')))
if (!DS_ROOT) throw new Error('[pecas] Design System não encontrado. Rode com DS_ROOT=<caminho>.')

// Bundle IIFE de arquivo único: o builder é um .dc.html estático servido sem
// bundler, então ele só consegue consumir um <script src> comum.
export default defineConfig({
  // O build de biblioteca não injeta `process.env` como o build de app injeta,
  // e alguma dependência da árvore do @nuxt/ui o consulta em tempo de execução.
  // Sem isto o bundle morre com "process is not defined" antes de exportar nada.
  define: {
    'process.env.NODE_ENV': '"production"',
    'process.env': '{}',
    'process.platform': '"browser"',
    'process.version': '"v20.0.0"',
  },
  plugins: [vue(), ui()],
  resolve: { alias: { '@ds': DS_ROOT } },
  build: {
    outDir: 'lumos-builder/_pecas',
    emptyOutDir: true,
    cssCodeSplit: false,
    lib: {
      entry: resolve(__dirname, 'src/pecas/entry.ts'),
      name: 'LumosPecas',
      formats: ['iife'],
      fileName: () => 'lumos-pecas.js',
    },
  },
})

// Selo de versão no <script> do builder: o .dc.html é servido estático, e sem
// isso o navegador continua rodando o bundle antigo depois de um rebuild — o
// que já me fez diagnosticar como bug do componente algo que era só cache.
