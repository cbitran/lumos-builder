/**
 * PONTE STORYBOOK → BUILDER.
 *
 * O bundle do Figma (_ds_bundle.js) declara as variantes dos componentes
 * (`state: "unchecked"`, `state: "hover"`, `on: true`) mas NUNCA as lê — cada
 * componente está congelado num único estado. Verificado: 0 leituras de
 * `props.state` em UCheckbox, UButton, UInput, USelect e Switch.
 *
 * Ou seja: o Figma define QUE estados existem; ele não os torna reais. Quem faz
 * isso é o Storybook, com os componentes do @nuxt/ui v4 — que respondem a
 * mouseover, clique e foco de verdade.
 *
 * Este arquivo expõe `window.LumosPecas.montar(el, tipo, props)`, que planta um
 * componente vivo do DS dentro de qualquer nó do canvas React do builder.
 */
import { createApp, h, type App } from 'vue'
import { createHead } from '@unhead/vue/client'
import { createMemoryHistory, createRouter } from 'vue-router'
import ui from '@nuxt/ui/vue-plugin'
import { nuxtUiComponents } from '../ds/nuxt-ui-components.generated'
import PecaViva from './PecaViva.vue'
import '../main.css'

const montados = new WeakMap<Element, App>()

function novaApp(tipo: string, props: Record<string, unknown>) {
  // Mesmo arranjo do preview.ts do Storybook do DS: head provider (o plugin de
  // cores injeta <style> via useHead), router de memória (vários componentes
  // usam <ULink>) e o registro global dos 121 componentes.
  const app = createApp({
    render: () => h(PecaViva, { tipo, props }),
  })
  app.use(createHead())
  app.use(ui)
  app.use(
    createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/', component: { template: '<div />' } }],
    }),
  )
  for (const [nome, comp] of Object.entries(nuxtUiComponents)) app.component(nome, comp)
  return app
}

export function montar(el: Element, tipo: string, props: Record<string, unknown> = {}) {
  desmontar(el)
  const app = novaApp(tipo, props)
  app.mount(el)
  montados.set(el, app)
}

export function desmontar(el: Element) {
  const app = montados.get(el)
  if (app) {
    app.unmount()
    montados.delete(el)
  }
}

;(window as unknown as Record<string, unknown>).LumosPecas = { montar, desmontar }
