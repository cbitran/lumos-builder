import test from 'node:test'
import assert from 'node:assert/strict'
import { extractMeta } from '../scripts/gen-ds-manifest.mjs'

test('lê título, args e argTypes de um meta simples', () => {
  const meta = extractMeta(`
    const meta = {
      title: 'Components/Modal',
      argTypes: {
        title: { control: 'text' },
        fullscreen: { control: 'boolean', description: 'Tela cheia' },
      },
      args: { title: 'Modal title', fullscreen: false },
    }
    export default meta
    export const Default = {}
    export const Fullscreen = {}
  `)
  assert.equal(meta.title, 'Components/Modal')
  assert.equal(meta.component, 'Modal')
  assert.deepEqual(meta.args, { title: 'Modal title', fullscreen: false })
  assert.equal(meta.argTypes.title.control, 'text')
  assert.equal(meta.argTypes.fullscreen.description, 'Tela cheia')
  assert.deepEqual(meta.stories, ['Default', 'Fullscreen'])
})

test('lê options de um control select', () => {
  const meta = extractMeta(`
    const meta = {
      title: 'Components/Card',
      argTypes: { variant: { control: 'inline-radio', options: ['outline', 'soft'] } },
    }
    export default meta
  `)
  assert.deepEqual(meta.argTypes.variant.options, ['outline', 'soft'])
})

test('story sem argTypes devolve objeto vazio, não erro', () => {
  const meta = extractMeta(`
    const meta = { title: 'Components/Drawer' }
    export default meta
    export const BottomSheet = {}
  `)
  assert.deepEqual(meta.argTypes, {})
  assert.deepEqual(meta.stories, ['BottomSheet'])
})

test('lê a descrição de parameters.docs.description.component', () => {
  const meta = extractMeta(`
    const meta = {
      title: 'Components/Tooltip',
      parameters: { docs: { description: { component: 'Dica em hover.' } } },
    }
    export default meta
  `)
  assert.equal(meta.description, 'Dica em hover.')
})

test('arquivo sem meta devolve null em vez de explodir', () => {
  assert.equal(extractMeta('export const x = 1'), null)
})
