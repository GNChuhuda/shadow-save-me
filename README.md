# 三步后的我

《三步后的我》是一款以“单人行动、多时间线协作”为核心的轻量级回合制空间解谜游戏。本仓库将第一关 V2 单文件原型重构为 Vite + TypeScript + 原生 DOM/CSS 工程。

当前开发轮次只包含第一关“回声狭门”，没有添加第二关或新机制。原始文件 `three_steps_behind_me_level1_v2.html` 保留为行为与视觉回归基准。

## 在线游玩

[打开 GitHub Pages 在线版本](https://gnchuhuda.github.io/shadow-save-me/)

每次向 `main` 分支推送通过测试的版本后，GitHub Actions 会自动测试、构建并更新在线游戏。

## 本地运行

需要 Node.js 20.19+ 或 22.12+。

```bash
npm install
npm run dev
```

Vite 启动后会在终端显示本地地址，通常是 `http://localhost:5173/`。

## 验证命令

```bash
npm test
npm run build
```

- `npm test`：运行 Vitest 规则与求解器测试。
- `npm run build`：先做 TypeScript 严格类型检查，再生成 `dist/` 生产文件。
- `npm run test:watch`：开发时持续运行测试。

## 项目结构

```text
src/
├─ main.ts                 # 页面流程和游戏会话编排
├─ styles.css              # 原 V2 视觉样式与菜单样式
├─ core/
│  ├─ types.ts             # 引擎状态和事件类型
│  ├─ rules.ts             # 影子、门和通行时序判定
│  ├─ engine.ts            # 纯逻辑 step / undo / reset
│  └─ solver.ts            # BFS 最短路线验证
├─ levels/
│  ├─ schema.ts            # 数据驱动关卡定义与校验
│  ├─ level01.ts           # 第一关地图、机制、提示和验证路线
│  └─ index.ts             # 关卡注册表
└─ ui/
   ├─ render.ts            # 棋盘、HUD、轨迹与反馈渲染
   ├─ controls.ts          # 键盘与触屏输入
   └─ screens.ts           # 主菜单、关卡选择和游戏页面
tests/
└─ level01.test.ts         # 第一关自动化回归测试
```

## 第一关规则基准

- 11×7 地图内容与原 V2 完全一致。
- 只有合法移动才推进回合；撞墙或关闭的门不计步。
- 影子从第 3 回合开始显示玩家 3 步前的位置。
- 进入 G 的该回合结束后，影子必须恰好位于 A。
- 影子在 A 且玩家在 B 的同一回合永久解锁 D。
- 本关禁止等待；空格只显示说明，不推进回合。
- 经过验证的 11 步路线为：`↓ ↓ → ↑ ↓ → → → → → →`。

自动化测试覆盖失败移动、G 门时序、D 门解锁、撤销、11 步通关、最短解和重开复位。
