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
     */
    loseLife(currentTime: number = Date.now()): boolean {
        if (this.isInvincible(currentTime)) {
            return false;
        }

        if (this.lives > 0) {
            this.lives--;
            this.lastHitTime = currentTime;
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
     */
    isInvincible(currentTime: number = Date.now()): boolean {
        return (currentTime - this.lastHitTime) < this.invincibilityDuration;
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
