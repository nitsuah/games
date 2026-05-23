import { HighScoreManager, ScoreManager, StatsTracker } from '@/lib/shared/scoring';
import HighScoreManagerModule from '@/lib/shared/scoring/HighScoreManager';
import ScoreManagerModule from '@/lib/shared/scoring/ScoreManager';
import StatsTrackerModule from '@/lib/shared/scoring/StatsTracker';

describe('shared scoring barrel exports', () => {
  it('re-exports the shared scoring modules', () => {
    expect(HighScoreManager).toBe(HighScoreManagerModule);
    expect(ScoreManager).toBe(ScoreManagerModule);
    expect(StatsTracker).toBe(StatsTrackerModule);
  });
});