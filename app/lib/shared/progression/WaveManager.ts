/**
 * WaveManager - Handles game progression, difficulty scaling, and wave transitions.
 * 
 * Usage:
 *   const waveManager = new WaveManager({
 *     initialWave: 1,
 *     difficultyMultiplier: 1.2
 *   });
 *   
 *   waveManager.nextWave();
 *   const enemyCount = waveManager.getEnemyCount();
 */

export interface WaveConfig {
    initialWave?: number;
    difficultyMultiplier?: number;
    baseEnemyCount?: number;
    maxEnemies?: number;
}

export class WaveManager {
    currentWave: number;
    difficultyMultiplier: number;
    baseEnemyCount: number;
    maxEnemies: number;

    constructor(config: WaveConfig = {}) {
        this.currentWave = config.initialWave || 1;
        this.difficultyMultiplier = config.difficultyMultiplier || 1.2;
        this.baseEnemyCount = config.baseEnemyCount || 5;
        this.maxEnemies = config.maxEnemies || 50;
    }

    /**
     * Advance to the next wave
     */
    nextWave(): number {
        this.currentWave++;
        return this.currentWave;
    }

    /**
     * Reset to wave 1
     */
    reset(): void {
        this.currentWave = 1;
    }

    /**
     * Calculate number of enemies for the current wave
     */
    getEnemyCount(): number {
        // Formula: base * (multiplier ^ (wave - 1))
        const count = Math.floor(this.baseEnemyCount * Math.pow(this.difficultyMultiplier, this.currentWave - 1));
        return Math.min(count, this.maxEnemies);
    }

    /**
     * Get speed multiplier for enemies in current wave
     */
    getSpeedMultiplier(): number {
        // Slower scaling for speed (10% per wave)
        return 1 + (this.currentWave - 1) * 0.1;
    }

    /**
     * Get spawn interval (ms) for current wave
     * @param baseInterval - Base spawn interval in ms
     */
    getSpawnInterval(baseInterval: number = 2000): number {
        // Spawns get faster as waves progress
        const interval = baseInterval * Math.pow(0.9, this.currentWave - 1);
        return Math.max(interval, 500); // Cap at 500ms minimum
    }
}
