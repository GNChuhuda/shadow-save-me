import { level01 } from './level01';
import type { LevelDefinition } from './schema';

export const levels: readonly LevelDefinition[] = [level01];

export function getLevel(levelId: string): LevelDefinition | undefined {
  return levels.find((level) => level.id === levelId);
}
