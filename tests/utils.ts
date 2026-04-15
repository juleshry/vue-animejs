import { defineComponent, h } from 'vue'
import { mount, type VueWrapper } from '@vue/test-utils'

export function withSetup<T>(setup: () => T): [T, VueWrapper] {
  let result!: T
  const wrapper = mount(
    defineComponent({
      setup() {
        result = setup()
        return () => h('div')
      },
    })
  )
  return [result, wrapper]
}
