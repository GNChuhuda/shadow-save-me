import type { InstantGateConfig, LevelDefinition } from '../levels/schema';
import type { GameState, Point } from './types';

export type BlockReason = 'wall' | 'echo-gate' | 'exit-door' | null;

export function pointsEqual(
  left: Point | null | undefined,
  right: Point | null | undefined,
): boolean {
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

export function getInstantGate(
  level: LevelDefinition,
  tile: string,
): InstantGateConfig | undefined {
  return level.mechanics.instantGates.find((gate) => gate.tile === tile);
}

export function isInstantGateReady(
  state: GameState,
  level: LevelDefinition,
  gateTile: string,
): boolean {
  const gate = getInstantGate(level, gateTile);
  return Boolean(
    gate &&
      pointsEqual(
        getNextGhost(state, level),
        level.positions.markers[gate.ghostSwitch],
      ),
  );
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
  if (getInstantGate(level, tile) && !isInstantGateReady(state, level, tile)) {
    return 'echo-gate';
  }
  if (
    tile === level.mechanics.persistentDoor?.tile &&
    !isExitDoorOpen(state)
  ) {
    return 'exit-door';
  }

  return null;
}

export function shouldUnlockExitDoor(
  state: GameState,
  level: LevelDefinition,
): boolean {
  const door = level.mechanics.persistentDoor;
  if (!door) return false;

  return (
    pointsEqual(getGhost(state, level), level.positions.markers[door.ghostSwitch]) &&
    pointsEqual(getPlayer(state), level.positions.markers[door.playerSwitch])
  );
}
