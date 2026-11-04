import './styles.css';
import { createInitialState, reset, step, undo } from './core/engine';
import { getTurn } from './core/rules';
import type { Direction, GameState } from './core/types';
import { getLevel, levels } from './levels';
import type { LevelDefinition } from './levels/schema';
import { bindGameControls } from './ui/controls';
import {
  collectGameElements,
  feedbackForEvent,
  initialFeedback,
  renderGame,
  resetHint,
  showFeedback,
  showHint,
} from './ui/render';
import { showGameScreen, showLevelSelect, showMainMenu } from './ui/screens';

function getAppRoot(): HTMLElement {
  const element = document.querySelector<HTMLElement>('#app');
  if (!element) throw new Error('找不到应用挂载节点。');
  return element;
}

const root = getAppRoot();

let removeGameControls: (() => void) | null = null;

function clearGameControls(): void {
  removeGameControls?.();
  removeGameControls = null;
}

function openMenu(): void {
  clearGameControls();
  showMainMenu(root, {
    onStart: () => startLevel(levels[0].id),
    onSelectLevel: openLevelSelect,
  });
}

function openLevelSelect(): void {
  clearGameControls();
  showLevelSelect(root, levels, {
    onBack: openMenu,
    onSelect: startLevel,
  });
}

function startLevel(levelId: string): void {
  const level = getLevel(levelId);
  if (!level) throw new Error(`未知关卡：${levelId}`);

  clearGameControls();
  showGameScreen(root, level, {
    onBackToMenu: openMenu,
    onBackToLevels: openLevelSelect,
  });
  mountLevel(level);
}

function mountLevel(level: LevelDefinition): void {
  const elements = collectGameElements(root);
  let state: GameState = createInitialState(level);
  let hintIndex = -1;

  const redraw = (): void => renderGame(elements, state, level);

  const move = (direction: Direction): void => {
    const result = step(state, direction, level);
    state = result.state;
    redraw();
    const feedback = feedbackForEvent(result.event, state, level);
    showFeedback(elements, feedback.message, feedback.success);
  };

  const undoMove = (): void => {
    if (getTurn(state) === 0 || state.won) return;
    state = undo(state);
    redraw();
    showFeedback(elements, '已撤销一步。观察紫色的下一拍预览，重新规划当前行动。');
  };

  const resetLevel = (): void => {
    state = reset(level);
    hintIndex = -1;
    redraw();
    resetHint(elements);
    showFeedback(elements, initialFeedback());
  };

  const revealHint = (): void => {
    hintIndex = Math.min(level.hints.length - 1, hintIndex + 1);
    showHint(elements, level, hintIndex);
  };

  redraw();
  showFeedback(elements, initialFeedback());
  removeGameControls = bindGameControls(root, {
    onMove: move,
    onUndo: undoMove,
    onReset: resetLevel,
    onHint: revealHint,
    onWait: () =>
      showFeedback(
        elements,
        '本关不能原地等待。时间只在移动时前进，你可以绕路来调整影子到达 A 的时机。',
      ),
    onWinRestart: resetLevel,
  });
}

openMenu();
