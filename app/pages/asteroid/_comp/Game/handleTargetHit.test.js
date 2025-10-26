import { handleTargetHit } from './handleTargetHit'

describe('handleTargetHit - Combo System', () => {
  let mockSetTargets
  let mockSetHits
  let mockSetCombo
  let mockSetComboMultiplier
  let mockOnHit
  let comboTimerRef

  beforeEach(() => {
    mockSetTargets = jest.fn()
    mockSetHits = jest.fn((fn) => fn(0))
    mockSetCombo = jest.fn((fn) => {
      const newCombo = fn(0)
      return newCombo
    })
    mockSetComboMultiplier = jest.fn()
    mockOnHit = jest.fn()
    comboTimerRef = { current: null }

    jest.clearAllTimers()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  test('increments combo on successful hit', () => {
    const params = {
      targetId: 1,
      cooldowns: { spread: 0 },
      weapon: 'spread',
      ammo: { spread: 10 },
      setTargets: mockSetTargets,
      setHits: mockSetHits,
      onHit: mockOnHit,
      targetRefs: { current: {} },
      setCombo: mockSetCombo,
      setComboMultiplier: mockSetComboMultiplier,
      comboTimerRef,
    }

    handleTargetHit(params)

    expect(mockSetCombo).toHaveBeenCalled()
    expect(mockSetHits).toHaveBeenCalled()
    expect(mockOnHit).toHaveBeenCalled()
  })

  test('sets multiplier to 1.5x at combo 2', () => {
    mockSetCombo = jest.fn((fn) => {
      const newCombo = fn(1) // Previous combo was 1
      return newCombo
    })

    const params = {
      targetId: 1,
      cooldowns: { spread: 0 },
      weapon: 'spread',
      ammo: { spread: 10 },
      setTargets: mockSetTargets,
      setHits: mockSetHits,
      onHit: mockOnHit,
      targetRefs: { current: {} },
      setCombo: mockSetCombo,
      setComboMultiplier: mockSetComboMultiplier,
      comboTimerRef,
    }

    handleTargetHit(params)

    expect(mockSetComboMultiplier).toHaveBeenCalledWith(1.5)
  })

  test('sets multiplier to 2x at combo 5', () => {
    mockSetCombo = jest.fn((fn) => {
      const newCombo = fn(4) // Previous combo was 4
      return newCombo
    })

    const params = {
      targetId: 1,
      cooldowns: { spread: 0 },
      weapon: 'spread',
      ammo: { spread: 10 },
      setTargets: mockSetTargets,
      setHits: mockSetHits,
      onHit: mockOnHit,
      targetRefs: { current: {} },
      setCombo: mockSetCombo,
      setComboMultiplier: mockSetComboMultiplier,
      comboTimerRef,
    }

    handleTargetHit(params)

    expect(mockSetComboMultiplier).toHaveBeenCalledWith(2)
  })

  test('sets multiplier to 3x at combo 10', () => {
    mockSetCombo = jest.fn((fn) => {
      const newCombo = fn(9) // Previous combo was 9
      return newCombo
    })

    const params = {
      targetId: 1,
      cooldowns: { spread: 0 },
      weapon: 'spread',
      ammo: { spread: 10 },
      setTargets: mockSetTargets,
      setHits: mockSetHits,
      onHit: mockOnHit,
      targetRefs: { current: {} },
      setCombo: mockSetCombo,
      setComboMultiplier: mockSetComboMultiplier,
      comboTimerRef,
    }

    handleTargetHit(params)

    expect(mockSetComboMultiplier).toHaveBeenCalledWith(3)
  })

  test('resets combo timer on each hit', () => {
    const existingTimer = setTimeout(() => {}, 1000)
    comboTimerRef.current = existingTimer

    const params = {
      targetId: 1,
      cooldowns: { spread: 0 },
      weapon: 'spread',
      ammo: { spread: 10 },
      setTargets: mockSetTargets,
      setHits: mockSetHits,
      onHit: mockOnHit,
      targetRefs: { current: {} },
      setCombo: mockSetCombo,
      setComboMultiplier: mockSetComboMultiplier,
      comboTimerRef,
    }

    handleTargetHit(params)

    expect(comboTimerRef.current).not.toBe(existingTimer)
    expect(comboTimerRef.current).toBeTruthy()
  })

  test('does not fire when weapon is on cooldown', () => {
    const params = {
      targetId: 1,
      cooldowns: { spread: 0.5 },
      weapon: 'spread',
      ammo: { spread: 10 },
      setTargets: mockSetTargets,
      setHits: mockSetHits,
      onHit: mockOnHit,
      targetRefs: { current: {} },
      setCombo: mockSetCombo,
      setComboMultiplier: mockSetComboMultiplier,
      comboTimerRef,
    }

    handleTargetHit(params)

    expect(mockSetHits).not.toHaveBeenCalled()
    expect(mockSetCombo).not.toHaveBeenCalled()
  })

  test('does not fire when ammo is depleted', () => {
    const params = {
      targetId: 1,
      cooldowns: { spread: 0 },
      weapon: 'spread',
      ammo: { spread: 0 },
      setTargets: mockSetTargets,
      setHits: mockSetHits,
      onHit: mockOnHit,
      targetRefs: { current: {} },
      setCombo: mockSetCombo,
      setComboMultiplier: mockSetComboMultiplier,
      comboTimerRef,
    }

    handleTargetHit(params)

    expect(mockSetHits).not.toHaveBeenCalled()
    expect(mockSetCombo).not.toHaveBeenCalled()
  })
})
