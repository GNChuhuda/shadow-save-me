import type { LevelDefinition } from '../levels/schema';
import {
  getBlockReason,
  getGhost,
  getInstantGate,
  getPlayer,
  getTile,
  getTurn,
  pointsEqual,
  shouldUnlockExitDoor,
} from './rules';
import type { Direction, GameState, Point, StepResult } from './types';

const directionVectors: Record<Direction, Point> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

export function createInitialState(level: LevelDefinition): GameState {
  return {
    levelId: level.id,
    path: [{ ...level.positions.start }],
    doorUnlockedAt: null,
    won: false,
  };
}

export function step(
  state: GameState,
  direction: Direction,
  level: LevelDefinition,
): StepResult {
  if (state.won) {
    return { state, moved: false, event: 'already-won' };
  }

  const player = getPlayer(state);
  const vector = directionVectors[direction];
  const destination = {
    x: player.x + vector.x,
    y: player.y + vector.y,
  };
  const blockReason = getBlockReason(state, level, destination);

  if (blockReason === 'wall') {
    return { state, moved: false, event: 'wall-blocked' };
  }
  if (blockReason === 'echo-gate') {
    const gate = getInstantGate(level, getTile(level, destination) ?? '');
    return {
      state,
      moved: false,
      event: 'echo-gate-blocked',
      ...(gate
        ? { gate: { tile: gate.tile, ghostSwitch: gate.ghostSwitch } }
        : {}),
    };
  }
  if (blockReason === 'exit-door') {
    return { state, moved: false, event: 'exit-door-blocked' };
  }

  const tile = getTile(level, destination);
  const instantGate = tile ? getInstantGate(level, tile) : undefined;
  let nextState: GameState = {
    ...state,
    path: [...state.path, destination],
  };

  if (nextState.doorUnlockedAt === null && shouldUnlockExitDoor(nextState, level)) {
    nextState = {
      ...nextState,
      doorUnlockedAt: getTurn(nextState),
    };
  }

  if (
    tile === level.mechanics.exit.tile &&
    (!level.mechanics.persistentDoor || nextState.doorUnlockedAt !== null)
  ) {
    nextState = { ...nextState, won: true };
    return { state: nextState, moved: true, event: 'won' };
  }

  if (nextState.doorUnlockedAt === getTurn(nextState)) {
    return { state: nextState, moved: true, event: 'door-unlocked' };
  }
  if (instantGate) {
    return {
      state: nextState,
      moved: true,
      event: 'echo-gate-passed',
      gate: {
        tile: instantGate.tile,
        ghostSwitch: instantGate.ghostSwitch,
      },
    };
  }
  if (getTurn(nextState) === level.delay) {
    return { state: nextState, moved: true, event: 'ghost-appeared' };
  }
  if (pointsEqual(getPlayer(nextState), level.positions.markers.A)) {
    return { state: nextState, moved: true, event: 'standing-on-a' };
  }
  if (
    level.mechanics.persistentDoor &&
    pointsEqual(
      getPlayer(nextState),
      level.positions.markers[level.mechanics.persistentDoor.playerSwitch],
    ) &&
    !pointsEqual(
      getGhost(nextState, level),
      level.positions.markers[level.mechanics.persistentDoor.ghostSwitch],
    )
  ) {
    return { state: nextState, moved: true, event: 'standing-on-b-without-ghost' };
  }

  return { state: nextState, moved: true, event: 'moved' };
}

export function undo(state: GameState): GameState {
  if (getTurn(state) === 0) return state;

  const path = state.path.slice(0, -1);
  const turnAfterUndo = path.length - 1;

  return {
    ...state,
    path,
    doorUnlockedAt:
      state.doorUnlockedAt !== null && turnAfterUndo < state.doorUnlockedAt
        ? null
        : state.doorUnlockedAt,
    won: false,
  };
}

export function reset(level: LevelDefinition): GameState {
  return createInitialState(level);
}
