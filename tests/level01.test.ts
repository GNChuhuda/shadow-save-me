import { describe, expect, it } from 'vitest';
import { createInitialState, reset, step, undo } from '../src/core/engine';
import { getGhost, getPlayer, getTurn, pointsEqual } from '../src/core/rules';
import { findShortestSolution } from '../src/core/solver';
import type { Direction, GameState } from '../src/core/types';
import { level01 } from '../src/levels/level01';

function follow(route: readonly Direction[], initial = createInitialState(level01)): GameState {
  return route.reduce((state, direction) => step(state, direction, level01).state, initial);
}

describe('第一关：回声狭门', () => {
  it('撞墙不会移动，也不会消耗回合', () => {
    const initial = createInitialState(level01);
    const result = step(initial, 'up', level01);

    expect(result.moved).toBe(false);
    expect(result.event).toBe('wall-blocked');
    expect(result.state).toBe(initial);
    expect(getTurn(result.state)).toBe(0);
  });

  it('G 只在进入后的影子恰好位于 A 时允许通过', () => {
    const directApproach = follow(['down', 'down', 'right']);
    const blocked = step(directApproach, 'right', level01);

    expect(getTurn(directApproach)).toBe(3);
    expect(blocked.moved).toBe(false);
    expect(blocked.event).toBe('echo-gate-blocked');
    expect(getTurn(blocked.state)).toBe(3);

    const alignedApproach = follow(['down', 'down', 'right', 'up', 'down']);
    const passed = step(alignedApproach, 'right', level01);

    expect(passed.moved).toBe(true);
    expect(passed.event).toBe('echo-gate-passed');
    expect(getTurn(passed.state)).toBe(6);
    expect(pointsEqual(getGhost(passed.state, level01), level01.positions.ghostSwitch)).toBe(true);
    expect(pointsEqual(getPlayer(passed.state), level01.positions.echoGate)).toBe(true);
  });

  it('影子在 A 且玩家在 B 的同一回合永久解锁 D', () => {
    const throughGate = follow(['down', 'down', 'right', 'up', 'down', 'right']);
    const beforeB = step(throughGate, 'right', level01).state;

    expect(beforeB.doorUnlockedAt).toBeNull();

    const atB = step(beforeB, 'right', level01);
    expect(atB.event).toBe('door-unlocked');
    expect(atB.state.doorUnlockedAt).toBe(8);
    expect(pointsEqual(getGhost(atB.state, level01), level01.positions.ghostSwitch)).toBe(true);
    expect(pointsEqual(getPlayer(atB.state), level01.positions.playerSwitch)).toBe(true);

    const afterLeavingB = step(atB.state, 'right', level01).state;
    expect(afterLeavingB.doorUnlockedAt).toBe(8);
  });

  it('撤销会回滚位置、回合、影子和 D 门解锁状态', () => {
    const unlocked = follow(level01.verifiedRoute.slice(0, 8));
    const restored = undo(unlocked);

    expect(unlocked.doorUnlockedAt).toBe(8);
    expect(getTurn(restored)).toBe(7);
    expect(restored.doorUnlockedAt).toBeNull();
    expect(restored.won).toBe(false);
    expect(getPlayer(restored)).toEqual({ x: 4, y: 3 });
    expect(getGhost(restored, level01)).toEqual({ x: 2, y: 2 });
  });

  it('原有 11 步路线可以通关', () => {
    const completed = follow(level01.verifiedRoute);

    expect(getTurn(completed)).toBe(11);
    expect(completed.won).toBe(true);
    expect(completed.doorUnlockedAt).toBe(8);
    expect(pointsEqual(getPlayer(completed), level01.positions.exit)).toBe(true);
  });

  it('引擎可以从胜利状态完整撤销一回合', () => {
    const completed = follow(level01.verifiedRoute);
    const restored = undo(completed);

    expect(restored.won).toBe(false);
    expect(getTurn(restored)).toBe(10);
    expect(restored.doorUnlockedAt).toBe(8);
    expect(getPlayer(restored)).toEqual({ x: 7, y: 3 });
  });

  it('求解器确认最短解为 11 步', () => {
    const solution = findShortestSolution(level01);

    expect(solution).not.toBeNull();
    expect(solution?.turns).toBe(11);
  });

  it('重开会恢复所有初始状态', () => {
    const completed = follow(level01.verifiedRoute);
    const restarted = reset(level01);

    expect(completed.won).toBe(true);
    expect(restarted).toEqual(createInitialState(level01));
    expect(getTurn(restarted)).toBe(0);
    expect(restarted.doorUnlockedAt).toBeNull();
    expect(restarted.won).toBe(false);
    expect(getGhost(restarted, level01)).toBeNull();
  });
});
