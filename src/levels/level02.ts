import { defineLevel } from './schema';

export const level02 = defineLevel({
  id: 'level02',
  number: 2,
  title: '交错的脚步',
  tagline: '两条同样长的路，都能打开眼前的门。',
  description: '但只有提前安排好整段历史，过去的你才能继续打开第二道门。',
  map: [
    '###########',
    '#S..###...#',
    '#...C##...#',
    '#..AG.H.E.#',
    '#....##...#',
    '#...###...#',
    '###########',
  ],
  delay: 3,
  initialFeedback:
    'G 和 H 都只在你进入的那一拍检查影子。两条路都能穿过 G，但你必须提前为 H 安排好影子的历史位置。',
  victoryText: '你没有只顾眼前的门，而是提前安排好了两段交错的历史脚步。',
  guide: {
    steps: [
      '每次有效移动推进一拍，影子重演你<b>三步前的位置</b>；撞墙或关闭的门不计步。',
      '进入 <b class="echo-text">G</b> 的那一拍，影子必须在 <b class="a-text">A</b>；进入 <b class="h-text">H</b> 的那一拍，影子必须在 <b class="c-text">C</b>。',
      'A 旁边的上下两条路都能让你通过 G，但只有一条会把正确的历史位置留给 H。两扇门都<b>不会永久开启</b>。',
    ],
    legend: [
      { kind: 'player', label: '当前的你' },
      { kind: 'ghost', label: '过去的你' },
      { kind: 'a', label: 'G 对应开关 A' },
      { kind: 'c', label: 'H 对应开关 C' },
    ],
    detailTitle: '别只看眼前',
    detail:
      '通过 G 并不代表路线正确。进入 H 时，影子会回放你进入 G 前的历史格子。受阻的移动不会推进时间，可以撤销到岔路重新规划。',
    goal: '小目标：让同一段历史先后满足 G→A 与 H→C。求解器验证最短通关路线为 11 步。',
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
          '✦ 已穿过 G！第一段时间对齐成功，但 H 还会检查另一段历史，别急着向前。',
      },
      {
        tile: 'H',
        ghostSwitch: 'C',
        blockedMessage:
          '⌛ H 门拒绝通行：这一拍影子没有站在 C。此步未计入回合；请撤销到 G 前改走另一条岔路，或重新开始。',
        passedMessage: '✦ 已穿过 H！影子准时回到了 C，前往出口完成同步。',
      },
    ],
    exit: {
      tile: 'E',
    },
  },
  hints: [
    '提示 1 / 3：两道门都只在进入它们的那一拍检查影子的位置。别只关注第一道门。',
    '提示 2 / 3：即使两条路都能让你通过 G，影子三步后所站的位置也不一样；试着观察 A 旁边的上下岔路以及 C。',
    '提示 3 / 3：先到 A，再走上方经过 C，随后穿过 G、H。完整操作：↓ ↓ → → ↑ → ↓ → → → →。',
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
