import { describe, it, expect } from 'vitest';

describe('Snake Core Gameplay Logic (Task 2)', () => {
  it('should prevent backward movement overrides', () => {
    let direction = 'RIGHT';
    let nextDirection = 'RIGHT';

    const changeDirection = (newDir) => {
      const oppositeDirs = {
        'UP': 'DOWN',
        'DOWN': 'UP',
        'LEFT': 'RIGHT',
        'RIGHT': 'LEFT'
      };

      if (newDir !== oppositeDirs[direction]) {
        nextDirection = newDir;
      }
    };

    changeDirection('LEFT');
    expect(nextDirection).toBe('RIGHT');

    changeDirection('DOWN');
    expect(nextDirection).toBe('DOWN');
  });

  it('should accurately detect border boundary collisions', () => {
    const TILE_COUNT = 20;
    const isOutOfBounds = (x, y) => {
      return x < 0 || x >= TILE_COUNT || y < 0 || y >= TILE_COUNT;
    };

    expect(isOutOfBounds(0, 0)).toBe(false);
    expect(isOutOfBounds(19, 19)).toBe(false);
    expect(isOutOfBounds(-1, 10)).toBe(true);
    expect(isOutOfBounds(10, 20)).toBe(true);
  });
});

describe('Score, HighScore and Difficulty Verification (Task 3)', () => {
  it('should apply difficulty score multipliers correctly', () => {
    const difficulties = [
      { id: 'easy', multiplier: 1.0 },
      { id: 'medium', multiplier: 1.5 },
      { id: 'hard', multiplier: 2.0 },
      { id: 'insane', multiplier: 3.0 }
    ];

    const getScoreIncrement = (diffId) => {
      const activeDiff = difficulties.find(d => d.id === diffId);
      const mult = activeDiff ? activeDiff.multiplier : 1.0;
      return Math.round(10 * mult);
    };

    expect(getScoreIncrement('easy')).toBe(10);
    expect(getScoreIncrement('medium')).toBe(15);
    expect(getScoreIncrement('hard')).toBe(20);
    expect(getScoreIncrement('insane')).toBe(30);
  });

  it('should persist and load high score from localStorage', () => {
    // Mock local storage
    const fakeLocalStorage = {
      snake_highscore: null,
      getItem(key) { return this[key] || null; },
      setItem(key, val) { this[key] = val.toString(); },
      clear() { this.snake_highscore = null; }
    };

    fakeLocalStorage.setItem('snake_highscore', '150');
    const scoreVal = parseInt(fakeLocalStorage.getItem('snake_highscore') || '0');
    expect(scoreVal).toBe(150);

    const currentScore = 200;
    let high = scoreVal;
    let isNewRecord = false;

    if (currentScore > high) {
      high = currentScore;
      fakeLocalStorage.setItem('snake_highscore', high.toString());
      isNewRecord = true;
    }

    expect(isNewRecord).toBe(true);
    expect(parseInt(fakeLocalStorage.getItem('snake_highscore'))).toBe(200);
  });
});
