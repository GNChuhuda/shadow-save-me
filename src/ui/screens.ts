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
        <p class="desc">当前开发轮次只包含经过验证的第一关。</p>
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
            <span class="pill">关卡 <b>${levelNumber(level)}</b> · ${level.title}</span>
            <span class="pill">步数 <b id="turn">0</b></span>
            <span class="pill" id="echo-label">⌛ 回声门未就绪</span>
            <span class="pill" id="gate-label">🔒 出口门未开启</span>
          </div>
          <div class="board-wrap">
            <div id="board" class="board" role="grid"></div>
            <div id="win-overlay" class="win-overlay" aria-live="polite">
              <div class="win-card">
                <h2>✦ 时间同步成功！</h2>
                <p>你主动绕了一个小圈，才让过去的自己赶上正确时机。<br />第一关已完成，用了 <strong id="final-turns">0</strong> 步。</p>
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
          <h2>第一关：${level.title}</h2>
          <div class="step"><span class="num">1</span><span>每移动一步，影子就会重演你<b>${level.delay} 步前的位置</b>。它不能被直接控制。</span></div>
          <div class="step"><span class="num">2</span><span><b class="echo-text">回声门 G</b>只有在你进入它的那一拍，影子刚好踩在 <b class="a-text">A</b> 才能穿过。本关<b>不允许原地等待</b>，需要绕路对齐时间。</span></div>
          <div class="step"><span class="num">3</span><span>穿过 G 后，还要让影子站在 <b class="a-text">A</b>，你同时抵达 <b class="b-text">B</b>，才会永久打开右侧的出口门 D。随后到达<b>出口 ✦</b>。</span></div>
          <div class="legend">
            <div><i class="dot player"></i>当前的你</div>
            <div><i class="dot ghost"></i>过去的你</div>
            <div><i class="dot a"></i>影子开关 A</div>
            <div><i class="dot b"></i>玩家开关 B</div>
          </div>
          <div class="keyboard">
            <h3>一个重要细节</h3>
            <p>“三步”是行动步数，不是三秒。你可以无限思考，但本关时间只会在<b>真正走了一格</b>后前进。直接冲门会失败；撞墙不会消耗步数。棋盘上的紫色虚线圈表示影子下一步将出现的位置。</p>
          </div>
          <p class="small side-goal">小目标：尝试找到最短路线。求解器验证过，本关存在 11 步通关的路径。</p>
        </aside>
      </div>
    </main>
  `;

  root.querySelector('#game-menu')?.addEventListener('click', callbacks.onBackToMenu);
  root.querySelector('#game-levels')?.addEventListener('click', callbacks.onBackToLevels);
  root.querySelector('#win-levels')?.addEventListener('click', callbacks.onBackToLevels);
}
