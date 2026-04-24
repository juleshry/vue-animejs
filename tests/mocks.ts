import { vi } from 'vitest'

export function makeAnimationMock() {
  return {
    play: vi.fn().mockReturnThis(),
    pause: vi.fn().mockReturnThis(),
    cancel: vi.fn().mockReturnThis(),
    reverse: vi.fn().mockReturnThis(),
    restart: vi.fn().mockReturnThis(),
    alternate: vi.fn().mockReturnThis(),
    resume: vi.fn().mockReturnThis(),
    complete: vi.fn().mockReturnThis(),
    revert: vi.fn().mockReturnThis(),
    reset: vi.fn().mockReturnThis(),
    seek: vi.fn().mockReturnThis(),
    stretch: vi.fn().mockReturnThis(),
    refresh: vi.fn().mockReturnThis(),
  }
}

export function makeTimerMock() {
  return {
    play: vi.fn().mockReturnThis(),
    pause: vi.fn().mockReturnThis(),
    cancel: vi.fn().mockReturnThis(),
    reverse: vi.fn().mockReturnThis(),
    restart: vi.fn().mockReturnThis(),
    alternate: vi.fn().mockReturnThis(),
    resume: vi.fn().mockReturnThis(),
    complete: vi.fn().mockReturnThis(),
    revert: vi.fn().mockReturnThis(),
    reset: vi.fn().mockReturnThis(),
    seek: vi.fn().mockReturnThis(),
    stretch: vi.fn().mockReturnThis(),
  }
}

export function makeWaapiAnimationMock() {
  return {
    resume: vi.fn().mockReturnThis(),
    pause: vi.fn().mockReturnThis(),
    alternate: vi.fn().mockReturnThis(),
    play: vi.fn().mockReturnThis(),
    reverse: vi.fn().mockReturnThis(),
    seek: vi.fn().mockReturnThis(),
    restart: vi.fn().mockReturnThis(),
    commitStyles: vi.fn().mockReturnThis(),
    complete: vi.fn().mockReturnThis(),
    cancel: vi.fn().mockReturnThis(),
    revert: vi.fn().mockReturnThis(),
  }
}

export function makeTimelineMock() {
  return {
    add: vi.fn().mockReturnValue({}),
    set: vi.fn().mockReturnValue({}),
    remove: vi.fn().mockReturnValue({}),
    sync: vi.fn().mockReturnThis(),
    label: vi.fn().mockReturnThis(),
    call: vi.fn().mockReturnThis(),
    init: vi.fn().mockReturnThis(),
    play: vi.fn().mockReturnThis(),
    pause: vi.fn().mockReturnThis(),
    cancel: vi.fn().mockReturnThis(),
    revert: vi.fn().mockReturnThis(),
    restart: vi.fn().mockReturnThis(),
    seek: vi.fn().mockReturnThis(),
    stretch: vi.fn().mockReturnThis(),
    refresh: vi.fn().mockReturnThis(),
  }
}

export function makeDraggableMock() {
  return {
    disable: vi.fn().mockReturnThis(),
    enable: vi.fn().mockReturnThis(),
    setX: vi.fn().mockReturnThis(),
    setY: vi.fn().mockReturnThis(),
    animateInView: vi.fn().mockReturnThis(),
    scrollInView: vi.fn().mockReturnThis(),
    stop: vi.fn().mockReturnThis(),
    reset: vi.fn().mockReturnThis(),
    revert: vi.fn().mockReturnThis(),
    refresh: vi.fn().mockReturnThis(),
  }
}

export function makeLayoutMock() {
  return {
    record: vi.fn().mockReturnThis(),
    animate: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    revert: vi.fn().mockReturnThis(),
  }
}

export function makeAnimatableMock() {
  return {
    revert: vi.fn().mockReturnThis(),
  }
}

export function makeTextSplitterMock() {
  return {
    lines: [document.createElement('div')] as HTMLElement[],
    words: [document.createElement('span')] as HTMLElement[],
    chars: [document.createElement('span'), document.createElement('span')] as HTMLElement[],
    revert: vi.fn(),
    refresh: vi.fn(),
  }
}

export function makeScopeMock() {
  const mock = {
    add: vi.fn(),
    addOnce: vi.fn(),
    execute: vi.fn(),
    revert: vi.fn(),
    refresh: vi.fn(),
    keepTime: vi.fn(),
  }
  mock.execute.mockImplementation((cb: (s: typeof mock) => unknown) => cb(mock))
  return mock
}
