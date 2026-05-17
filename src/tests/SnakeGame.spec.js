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

    // If snake goes right, trying to move left should fail
    changeDirection('LEFT');
    expect(nextDirection).toBe('RIGHT');

    // If snake goes right, trying to move down should succeed
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
