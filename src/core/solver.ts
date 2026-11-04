import type { LevelDefinition } from '../levels/schema';
import { createInitialState, step } from './engine';
import type { Direction, GameState } from './types';

const directions: readonly Direction[] = ['up', 'down', 'left', 'right'];

export interface Solution {
  readonly directions: readonly Direction[];
  readonly turns: number;
}

interface SearchNode {
  readonly state: GameState;
  readonly route: readonly Direction[];
}

function stateKey(state: GameState, level: LevelDefinition): string {
  const relevantHistory = state.path
    .slice(-level.delay)
    .map(({ x, y }) => `${x},${y}`)
    .join(';');
  return `${state.doorUnlockedAt === null ? 'locked' : 'open'}|${relevantHistory}`;
}

export function findShortestSolution(
  level: LevelDefinition,
  maxTurns = 40,
): Solution | null {
  const initialState = createInitialState(level);
  const queue: SearchNode[] = [{ state: initialState, route: [] }];
  const visited = new Set([stateKey(initialState, level)]);

  for (let cursor = 0; cursor < queue.length; cursor += 1) {
    const node = queue[cursor];
    if (node.route.length >= maxTurns) continue;

    for (const direction of directions) {
      const result = step(node.state, direction, level);
      if (!result.moved) continue;

      const route = [...node.route, direction];
      if (result.state.won) {
        return { directions: route, turns: route.length };
      }

      const key = stateKey(result.state, level);
      if (visited.has(key)) continue;
      visited.add(key);
      queue.push({ state: result.state, route });
    }
  }

  return null;
}
