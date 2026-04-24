import { describe, it, expect, vi, beforeEach } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { useScope } from '@lib'
import { withSetup } from './utils'
import { makeScopeMock } from './mocks'
import { createScope } from 'animejs'

const mock_createScope = vi.mocked(createScope)

const mock_scope = makeScopeMock()

vi.mock('animejs', () => ({
  createScope: vi.fn(() => mock_scope),
}))

describe('useScope', () => {
  beforeEach(() => {
    mock_createScope.mockClear()
    Object.values(mock_scope).forEach(fn => fn.mockClear())
  })

  it('creates scope synchronously during setup', () => {
    withSetup(() => useScope({}))
    expect(mock_createScope).toHaveBeenCalledWith({})
  })

  it('creates scope with provided params', () => {
    const params = { defaults: { duration: 1000 } }
    withSetup(() => useScope(params))
    expect(mock_createScope).toHaveBeenCalledWith(params)
  })

  it('flushes buffered add() calls on mount', () => {
    const method = vi.fn()
    mount(
      defineComponent({
        setup() {
          const { add } = useScope({})
          add(method)
          return () => h('div')
        },
      })
    )
    expect(mock_scope.add).toHaveBeenCalledWith(method)
  })

  it('add() called after mount delegates to scope.add immediately', () => {
    const method = vi.fn()
    const [result] = withSetup(() => useScope({}))
    mock_scope.add.mockClear()
    result.add(method)
    expect(mock_scope.add).toHaveBeenCalledWith(method)
  })

  it('flushes buffered registerMethod() calls on mount', () => {
    const method = vi.fn()
    mount(
      defineComponent({
        setup() {
          const { registerMethod } = useScope({})
          registerMethod('myMethod', method)
          return () => h('div')
        },
      })
    )
    expect(mock_scope.add).toHaveBeenCalledWith('myMethod', method)
  })

  it('flushes buffered addOnce() calls on mount', () => {
    const method = vi.fn()
    mount(
      defineComponent({
        setup() {
          const { addOnce } = useScope({})
          addOnce(method)
          return () => h('div')
        },
      })
    )
    expect(mock_scope.addOnce).toHaveBeenCalledWith(method)
  })

  it('refresh() delegates to scope', () => {
    const [result] = withSetup(() => useScope({}))
    result.refresh()
    expect(mock_scope.refresh).toHaveBeenCalledOnce()
  })

  it('revert() delegates to scope', () => {
    const [result] = withSetup(() => useScope({}))
    result.revert()
    expect(mock_scope.revert).toHaveBeenCalledOnce()
  })

  it('calls scope.revert() on unmount', () => {
    const [, wrapper] = withSetup(() => useScope({}))
    mock_scope.revert.mockClear()
    wrapper.unmount()
    expect(mock_scope.revert).toHaveBeenCalledOnce()
  })

  it('recreates scope when ref params change', async () => {
    const params = ref({ defaults: { duration: 500 } })
    withSetup(() => useScope(params))
    mock_createScope.mockClear()
    params.value = { defaults: { duration: 1000 } }
    await nextTick()
    expect(mock_createScope).toHaveBeenCalledWith({ defaults: { duration: 1000 } })
  })

  it('reverts old scope before recreating on params change', async () => {
    const params = ref({})
    withSetup(() => useScope(params))
    mock_scope.revert.mockClear()
    params.value = { defaults: { duration: 1000 } }
    await nextTick()
    expect(mock_scope.revert).toHaveBeenCalled()
  })

  it('does not recreate scope for plain object params', async () => {
    withSetup(() => useScope({ defaults: { duration: 500 } }))
    mock_createScope.mockClear()
    await nextTick()
    expect(mock_createScope).not.toHaveBeenCalled()
  })

  it('stops watching params after unmount', async () => {
    const params = ref({})
    const [, wrapper] = withSetup(() => useScope(params))
    wrapper.unmount()
    mock_createScope.mockClear()
    params.value = { defaults: { duration: 1000 } }
    await nextTick()
    expect(mock_createScope).not.toHaveBeenCalled()
  })
})