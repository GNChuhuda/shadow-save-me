import { level01 } from './level01';
import { level02 } from './level02';
import type { LevelDefinition } from './schema';

export const levels: readonly LevelDefinition[] = [level01, level02];

export function getLevel(levelId: string): LevelDefinition | undefined {
  return levels.find((level) => level.id === levelId);
}
