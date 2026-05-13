import { describe, it, expect, vi, beforeEach } from "vitest"
import { nextTick, ref } from "vue"
import { useTimer } from "@lib"
import { withSetup } from "./utils"
import { makeTimerMock } from "./mocks"
import { createTimer } from "animejs"

const mock_createTimer = vi.mocked(createTimer)

const mock_timer = makeTimerMock()

vi.mock("animejs", () => ({
  createTimer: vi.fn(() => mock_timer),
}))

describe("useTimer", () => {
  beforeEach(() => {
    mock_createTimer.mockClear()
    Object.values(mock_timer).forEach(fn => fn.mockClear())
  })

  it("creates timer synchronously with provided options", () => {
    withSetup(() => useTimer({ duration: 1000 }))
    expect(mock_createTimer).toHaveBeenCalledWith({ duration: 1000 })
  })

  it("creates timer with empty options by default", () => {
    withSetup(() => useTimer())
    expect(mock_createTimer).toHaveBeenCalledWith({})
  })

  it("exposes the timer instance", () => {
    const [result] = withSetup(() => useTimer())
    expect(result.timer.value).toBeDefined()
  })

  it("delegates play to the timer instance", () => {
    const [result] = withSetup(() => useTimer())
    result.play()
    expect(mock_timer.play).toHaveBeenCalledOnce()
  })

  it("delegates pause to the timer instance", () => {
    const [result] = withSetup(() => useTimer())
    result.pause()
    expect(mock_timer.pause).toHaveBeenCalledOnce()
  })

  it("delegates seek with args to the timer instance", () => {
    const [result] = withSetup(() => useTimer())
    result.seek(200, false)
    expect(mock_timer.seek).toHaveBeenCalledWith(200, false, undefined)
  })

  it("recreates timer when options ref changes", async () => {
    const options = ref({ duration: 500 })
    withSetup(() => useTimer(options))
    mock_createTimer.mockClear()
    options.value = { duration: 1000 }
    await nextTick()
    expect(mock_createTimer).toHaveBeenCalledWith({ duration: 1000 })
  })

  it("cancels the previous timer before recreating", async () => {
    const options = ref({ duration: 500 })
    withSetup(() => useTimer(options))
    mock_timer.cancel.mockClear()
    options.value = { duration: 1000 }
    await nextTick()
    expect(mock_timer.cancel).toHaveBeenCalled()
  })

  it("cancels the timer on unmount", () => {
    const [, wrapper] = withSetup(() => useTimer())
    mock_timer.cancel.mockClear()
    wrapper.unmount()
    expect(mock_timer.cancel).toHaveBeenCalled()
  })

  it("delegates reverse to the timer instance", () => {
    const [result] = withSetup(() => useTimer())
    result.reverse()
    expect(mock_timer.reverse).toHaveBeenCalledOnce()
  })

  it("delegates restart to the timer instance", () => {
    const [result] = withSetup(() => useTimer())
    result.restart()
    expect(mock_timer.restart).toHaveBeenCalledOnce()
  })

  it("delegates alternate to the timer instance", () => {
    const [result] = withSetup(() => useTimer())
    result.alternate()
    expect(mock_timer.alternate).toHaveBeenCalledOnce()
  })

  it("delegates resume to the timer instance", () => {
    const [result] = withSetup(() => useTimer())
    result.resume()
    expect(mock_timer.resume).toHaveBeenCalledOnce()
  })

  it("delegates complete to the timer instance", () => {
    const [result] = withSetup(() => useTimer())
    result.complete()
    expect(mock_timer.complete).toHaveBeenCalledOnce()
  })

  it("delegates reset with arg to the timer instance", () => {
    const [result] = withSetup(() => useTimer())
    result.reset(true)
    expect(mock_timer.reset).toHaveBeenCalledWith(true)
  })

  it("delegates revert to the timer instance", () => {
    const [result] = withSetup(() => useTimer())
    result.revert()
    expect(mock_timer.revert).toHaveBeenCalledOnce()
  })

  it("delegates stretch to the timer instance", () => {
    const [result] = withSetup(() => useTimer())
    result.stretch(5000)
    expect(mock_timer.stretch).toHaveBeenCalledWith(5000)
  })
})