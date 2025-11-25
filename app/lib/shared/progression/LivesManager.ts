/**
 * LivesManager - Handles player lives, invincibility frames, and game over state.
 */

export interface LivesConfig {
    initialLives?: number;
    maxLives?: number;
    invincibilityDuration?: number; // in ms
}

export class LivesManager {
    lives: number;
    maxLives: number;
    invincibilityDuration: number;
    lastHitTime: number;

    constructor(config: LivesConfig = {}) {
        this.lives = config.initialLives || 3;
        this.maxLives = config.maxLives || 5;
        this.invincibilityDuration = config.invincibilityDuration || 2000;
        this.lastHitTime = 0;
    }

    /**
     * Attempt to lose a life. Returns true if life was lost, false if invincible.
     * @param currentTime - Current timestamp in milliseconds. If not provided, uses Date.now().
     */
    loseLife(currentTime?: number): boolean {
        // Note: For testing, always provide a specific timestamp to avoid time-based flakiness
        const time = currentTime ?? Date.now();
        if (this.isInvincible(time)) {
            return false;
        }

        if (this.lives > 0) {
            this.lives--;
            this.lastHitTime = time;
            return true;
        }

        return false;
    }

    /**
     * Gain a life (up to max)
     */
    gainLife(amount: number = 1): void {
        this.lives = Math.min(this.lives + amount, this.maxLives);
    }

    /**
     * Check if player is currently invincible
     * @param currentTime - Current timestamp in milliseconds. If not provided, uses Date.now().
     */
    isInvincible(currentTime?: number): boolean {
        // Note: For testing, always provide a specific timestamp to avoid time-based flakiness
        const time = currentTime ?? Date.now();
        return (time - this.lastHitTime) < this.invincibilityDuration;
    }

    /**
     * Check if game is over (0 lives)
     */
    isGameOver(): boolean {
        return this.lives <= 0;
    }

    /**
     * Reset to initial state
     */
    reset(initialLives?: number): void {
        this.lives = initialLives || 3;
        this.lastHitTime = 0;
    }
}
