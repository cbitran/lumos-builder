// Espelho dos 9 modes da coleção `Brand` do Figma (Lumos Design System Engine).
// Mesmo mecanismo do Storybook: cada tema é lido como texto (?inline) e injetado
// num <style> único. Os themes/*.css declaram tudo em :root, então dois importados
// ao mesmo tempo se sobrescreveriam — por isso a troca é injeção, não import.
import original from '@ds/themes/original.css?inline'
import esmeralda from '@ds/themes/esmeralda.css?inline'
import azul from '@ds/themes/azul.css?inline'
import vermelho from '@ds/themes/vermelho.css?inline'
import ambar from '@ds/themes/ambar.css?inline'
import rosa from '@ds/themes/rosa.css?inline'
import laranja from '@ds/themes/laranja.css?inline'
import vinho from '@ds/themes/vinho.css?inline'
import lima from '@ds/themes/lima.css?inline'

export type BrandId =
  | 'original' | 'esmeralda' | 'azul' | 'vermelho' | 'ambar'
  | 'rosa' | 'laranja' | 'vinho' | 'lima'

export const BRANDS: { id: BrandId; label: string; css: string }[] = [
  { id: 'original',  label: 'Original',  css: original },
  { id: 'esmeralda', label: 'Esmeralda', css: esmeralda },
  { id: 'azul',      label: 'Azul',      css: azul },
  { id: 'vermelho',  label: 'Vermelho',  css: vermelho },
  { id: 'ambar',     label: 'Âmbar',     css: ambar },
  { id: 'rosa',      label: 'Rosa',      css: rosa },
  { id: 'laranja',   label: 'Laranja',   css: laranja },
  { id: 'vinho',     label: 'Vinho',     css: vinho },
  { id: 'lima',      label: 'Lima',      css: lima },
]

const STYLE_ID = 'nacional-brand-mode'

export function applyBrand(id: BrandId) {
  const brand = BRANDS.find((b) => b.id === id)
  if (!brand) return
  let el = document.getElementById(STYLE_ID) as HTMLStyleElement | null
  if (!el) {
    el = document.createElement('style')
    el.id = STYLE_ID
    document.head.appendChild(el)
  }
  el.textContent = brand.css
}
