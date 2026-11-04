import type { LevelDefinition } from '../levels/schema';

export interface MenuCallbacks {
  readonly onStart: () => void;
  readonly onSelectLevel: () => void;
}

export interface LevelSelectCallbacks {
  readonly onBack: () => void;
  readonly onSelect: (levelId: string) => void;
}

export interface GameScreenCallbacks {
  readonly onBackToMenu: () => void;
  readonly onBackToLevels: () => void;
}

function levelNumber(level: LevelDefinition): string {
  return String(level.number).padStart(2, '0');
}

function renderHud(level: LevelDefinition): string {
  const instantGates = level.mechanics.instantGates
    .map(
      (gate) =>
        `<span class="pill" data-gate-status="${gate.tile}">⌛ ${gate.tile} 门等待 ${gate.ghostSwitch}</span>`,
    )
    .join('');
  const persistentDoor = level.mechanics.persistentDoor
    ? '<span class="pill" data-door-status>🔒 出口门未开启</span>'
    : '';

  return `
    <span class="pill">关卡 <b>${levelNumber(level)}</b> · ${level.title}</span>
    <span class="pill">步数 <b id="turn">0</b></span>
    ${instantGates}
    ${persistentDoor}
  `;
}

function renderGuide(level: LevelDefinition): string {
  const steps = level.guide.steps
    .map(
      (step, index) =>
        `<div class="step"><span class="num">${index + 1}</span><span>${step}</span></div>`,
    )
    .join('');
  const legend = level.guide.legend
    .map(
      (item) =>
        `<div><i class="dot ${item.kind}"></i>${item.label}</div>`,
    )
    .join('');

  return `
    <h2>第${level.number}关：${level.title}</h2>
    ${steps}
    <div class="legend">${legend}</div>
    <div class="keyboard">
      <h3>${level.guide.detailTitle}</h3>
      <p>${level.guide.detail}</p>
    </div>
    <p class="small side-goal">${level.guide.goal}</p>
  `;
}

export function showMainMenu(root: HTMLElement, callbacks: MenuCallbacks): void {
  root.innerHTML = `
    <main class="app screen-shell">
      <div class="topline">
        <span class="eyebrow">ECHO / TIME PUZZLE</span>
        <span class="version">Vite + TypeScript</span>
      </div>
      <section class="panel menu-card" aria-labelledby="game-title">
        <p class="menu-kicker">单人行动 · 多时间线协作</p>
        <h1 id="game-title">三步后的<span>我</span></h1>
        <p class="menu-lead">你只能控制现在的自己。三步前的影子，会沿着你曾经走过的路准时出现。</p>
        <div class="menu-actions">
          <button class="primary menu-primary" id="start-game">开始游戏</button>
          <button id="select-level">关卡选择</button>
        </div>
        <p class="small menu-note">轻量级回合制空间解谜 · 每一步都可以慢慢思考</p>
      </section>
    </main>
  `;

  root.querySelector('#start-game')?.addEventListener('click', callbacks.onStart);
  root.querySelector('#select-level')?.addEventListener('click', callbacks.onSelectLevel);
}

export function showLevelSelect(
  root: HTMLElement,
  levels: readonly LevelDefinition[],
  callbacks: LevelSelectCallbacks,
): void {
  root.innerHTML = `
    <main class="app screen-shell">
      <div class="topline">
        <span class="eyebrow">LEVEL SELECT</span>
        <button class="quiet-button" id="back-menu">← 主菜单</button>
      </div>
      <section class="panel select-panel" aria-labelledby="select-title">
        <h1 id="select-title">选择<span>关卡</span></h1>
        <p class="desc">共 ${levels.length} 个经过自动化验证的时间分身谜题。</p>
        <div class="level-list">
          ${levels
            .map(
              (level) => `
                <button class="level-card" data-level-id="${level.id}">
                  <span class="level-number">${levelNumber(level)}</span>
                  <span class="level-copy">
                    <strong>${level.title}</strong>
                    <small>${level.tagline}</small>
                  </span>
                  <span class="level-arrow">→</span>
                </button>
              `,
            )
            .join('')}
        </div>
      </section>
    </main>
  `;

  root.querySelector('#back-menu')?.addEventListener('click', callbacks.onBack);
  root.querySelectorAll<HTMLElement>('[data-level-id]').forEach((button) => {
    button.addEventListener('click', () => {
      const levelId = button.dataset.levelId;
      if (levelId) callbacks.onSelect(levelId);
    });
  });
}

export function showGameScreen(
  root: HTMLElement,
  level: LevelDefinition,
  callbacks: GameScreenCallbacks,
): void {
  root.innerHTML = `
    <main class="app">
      <div class="topline game-topline">
        <span class="eyebrow">ECHO / PUZZLE ${levelNumber(level)}</span>
        <div class="screen-nav">
          <button class="quiet-button" id="game-levels">关卡选择</button>
          <button class="quiet-button" id="game-menu">主菜单</button>
        </div>
      </div>
      <h1>三步后的<span>我</span></h1>
      <p class="desc">${level.tagline}${level.description}</p>
      <div class="main">
        <section class="panel gamepanel" aria-label="游戏区域">
          <div class="hud">
            ${renderHud(level)}
          </div>
          <div class="board-wrap">
            <div id="board" class="board" role="grid"></div>
            <div id="win-overlay" class="win-overlay" aria-live="polite">
              <div class="win-card">
                <h2>✦ 时间同步成功！</h2>
                <p>${level.victoryText}<br />第 ${level.number} 关已完成，用了 <strong id="final-turns">0</strong> 步。</p>
                <div class="win-actions">
                  <button class="primary" id="win-restart">再玩一次 ↺</button>
                  <button id="win-levels">返回关卡选择</button>
                </div>
              </div>
            </div>
          </div>
          <p class="feedback" id="feedback" aria-live="polite"></p>
          <div class="timeline">
            <div class="timeline-title">时间轨迹 · 每走一步，影子执行 ${level.delay} 步前的站位</div>
            <div class="timecells">
              <div class="timecell ghostcell" id="ghost-state">影子：未出现</div>
              <span class="arr">→</span>
              <div class="timecell live" id="player-state">现在：—</div>
              <span class="arr">→</span>
              <div class="timecell" id="next-ghost">下一拍影子：—</div>
            </div>
          </div>
          <div class="control-row">
            <button id="undo" disabled>↶ 撤销上一步</button>
            <button id="reset">⟲ 重新开始</button>
            <button id="hint">💡 提示</button>
          </div>
          <div class="hint" id="hint-text"></div>
          <div class="dpad" aria-label="触控方向键">
            <button class="up" data-dir="up" aria-label="上">↑</button>
            <button class="left" data-dir="left" aria-label="左">←</button>
            <button class="wait" disabled title="本关不可等待，必须利用空间绕路">禁等</button>
            <button class="right" data-dir="right" aria-label="右">→</button>
            <button class="down" data-dir="down" aria-label="下">↓</button>
          </div>
          <p class="small control-help">键盘方向键 / WASD 移动 · Z 撤销 · R 重开 · 本关不可原地等待</p>
        </section>
        <aside class="panel instructions">
          ${renderGuide(level)}
        </aside>
      </div>
    </main>
  `;

  root.querySelector('#game-menu')?.addEventListener('click', callbacks.onBackToMenu);
  root.querySelector('#game-levels')?.addEventListener('click', callbacks.onBackToLevels);
  root.querySelector('#win-levels')?.addEventListener('click', callbacks.onBackToLevels);
}
