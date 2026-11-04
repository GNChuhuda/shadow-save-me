import type { LevelDefinition } from '../levels/schema';
import type { GameState, Point } from './types';

export type BlockReason = 'wall' | 'echo-gate' | 'exit-door' | null;

export function pointsEqual(left: Point | null, right: Point | null): boolean {
  return Boolean(left && right && left.x === right.x && left.y === right.y);
}

export function getTurn(state: GameState): number {
  return state.path.length - 1;
}

export function getPlayer(state: GameState): Point {
  return state.path[state.path.length - 1];
}

export function getGhost(state: GameState, level: LevelDefinition): Point | null {
  const historyIndex = getTurn(state) - level.delay;
  return historyIndex >= 0 ? state.path[historyIndex] : null;
}

export function getNextGhost(state: GameState, level: LevelDefinition): Point | null {
  const historyIndex = getTurn(state) + 1 - level.delay;
  return historyIndex >= 0 ? state.path[historyIndex] : null;
}

export function getTile(level: LevelDefinition, point: Point): string | undefined {
  return level.map[point.y]?.[point.x];
}

export function isEchoGateReady(state: GameState, level: LevelDefinition): boolean {
  return pointsEqual(getNextGhost(state, level), level.positions.ghostSwitch);
}

export function isExitDoorOpen(state: GameState): boolean {
  return state.doorUnlockedAt !== null;
}

export function getBlockReason(
  state: GameState,
  level: LevelDefinition,
  destination: Point,
): BlockReason {
  const tile = getTile(level, destination);

  if (!tile || tile === '#') return 'wall';
  if (tile === level.mechanics.echoGate.tile && !isEchoGateReady(state, level)) {
    return 'echo-gate';
  }
  if (tile === level.mechanics.exitDoor.tile && !isExitDoorOpen(state)) {
    return 'exit-door';
  }

  return null;
}

export function shouldUnlockExitDoor(
  state: GameState,
  level: LevelDefinition,
): boolean {
  return (
    pointsEqual(getGhost(state, level), level.positions.ghostSwitch) &&
    pointsEqual(getPlayer(state), level.positions.playerSwitch)
  );
}
