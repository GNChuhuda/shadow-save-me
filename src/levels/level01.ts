import { defineLevel } from './schema';

export const level01 = defineLevel({
  id: 'level01',
  number: 1,
  title: '回声狭门',
  tagline: '一条看似笔直的路，却被过去的自己挡住。',
  description:
    '只有绕一小段路，才能让三步前的影子替你打开回声门。',
  map: [
    '###########',
    '#S.#..#...#',
    '#..#..#...#',
    '#.AG.BD.E.#',
    '#..#..#...#',
    '#..#..#...#',
    '###########',
  ],
  delay: 3,
  initialFeedback:
    '直接从 A 冲向 B 行不通：途中有一道回声门。想办法让影子在你进入回声门的那一拍踩上 A。',
  victoryText: '你主动绕了一个小圈，才让过去的自己赶上正确时机。',
  guide: {
    steps: [
      '每移动一步，影子就会重演你<b>三步前的位置</b>。它不能被直接控制。',
      '<b class="echo-text">回声门 G</b>只有在你进入它的那一拍，影子刚好踩在 <b class="a-text">A</b> 才能穿过。本关<b>不允许原地等待</b>，需要绕路对齐时间。',
      '穿过 G 后，还要让影子站在 <b class="a-text">A</b>，你同时抵达 <b class="b-text">B</b>，才会永久打开右侧的出口门 D。随后到达<b>出口 ✦</b>。',
    ],
    legend: [
      { kind: 'player', label: '当前的你' },
      { kind: 'ghost', label: '过去的你' },
      { kind: 'a', label: '影子开关 A' },
      { kind: 'b', label: '玩家开关 B' },
    ],
    detailTitle: '一个重要细节',
    detail:
      '“三步”是行动步数，不是三秒。你可以无限思考，但本关时间只会在<b>真正走了一格</b>后前进。直接冲门会失败；撞墙不会消耗步数。棋盘上的紫色虚线圈表示影子下一步将出现的位置。',
    goal: '小目标：尝试找到最短路线。求解器验证过，本关存在 11 步通关的路径。',
  },
  mechanics: {
    allowWait: false,
    instantGates: [
      {
        tile: 'G',
        ghostSwitch: 'A',
        blockedMessage:
          '⌛ 回声门没有开启！你下一步移动后，影子必须恰好踩在 A 才能通过。回头观察一下左边的岔路。',
        passedMessage:
          '✦ 成功穿过回声门！这时影子正踩在 A。接下来要让自己在恰当的时刻抵达 B。',
      },
    ],
    persistentDoor: {
      tile: 'D',
      ghostSwitch: 'A',
      playerSwitch: 'B',
      persistent: true,
    },
    exit: {
      tile: 'E',
    },
  },
  hints: [
    '提示 1 / 3：要进 G，影子必须刚好在那一回合踩住 A。直接从 A 向右走，时间对不上。',
    '提示 2 / 3：本关不能原地等待。到达 A 后，不妨先走到旁边一格，再回到 A，然后尝试进 G。',
    '提示 3 / 3：一条 11 步的完整路线：↓ ↓ → ↑ ↓ → → → → → →。其中到 A 之后的“↑ ↓”就是关键空间绕路。',
  ],
  verifiedRoute: [
    'down',
    'down',
    'right',
    'up',
    'down',
    'right',
    'right',
    'right',
    'right',
    'right',
    'right',
  ],
});
