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
  mechanics: {
    allowWait: false,
    echoGate: {
      tile: 'G',
      ghostSwitch: 'A',
    },
    exitDoor: {
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
