import { updateScore } from './updateScore'

describe('updateScore - Score Calculation with Multiplier', () => {
  let mockSetScore

  beforeEach(() => {
    mockSetScore = jest.fn()
  })

  test('calculates base score without multiplier', () => {
    const params = {
      hits: 10,
      misses: 0,
      setScore: mockSetScore,
      comboMultiplier: 1,
    }

    updateScore(params)

    // Base score: (10 * 100) + ((10 / 10) * 100) = 1000 + 100 = 1100
    expect(mockSetScore).toHaveBeenCalledWith(1100)
  })

  test('applies 1.5x multiplier correctly', () => {
    const params = {
      hits: 10,
      misses: 0,
      setScore: mockSetScore,
      comboMultiplier: 1.5,
    }

    updateScore(params)

    // Base score: 1100 * 1.5 = 1650
    expect(mockSetScore).toHaveBeenCalledWith(1650)
  })

  test('applies 2x multiplier correctly', () => {
    const params = {
      hits: 10,
      misses: 0,
      setScore: mockSetScore,
      comboMultiplier: 2,
    }

    updateScore(params)

    // Base score: 1100 * 2 = 2200
    expect(mockSetScore).toHaveBeenCalledWith(2200)
  })

  test('applies 3x multiplier correctly', () => {
    const params = {
      hits: 10,
      misses: 0,
      setScore: mockSetScore,
      comboMultiplier: 3,
    }

    updateScore(params)

    // Base score: 1100 * 3 = 3300
    expect(mockSetScore).toHaveBeenCalledWith(3300)
  })

  test('handles accuracy penalty with multiplier', () => {
    const params = {
      hits: 5,
      misses: 5,
      setScore: mockSetScore,
      comboMultiplier: 2,
    }

    updateScore(params)

    // Base score: (5 * 100) + ((5 / 10) * 100) = 500 + 50 = 550
    // With 2x multiplier: 550 * 2 = 1100
    expect(mockSetScore).toHaveBeenCalledWith(1100)
  })

  test('handles zero hits gracefully', () => {
    const params = {
      hits: 0,
      misses: 5,
      setScore: mockSetScore,
      comboMultiplier: 1,
    }

    updateScore(params)

    // Base score: (0 * 100) + ((0 / 5) * 100) = 0 + 0 = 0
    expect(mockSetScore).toHaveBeenCalledWith(0)
  })

  test('defaults to 1x multiplier when not provided', () => {
    const params = {
      hits: 10,
      misses: 0,
      setScore: mockSetScore,
      // comboMultiplier not provided
    }

    updateScore(params)

    // Should use default 1x multiplier
    expect(mockSetScore).toHaveBeenCalledWith(1100)
  })

  test('rounds score to integer', () => {
    const params = {
      hits: 3,
      misses: 0,
      setScore: mockSetScore,
      comboMultiplier: 1.5,
    }

    updateScore(params)

    // Base score: (3 * 100) + ((3 / 3) * 100) = 300 + 100 = 400
    // With 1.5x multiplier: 400 * 1.5 = 600 (should be integer)
    expect(mockSetScore).toHaveBeenCalledWith(600)
  })
})
