import { createApp, defineComponent, h, ref } from 'vue'
import { createHead } from '@unhead/vue/client'
import { createMemoryHistory, createRouter } from 'vue-router'
import ui from '@nuxt/ui/vue-plugin'
import { nuxtUiComponents } from './src/ds/nuxt-ui-components.generated'
import Palco from './src/builder/Palco.vue'
import { novaPeca } from './src/builder/modular-catalog'
import type { Peca } from './src/builder/modular'
import './src/main.css'

const pecas = ref<Peca[]>([
  novaPeca('secao', 's1', 0, 0)!,
  novaPeca('botao', 'b1', 1, 1)!,
  novaPeca('titulo', 't1', 1, 6)!,
  novaPeca('modal', 'm1', 6, 6)!,
].filter(Boolean) as Peca[])
const sel = ref<string | null>('b1')

const Probe = defineComponent({
  setup() {
    return () => h('div', { class: 'flex h-screen' }, [
      h(Palco as any, {
        pecas: pecas.value, largura: 1440, linhas: 22, selecionado: sel.value,
        modo: 'editar', malha: true, guias: true, ima: true,
        onSelecionar: (id: string | null) => (sel.value = id),
        onMover: (id: string, x: number, y: number) => {
          const p = pecas.value.find((q) => q.id === id); if (p) { p.x = x; p.y = y }
        },
        onRedimensionar: (id: string, x: number, y: number, w: number, hh: number) => {
          const p = pecas.value.find((q) => q.id === id); if (p) { p.x = x; p.y = y; p.w = w; p.h = hh }
        },
        onRemover: (id: string) => (pecas.value = pecas.value.filter((q) => q.id !== id)),
        onSoltar: (tipo: string, x: number, y: number) => {
          const n = novaPeca(tipo, 'n' + Math.random().toString(36).slice(2, 6), x, y)
          if (n) pecas.value.push(n)
        },
      }),
    ])
  },
})

const router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/', component: { template: '<div />' } }] })
const app = createApp(Probe)
app.use(createHead()); app.use(ui); app.use(router)
for (const [name, component] of Object.entries(nuxtUiComponents)) app.component(name, component)
app.mount('#app')
