import { createApp } from 'vue'
import { createHead } from '@unhead/vue/client'
import { createMemoryHistory, createRouter } from 'vue-router'
import ui from '@nuxt/ui/vue-plugin'
// Manifesto AUTO-GERADO com TODOS os componentes do @nuxt/ui. Registrados
// globalmente porque o BlockRenderer resolve por NOME (<component :is="'UCard'">),
// o que não passa pelo auto-import de build-time. Mesmo arranjo do Storybook do DS.
import { nuxtUiComponents } from './ds/nuxt-ui-components.generated'
import App from './App.vue'
import './main.css'

// Fora do Nuxt, o @nuxt/ui precisa de head provider explícito (o plugin de cores
// injeta <style> via useHead) e de um router — vários componentes usam <ULink>.
// Mesmo arranjo do preview.ts do Storybook do DS.
const router = createRouter({
  history: createMemoryHistory(),
  routes: [{ path: '/', component: { template: '<div />' } }],
})

const app = createApp(App)
app.use(createHead())
app.use(ui)
app.use(router)
for (const [name, component] of Object.entries(nuxtUiComponents)) app.component(name, component)
app.mount('#app')
