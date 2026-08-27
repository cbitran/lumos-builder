import { createApp, ref, h } from 'vue'
import { createHead } from '@unhead/vue/client'
import { createMemoryHistory, createRouter } from 'vue-router'
import ui from '@nuxt/ui/vue-plugin'
import { nuxtUiComponents } from './src/ds/nuxt-ui-components.generated'
import Biblioteca from './src/builder/Biblioteca.vue'
import BarraTopo from './src/builder/BarraTopo.vue'
import { applyBrand, type BrandId } from './src/ds/brands'
import type { Modo } from './src/builder/modular'
import './src/main.css'

const Demo = {
  setup() {
    const busca = ref('')
    const modo = ref<Modo>('editar')
    const largura = ref(1440)
    const marca = ref<BrandId>('original')
    const malha = ref(true), guias = ref(false), ima = ref(true)
    applyBrand('original')
    return () => h('div', { class: 'flex h-screen flex-col bg-default' }, [
      h(BarraTopo, {
        modo: modo.value, largura: largura.value, marca: marca.value,
        malha: malha.value, guias: guias.value, ima: ima.value,
        'onUpdate:modo': (v: Modo) => (modo.value = v),
        'onUpdate:largura': (v: number) => (largura.value = v),
        'onUpdate:marca': (v: BrandId) => { marca.value = v; applyBrand(v) },
        'onUpdate:malha': (v: boolean) => (malha.value = v),
        'onUpdate:guias': (v: boolean) => (guias.value = v),
        'onUpdate:ima': (v: boolean) => (ima.value = v),
      }),
      h('div', { class: 'flex min-h-0 flex-1' }, [
        h(Biblioteca, { busca: busca.value, 'onUpdate:busca': (v: string) => (busca.value = v) }),
      ]),
    ])
  },
}
const router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/', component: { template: '<div/>' } }] })
const app = createApp({ render: () => h(nuxtUiComponents.UApp as any, null, { default: () => h(Demo) }) })
app.use(createHead()); app.use(ui); app.use(router)
for (const [n, c] of Object.entries(nuxtUiComponents)) app.component(n, c)
app.mount('#app')
