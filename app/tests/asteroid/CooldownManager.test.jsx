/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render } from '@testing-library/react';
import CooldownManager from '@/lib/asteroid/_comp/Weapons/CooldownManager';

describe('CooldownManager', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // ─── Rendering ────────────────────────────────────────────────────────────
  describe('rendering', () => {
    it('renders null (no DOM output)', () => {
      const { container } = render(
        <CooldownManager
          _cooldowns={{}}
          setCooldowns={jest.fn()}
          rapidFireActive={false}
        />
      );
      expect(container.firstChild).toBeNull();
    });
  });

  // ─── Interval tick – normal mode ──────────────────────────────────────────
  describe('normal mode (rapidFireActive = false)', () => {
    it('decrements active cooldowns by 1/60 each tick', () => {
      let cooldowns = { primary: 1.0 };
      const setCooldowns = jest.fn((updater) => {
        cooldowns = updater(cooldowns);
      });

      render(
        <CooldownManager
          _cooldowns={cooldowns}
          setCooldowns={setCooldowns}
          rapidFireActive={false}
        />
      );

      // Advance one frame (≈16.67ms)
      jest.advanceTimersByTime(1000 / 60);

      expect(setCooldowns).toHaveBeenCalled();
      expect(cooldowns.primary).toBeCloseTo(1.0 - 1 / 60, 5);
    });

    it('clamps cooldown to 0 (never goes negative)', () => {
      let cooldowns = { primary: 0.005 }; // less than 1/60
      const setCooldowns = jest.fn((updater) => {
        cooldowns = updater(cooldowns);
      });

      render(
        <CooldownManager
          _cooldowns={cooldowns}
          setCooldowns={setCooldowns}
          rapidFireActive={false}
        />
      );

      jest.advanceTimersByTime(1000 / 60);
      expect(cooldowns.primary).toBe(0);
    });

    it('does not update cooldowns already at 0 (returns same reference)', () => {
      const frozenCooldowns = { primary: 0 };
      let result;
      const setCooldowns = jest.fn((updater) => {
        result = updater(frozenCooldowns);
      });

      render(
        <CooldownManager
          _cooldowns={frozenCooldowns}
          setCooldowns={setCooldowns}
          rapidFireActive={false}
        />
      );

      jest.advanceTimersByTime(1000 / 60);
      // When nothing changes the updater should return the same prev reference
      expect(result).toBe(frozenCooldowns);
    });

    it('decrements multiple cooldown keys independently', () => {
      let cooldowns = { primary: 1.0, secondary: 0.5 };
      const setCooldowns = jest.fn((updater) => {
        cooldowns = updater(cooldowns);
      });

      render(
        <CooldownManager
          _cooldowns={cooldowns}
          setCooldowns={setCooldowns}
          rapidFireActive={false}
        />
      );

      jest.advanceTimersByTime(1000 / 60);

      expect(cooldowns.primary).toBeCloseTo(1.0 - 1 / 60, 5);
      expect(cooldowns.secondary).toBeCloseTo(0.5 - 1 / 60, 5);
    });
  });

  // ─── Interval tick – rapid-fire mode ──────────────────────────────────────
  describe('rapid fire mode (rapidFireActive = true)', () => {
    it('drains cooldowns faster (by 99% per tick)', () => {
      let cooldowns = { primary: 1.0 };
      const setCooldowns = jest.fn((updater) => {
        cooldowns = updater(cooldowns);
      });

      render(
        <CooldownManager
          _cooldowns={cooldowns}
          setCooldowns={setCooldowns}
          rapidFireActive={true}
        />
      );

      jest.advanceTimersByTime(1000 / 60);

      // reduction = value * 0.99  → remaining = 1.0 - 0.99 = 0.01
      expect(cooldowns.primary).toBeCloseTo(0.01, 5);
    });

    it('eventually reaches 0 with rapid fire', () => {
      let cooldowns = { primary: 1.0 };
      const setCooldowns = jest.fn((updater) => {
        cooldowns = updater(cooldowns);
      });

      render(
        <CooldownManager
          _cooldowns={cooldowns}
          setCooldowns={setCooldowns}
          rapidFireActive={true}
        />
      );

      // Advance many frames
      jest.advanceTimersByTime((1000 / 60) * 500);
      expect(cooldowns.primary).toBe(0);
    });
  });

  // ─── Cleanup / unmount ────────────────────────────────────────────────────
  describe('cleanup on unmount', () => {
    it('stops the interval when the component unmounts', () => {
      const setCooldowns = jest.fn();

      const { unmount } = render(
        <CooldownManager
          _cooldowns={{ primary: 1.0 }}
          setCooldowns={setCooldowns}
          rapidFireActive={false}
        />
      );

      unmount();
      const callCountAfterUnmount = setCooldowns.mock.calls.length;

      // Advance time – no more calls should happen
      jest.advanceTimersByTime(1000);
      expect(setCooldowns.mock.calls.length).toBe(callCountAfterUnmount);
    });
  });

  // ─── Prop changes ─────────────────────────────────────────────────────────
  describe('prop updates', () => {
    it('switches to rapid-fire reduction when rapidFireActive changes to true', () => {
      let cooldowns = { primary: 1.0 };
      const setCooldowns = jest.fn((updater) => {
        cooldowns = updater(cooldowns);
      });

      const { rerender } = render(
        <CooldownManager
          _cooldowns={cooldowns}
          setCooldowns={setCooldowns}
          rapidFireActive={false}
        />
      );

      // One normal tick
      jest.advanceTimersByTime(1000 / 60);
      const afterNormal = cooldowns.primary;
      expect(afterNormal).toBeCloseTo(1.0 - 1 / 60, 5);

      // Switch to rapid fire
      rerender(
        <CooldownManager
          _cooldowns={cooldowns}
          setCooldowns={setCooldowns}
          rapidFireActive={true}
        />
      );

      jest.advanceTimersByTime(1000 / 60);
      // In rapid fire: reduction = current * 0.99
      const expectedReduction = afterNormal * 0.99;
      expect(cooldowns.primary).toBeCloseTo(afterNormal - expectedReduction, 5);
    });
  });

  // ─── Interval frequency ───────────────────────────────────────────────────
  describe('interval runs at ~60 fps', () => {
    it('calls setCooldowns approximately 60 times per second', () => {
      let cooldowns = { primary: 999 }; // large value so it never reaches 0
      const setCooldowns = jest.fn((updater) => {
        cooldowns = updater(cooldowns);
      });

      render(
        <CooldownManager
          _cooldowns={cooldowns}
          setCooldowns={setCooldowns}
          rapidFireActive={false}
        />
      );

      jest.advanceTimersByTime(1000); // 1 second
      // Should fire ~60 times (allow ±2 tolerance for fake-timer precision)
      expect(setCooldowns.mock.calls.length).toBeGreaterThanOrEqual(58);
      expect(setCooldowns.mock.calls.length).toBeLessThanOrEqual(62);
    });
  });
});
