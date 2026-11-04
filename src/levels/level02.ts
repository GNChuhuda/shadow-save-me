import { defineLevel } from './schema';

export const level02 = defineLevel({
  id: 'level02',
  number: 2,
  title: '交错的脚步',
  tagline: '两道门紧挨在一起，真正要对齐的是一串脚步。',
  description: '当你连续跨过 G → H，影子也必须同步连续重演 A → C。',
  map: [
    '###########',
    '#S..###...#',
    '#..C.##...#',
    '#..AGH..E.#',
    '#....##...#',
    '#...###...#',
    '###########',
  ],
  delay: 3,
  initialFeedback:
    'G 与 H 紧挨在一起：进入 G 时影子要在 A，紧接着进入 H 时影子要在 C。你需要提前写好一段连续的历史脚步。',
  victoryText: '你让现在的 G → H 与过去的 A → C 同步重叠，完成了一次连续轨迹对齐。',
  guide: {
    steps: [
      '每次有效移动推进一拍，影子重演你<b>三步前的位置</b>；撞墙或关闭的门不计步。',
      '进入 <b class="echo-text">G</b> 的那一拍，影子必须在 <b class="a-text">A</b>；进入 <b class="h-text">H</b> 的那一拍，影子必须在 <b class="c-text">C</b>。',
      'G 与 H 必须连续穿过，因此影子也要连续重演 A → C。A 旁边的上下两条等长路线都能打开 G，但记录下的<b>历史顺序不同</b>。',
    ],
    legend: [
      { kind: 'player', label: '当前的你' },
      { kind: 'ghost', label: '过去的你' },
      { kind: 'a', label: 'G 对应开关 A' },
      { kind: 'c', label: 'H 对应开关 C' },
    ],
    detailTitle: '从位置升级到序列',
    detail:
      '第一关只需要让一个历史位置与门对齐；这一关要让两个连续位置同时对齐。通过 G 只验证了序列的第一格，下一步 H 会立刻验证第二格。',
    goal: '小目标：让当前的 G → H 与影子的 A → C 同步发生。求解器验证最短通关路线为 11 步。',
  },
  mechanics: {
    allowWait: false,
    instantGates: [
      {
        tile: 'G',
        ghostSwitch: 'A',
        blockedMessage:
          '⌛ G 门拒绝通行：这一步结束时，影子必须恰好位于 A。受阻不会计步，观察岔路后再试。',
        passedMessage:
          '✦ 已穿过 G！这是连续序列的第一格；下一步进入 H 时，影子必须立刻从 A 走到 C。',
      },
      {
        tile: 'H',
        ghostSwitch: 'C',
        blockedMessage:
          '⌛ H 门拒绝通行：影子虽然刚才在 A 打开了 G，却没有在下一拍走到 C。此步未计入回合；请撤销到 G 前改走另一条岔路，或重新开始。',
        passedMessage: '✦ 连续对齐成功！你走过 G → H 的同时，影子重演了 A → C。',
      },
    ],
    exit: {
      tile: 'E',
    },
  },
  hints: [
    '提示 1 / 3：G 和 H 紧挨着。你连续进入它们时，影子也需要连续站在两个对应开关上。',
    '提示 2 / 3：把现在的 G → H 与三步前的 A → C 看成两段需要重合的轨迹；哪条岔路能写下 A → C？',
    '提示 3 / 3：先到 A，下一步立刻经过 C，再绕到 G 并连续进入 H。完整操作：↓ ↓ → → ↑ → ↓ → → → →。',
  ],
  verifiedRoute: [
    'down',
    'down',
    'right',
    'right',
    'up',
    'right',
    'down',
    'right',
    'right',
    'right',
    'right',
  ],
});
