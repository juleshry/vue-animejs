import { describe, it, expect, vi, beforeEach } from 'vitest'
import { nextTick, ref } from 'vue'
import { useTimer } from '@lib'
import { withSetup } from './utils'
import { makeTimerMock } from './mocks'
import { createTimer } from 'animejs'

const mock_createTimer = vi.mocked(createTimer)

const mock_timer = makeTimerMock()

vi.mock('animejs', () => ({
  createTimer: vi.fn(() => mock_timer),
}))

describe('useTimer', () => {
  beforeEach(() => {
    mock_createTimer.mockClear()
    Object.values(mock_timer).forEach(fn => fn.mockClear())
  })

  it('creates timer synchronously with provided options', () => {
    withSetup(() => useTimer({ duration: 1000 }))
    expect(mock_createTimer).toHaveBeenCalledWith({ duration: 1000 })
  })

  it('creates timer with empty options by default', () => {
    withSetup(() => useTimer())
    expect(mock_createTimer).toHaveBeenCalledWith({})
  })

  it('exposes the timer instance', () => {
    const [result] = withSetup(() => useTimer())
    expect(result.timer.value).toBeDefined()
  })

  it('delegates play to the timer instance', () => {
    const [result] = withSetup(() => useTimer())
    result.play()
    expect(mock_timer.play).toHaveBeenCalledOnce()
  })

  it('delegates pause to the timer instance', () => {
    const [result] = withSetup(() => useTimer())
    result.pause()
    expect(mock_timer.pause).toHaveBeenCalledOnce()
  })

  it('delegates seek with args to the timer instance', () => {
    const [result] = withSetup(() => useTimer())
    result.seek(200, false)
    expect(mock_timer.seek).toHaveBeenCalledWith(200, false, undefined)
  })

  it('recreates timer when options ref changes', async () => {
    const options = ref({ duration: 500 })
    withSetup(() => useTimer(options))
    mock_createTimer.mockClear()
    options.value = { duration: 1000 }
    await nextTick()
    expect(mock_createTimer).toHaveBeenCalledWith({ duration: 1000 })
  })

  it('cancels the previous timer before recreating', async () => {
    const options = ref({ duration: 500 })
    withSetup(() => useTimer(options))
    mock_timer.cancel.mockClear()
    options.value = { duration: 1000 }
    await nextTick()
    expect(mock_timer.cancel).toHaveBeenCalled()
  })

  it('cancels the timer on unmount', () => {
    const [, wrapper] = withSetup(() => useTimer())
    mock_timer.cancel.mockClear()
    wrapper.unmount()
    expect(mock_timer.cancel).toHaveBeenCalled()
  })
})
