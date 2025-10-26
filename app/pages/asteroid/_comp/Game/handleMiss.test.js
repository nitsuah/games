import { handleMiss } from './handleMiss';

describe('handleMiss - Combo Reset', () => {
  let mockSetMisses;
  let mockSetCombo;
  let mockSetComboMultiplier;
  let mockOnMiss;
  let comboTimerRef;

  beforeEach(() => {
    mockSetMisses = jest.fn((fn) => fn(0));
    mockSetCombo = jest.fn();
    mockSetComboMultiplier = jest.fn();
    mockOnMiss = jest.fn();
    comboTimerRef = { current: null };

    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  test('increments misses counter', () => {
    const params = {
      setMisses: mockSetMisses,
      onMiss: mockOnMiss,
      setCombo: mockSetCombo,
      setComboMultiplier: mockSetComboMultiplier,
      comboTimerRef,
    };

    handleMiss(params);

    expect(mockSetMisses).toHaveBeenCalled();
    expect(mockOnMiss).toHaveBeenCalled();
  });

  test('resets combo to 0 on miss', () => {
    const params = {
      setMisses: mockSetMisses,
      onMiss: mockOnMiss,
      setCombo: mockSetCombo,
      setComboMultiplier: mockSetComboMultiplier,
      comboTimerRef,
    };

    handleMiss(params);

    expect(mockSetCombo).toHaveBeenCalledWith(0);
  });

  test('resets multiplier to 1x on miss', () => {
    const params = {
      setMisses: mockSetMisses,
      onMiss: mockOnMiss,
      setCombo: mockSetCombo,
      setComboMultiplier: mockSetComboMultiplier,
      comboTimerRef,
    };

    handleMiss(params);

    expect(mockSetComboMultiplier).toHaveBeenCalledWith(1);
  });

  test('clears combo timer on miss', () => {
    const existingTimer = setTimeout(() => {}, 3000);
    comboTimerRef.current = existingTimer;

    const params = {
      setMisses: mockSetMisses,
      onMiss: mockOnMiss,
      setCombo: mockSetCombo,
      setComboMultiplier: mockSetComboMultiplier,
      comboTimerRef,
    };

    handleMiss(params);

    // Timer should be cleared
    jest.runAllTimers();
    expect(mockSetCombo).toHaveBeenCalledWith(0);
  });
});
