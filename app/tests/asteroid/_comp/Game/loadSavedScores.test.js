import { loadSavedScores } from '../../../../lib/asteroid/_comp/Game/loadSavedScores';

describe('loadSavedScores - LocalStorage Score Retrieval', () => {
  let getItemMock;
  let setHighScore;
  let setBestAccuracy;

  beforeEach(() => {
    // Mock window.localStorage.getItem
    getItemMock = jest.fn();
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: getItemMock,
      },
      writable: true,
    });
    
    setHighScore = jest.fn();
    setBestAccuracy = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('should call setHighScore with parsed value from localStorage', () => {
    getItemMock.mockImplementation((key) => {
      if (key === 'asteroidHighScore') return '5000';
      return null;
    });

    loadSavedScores({ setHighScore, setBestAccuracy });

    expect(getItemMock).toHaveBeenCalledWith('asteroidHighScore');
    expect(setHighScore).toHaveBeenCalledWith(5000);
  });

  test('should call setBestAccuracy with parsed value from localStorage', () => {
    getItemMock.mockImplementation((key) => {
      if (key === 'asteroidBestAccuracy') return '95.5';
      return null;
    });

    loadSavedScores({ setHighScore, setBestAccuracy });

    expect(getItemMock).toHaveBeenCalledWith('asteroidBestAccuracy');
    expect(setBestAccuracy).toHaveBeenCalledWith(95.5);
  });

  test('should not call setters when localStorage values are null', () => {
    getItemMock.mockReturnValue(null);

    loadSavedScores({ setHighScore, setBestAccuracy });

    expect(setHighScore).not.toHaveBeenCalled();
    expect(setBestAccuracy).not.toHaveBeenCalled();
  });

  test('should parse integer strings correctly for highScore', () => {
    getItemMock.mockImplementation((key) => {
      if (key === 'asteroidHighScore') return '12345';
      return null;
    });

    loadSavedScores({ setHighScore, setBestAccuracy });

    expect(setHighScore).toHaveBeenCalledWith(12345);
  });

  test('should parse float strings correctly for bestAccuracy', () => {
    getItemMock.mockImplementation((key) => {
      if (key === 'asteroidBestAccuracy') return '87.65';
      return null;
    });

    loadSavedScores({ setHighScore, setBestAccuracy });

    expect(setBestAccuracy).toHaveBeenCalledWith(87.65);
  });

  test('should call both setters when both values exist', () => {
    getItemMock.mockImplementation((key) => {
      if (key === 'asteroidHighScore') return '3000';
      if (key === 'asteroidBestAccuracy') return '75';
      return null;
    });

    loadSavedScores({ setHighScore, setBestAccuracy });

    expect(setHighScore).toHaveBeenCalledWith(3000);
    expect(setBestAccuracy).toHaveBeenCalledWith(75);
  });
});
