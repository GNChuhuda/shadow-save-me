import type { LevelDefinition } from '../levels/schema';
import {
  getGhost,
  getNextGhost,
  getPlayer,
  getTurn,
  isEchoGateReady,
  isExitDoorOpen,
  pointsEqual,
} from '../core/rules';
import type { GameState, MoveEvent, Point } from '../core/types';

export interface GameElements {
  readonly board: HTMLElement;
  readonly turn: HTMLElement;
  readonly echoLabel: HTMLElement;
  readonly gateLabel: HTMLElement;
  readonly undoButton: HTMLButtonElement;
  readonly feedback: HTMLElement;
  readonly ghostState: HTMLElement;
  readonly playerState: HTMLElement;
  readonly nextGhost: HTMLElement;
  readonly winOverlay: HTMLElement;
  readonly finalTurns: HTMLElement;
  readonly hintText: HTMLElement;
  readonly hintButton: HTMLButtonElement;
}

function required<T extends Element>(root: ParentNode, selector: string): T {
  const element = root.querySelector<T>(selector);
  if (!element) throw new Error(`缺少界面元素：${selector}`);
  return element;
}

export function collectGameElements(root: ParentNode): GameElements {
  return {
    board: required(root, '#board'),
    turn: required(root, '#turn'),
    echoLabel: required(root, '#echo-label'),
    gateLabel: required(root, '#gate-label'),
    undoButton: required(root, '#undo'),
    feedback: required(root, '#feedback'),
    ghostState: required(root, '#ghost-state'),
    playerState: required(root, '#player-state'),
    nextGhost: required(root, '#next-ghost'),
    winOverlay: required(root, '#win-overlay'),
    finalTurns: required(root, '#final-turns'),
    hintText: required(root, '#hint-text'),
    hintButton: required(root, '#hint'),
  };
}

function createActor(kind: 'player' | 'ghost', both: boolean): HTMLElement {
  const actor = document.createElement('div');
  actor.className = `actor ${kind}${both ? ' both' : ''}`;
  actor.textContent = kind === 'player' ? '我' : '影';
  return actor;
}

function createTile(
  cell: string,
  point: Point,
  state: GameState,
  level: LevelDefinition,
): HTMLElement {
  const player = getPlayer(state);
  const ghost = getGhost(state, level);
  const preview = getNextGhost(state, level);
  const echoReady = isEchoGateReady(state, level);
  const doorOpen = isExitDoorOpen(state);
  const tile = document.createElement('div');
  const classes = ['tile'];

  if (cell === '#') classes.push('wall');
  if (cell === 'A') classes.push('switch-a');
  if (cell === 'B') classes.push('switch-b');
  if (cell === level.mechanics.echoGate.tile) {
    classes.push('echo-gate');
    if (echoReady) classes.push('ready');
  }
  if (cell === level.mechanics.exitDoor.tile) {
    classes.push('door');
    if (doorOpen) classes.push('opened');
  }
  if (cell === level.mechanics.exit.tile) classes.push('exit');
  tile.className = classes.join(' ');
  tile.setAttribute('role', 'gridcell');

  if (cell === 'A' || cell === 'B') {
    const label = document.createElement('span');
    label.className = 'tile-label';
    label.textContent = cell;
    tile.append(label);
  }

  if (
    cell === level.mechanics.echoGate.tile ||
    cell === level.mechanics.exitDoor.tile ||
    cell === level.mechanics.exit.tile
  ) {
    const symbol = document.createElement('span');
    symbol.className = 'symbol';
    symbol.textContent =
      cell === level.mechanics.echoGate.tile
        ? echoReady
          ? '◈'
          : '⌛'
        : cell === level.mechanics.exitDoor.tile
          ? doorOpen
            ? '◈'
            : '▥'
          : '✦';
    tile.append(symbol);
  }

  if (preview && pointsEqual(preview, point) && !pointsEqual(ghost, point)) {
    const ring = document.createElement('div');
    ring.className = 'preview';
    ring.title = '下回合影子会到这里';
    tile.append(ring);
  }

  const both = pointsEqual(player, point) && pointsEqual(ghost, point);
  if (pointsEqual(ghost, point)) tile.append(createActor('ghost', both));
  if (pointsEqual(player, point)) tile.append(createActor('player', both));

  return tile;
}

export function renderGame(
  elements: GameElements,
  state: GameState,
  level: LevelDefinition,
): void {
  const turn = getTurn(state);
  const player = getPlayer(state);
  const ghost = getGhost(state, level);
  const nextGhost = getNextGhost(state, level);
  const echoReady = isEchoGateReady(state, level);
  const doorOpen = isExitDoorOpen(state);

  elements.turn.textContent = String(turn);
  elements.gateLabel.textContent = doorOpen ? '✓ 出口门已解锁' : '🔒 出口门未开启';
  elements.gateLabel.className = `pill${doorOpen ? ' open' : ''}`;
  elements.echoLabel.textContent = echoReady ? '✦ 下一步可穿过回声门' : '⌛ 回声门等待影子';
  elements.echoLabel.className = `pill${echoReady ? ' open' : ''}`;
  elements.undoButton.disabled = turn === 0 || state.won;
  elements.ghostState.textContent = ghost
    ? `影子：(${ghost.x},${ghost.y})`
    : '影子：尚未出现';
  elements.playerState.textContent = `现在：(${player.x},${player.y})`;
  elements.nextGhost.textContent = nextGhost
    ? `下一拍影子：(${nextGhost.x},${nextGhost.y})`
    : '下一拍影子：未出现';

  elements.board.style.gridTemplateColumns = `repeat(${level.width}, minmax(0, 1fr))`;
  elements.board.style.aspectRatio = `${level.width} / ${level.height}`;
  elements.board.setAttribute('aria-label', `${level.width}列${level.height}行迷宫棋盘`);
  elements.board.replaceChildren();

  level.map.forEach((row, y) => {
    [...row].forEach((cell, x) => {
      elements.board.append(createTile(cell, { x, y }, state, level));
    });
  });

  elements.winOverlay.classList.toggle('show', state.won);
  if (state.won) elements.finalTurns.textContent = String(turn);
}

export function showFeedback(
  elements: GameElements,
  message: string,
  success = false,
): void {
  elements.feedback.textContent = message;
  elements.feedback.className = `feedback${success ? ' success' : ''}`;
}

export function initialFeedback(): string {
  return '直接从 A 冲向 B 行不通：途中有一道回声门。想办法让影子在你进入回声门的那一拍踩上 A。';
}

export function feedbackForEvent(
  event: MoveEvent,
  state: GameState,
  level: LevelDefinition,
): { readonly message: string; readonly success: boolean } {
  switch (event) {
    case 'already-won':
      return { message: '第一关已经完成。可以再玩一次，或返回关卡选择。', success: true };
    case 'wall-blocked':
      return { message: '前面是墙壁。换一条路线，想想怎样用空间绕路来调整影子的时间。', success: false };
    case 'echo-gate-blocked':
      return { message: '⌛ 回声门没有开启！你下一步移动后，影子必须恰好踩在 A 才能通过。回头观察一下左边的岔路。', success: false };
    case 'exit-door-blocked':
      return { message: '出口门还锁着：只有影子在 A、你站在 B 的同一回合，它才会永久开启。', success: false };
    case 'door-unlocked':
      return { message: '✦ 双线同步成功！影子在 A，你在 B，出口门 D 已永久解锁！', success: true };
    case 'won':
      return { message: `通关！共走了 ${getTurn(state)} 步。你成功用绕路控制了过去自己的到达时机。`, success: true };
    case 'echo-gate-passed':
      return { message: '✦ 成功穿过回声门！这时影子正踩在 A。接下来要让自己在恰当的时刻抵达 B。', success: true };
    case 'ghost-appeared':
      return { message: '影子出现了！紫色虚线圈是影子下一步的位置。它每一拍都在复现你三步前的站位。', success: false };
    case 'standing-on-a':
      return { message: '你站到了 A。直接向右冲门时，影子不一定已到 A；试试通过走动来让两条时间线对齐。', success: false };
    case 'standing-on-b-without-ghost':
      return { message: '你在 B，但影子没在 A。需要让两个位置在同一回合满足条件。', success: false };
    case 'moved':
      return {
        message: `第 ${getTurn(state)} 步：${
          isEchoGateReady(state, level)
            ? '提示：下一步影子将踩住 A，回声门可以通过。'
            : '请留意影子的下一步位置，提前设计空间路线。'
        }`,
        success: false,
      };
  }
}

export function showHint(
  elements: GameElements,
  level: LevelDefinition,
  hintIndex: number,
): void {
  elements.hintText.textContent = level.hints[hintIndex];
  elements.hintText.classList.add('show');
  elements.hintButton.textContent =
    hintIndex === level.hints.length - 1 ? '已显示完整提示' : '💡 下一条提示';
}

export function resetHint(elements: GameElements): void {
  elements.hintText.textContent = '';
  elements.hintText.classList.remove('show');
  elements.hintButton.textContent = '💡 提示';
}
