import { describe, expect, it } from 'vitest';
import { createInitialState, reset, step, undo } from '../src/core/engine';
import {
  getGhost,
  getPlayer,
  getTurn,
  isInstantGateReady,
  pointsEqual,
} from '../src/core/rules';
import { findShortestSolution } from '../src/core/solver';
import type { Direction, GameState } from '../src/core/types';
import { level02 } from '../src/levels/level02';
import { feedbackForEvent } from '../src/ui/render';

function follow(
  route: readonly Direction[],
  initial = createInitialState(level02),
): GameState {
  return route.reduce(
    (state, direction) => step(state, direction, level02).state,
    initial,
  );
}

describe('第二关：交错的脚步', () => {
  it('经过上路的 11 步验证路线可以依次穿过 G、H 并通关', () => {
    const beforeG = follow(level02.verifiedRoute.slice(0, 6));
    const atG = step(beforeG, level02.verifiedRoute[6], level02);
    const beforeH = follow(level02.verifiedRoute.slice(7, 8), atG.state);
    const atH = step(beforeH, level02.verifiedRoute[8], level02);
    const completed = follow(level02.verifiedRoute.slice(9), atH.state);

    expect(atG.event).toBe('echo-gate-passed');
    expect(atG.gate).toEqual({ tile: 'G', ghostSwitch: 'A' });
    expect(atH.event).toBe('echo-gate-passed');
    expect(atH.gate).toEqual({ tile: 'H', ghostSwitch: 'C' });
    expect(getTurn(completed)).toBe(11);
    expect(completed.won).toBe(true);
    expect(completed.doorUnlockedAt).toBeNull();
    expect(pointsEqual(getPlayer(completed), level02.positions.exit)).toBe(true);
  });

  it('门在尝试进入后的那一拍检查影子，而不是检查当前影子', () => {
    const beforeG = follow(level02.verifiedRoute.slice(0, 6));

    expect(pointsEqual(getGhost(beforeG, level02), level02.positions.markers.A)).toBe(false);
    expect(isInstantGateReady(beforeG, level02, 'G')).toBe(true);

    const atG = step(beforeG, 'down', level02);
    expect(pointsEqual(getGhost(atG.state, level02), level02.positions.markers.A)).toBe(true);

    const beforeH = step(atG.state, 'right', level02).state;
    expect(pointsEqual(getGhost(beforeH, level02), level02.positions.markers.C)).toBe(false);
    expect(isInstantGateReady(beforeH, level02, 'H')).toBe(true);

    const atH = step(beforeH, 'right', level02);
    expect(atH.moved).toBe(true);
    expect(pointsEqual(getGhost(atH.state, level02), level02.positions.markers.C)).toBe(true);
  });

  it('下路可以通过 G，但到 H 时会因历史位置错误而受阻', () => {
    const wrongLowerRoute: readonly Direction[] = [
      'down',
      'down',
      'right',
      'right',
      'down',
      'right',
      'up',
    ];
    const atG = follow(wrongLowerRoute);
    const corridor = step(atG, 'right', level02).state;
    const blocked = step(corridor, 'right', level02);

    expect(pointsEqual(getPlayer(atG), level02.positions.markers.G)).toBe(true);
    expect(getTurn(atG)).toBe(7);
    expect(blocked.event).toBe('echo-gate-blocked');
    expect(blocked.gate).toEqual({ tile: 'H', ghostSwitch: 'C' });
    expect(blocked.moved).toBe(false);
    expect(blocked.state).toBe(corridor);
    expect(getTurn(blocked.state)).toBe(8);
    expect(blocked.state.path).toBe(corridor.path);
  });

  it('H 阻挡反馈明确告知玩家可以撤销或重新开始', () => {
    const corridor = follow([
      'down',
      'down',
      'right',
      'right',
      'down',
      'right',
      'up',
      'right',
    ]);
    const blocked = step(corridor, 'right', level02);
    const feedback = feedbackForEvent(blocked, blocked.state, level02);

    expect(feedback.message).toContain('撤销');
    expect(feedback.message).toContain('重新开始');
    expect(feedback.success).toBe(false);
  });

  it('撤销会恢复玩家位置、影子历史和胜负状态', () => {
    const completed = follow(level02.verifiedRoute);
    const restored = undo(completed);

    expect(restored.won).toBe(false);
    expect(getTurn(restored)).toBe(10);
    expect(getPlayer(restored)).toEqual({ x: 7, y: 3 });
    expect(getGhost(restored, level02)).toEqual({ x: 4, y: 3 });
    expect(restored.doorUnlockedAt).toBeNull();
  });

  it('求解器确认最短解为 11 步', () => {
    const solution = findShortestSolution(level02);

    expect(solution).not.toBeNull();
    expect(solution?.turns).toBe(11);
  });

  it('重开会恢复第二关所有初始状态', () => {
    const restarted = reset(level02);

    expect(restarted).toEqual(createInitialState(level02));
    expect(getTurn(restarted)).toBe(0);
    expect(getGhost(restarted, level02)).toBeNull();
    expect(restarted.won).toBe(false);
  });
});
