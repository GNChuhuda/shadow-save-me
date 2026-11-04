import type { Direction, Point } from '../core/types';

export interface LevelMechanics {
  readonly allowWait: boolean;
  readonly echoGate: {
    readonly tile: string;
    readonly ghostSwitch: string;
  };
  readonly exitDoor: {
    readonly tile: string;
    readonly ghostSwitch: string;
    readonly playerSwitch: string;
    readonly persistent: true;
  };
  readonly exit: {
    readonly tile: string;
  };
}

export interface LevelConfig {
  readonly id: string;
  readonly number: number;
  readonly title: string;
  readonly tagline: string;
  readonly description: string;
  readonly map: readonly string[];
  readonly delay: number;
  readonly hints: readonly string[];
  readonly verifiedRoute: readonly Direction[];
  readonly mechanics: LevelMechanics;
}

export interface LevelDefinition extends LevelConfig {
  readonly width: number;
  readonly height: number;
  readonly positions: {
    readonly start: Point;
    readonly ghostSwitch: Point;
    readonly playerSwitch: Point;
    readonly echoGate: Point;
    readonly exitDoor: Point;
    readonly exit: Point;
  };
}

const allowedTiles = new Set(['#', '.', 'S', 'A', 'B', 'G', 'D', 'E']);

function findUniqueTile(map: readonly string[], tile: string): Point {
  const matches: Point[] = [];

  map.forEach((row, y) => {
    [...row].forEach((cell, x) => {
      if (cell === tile) matches.push({ x, y });
    });
  });

  if (matches.length !== 1) {
    throw new Error(`关卡地图必须恰好包含一个 ${tile}，当前数量：${matches.length}`);
  }

  return matches[0];
}

export function defineLevel(config: LevelConfig): LevelDefinition {
  if (config.map.length === 0 || config.map[0].length === 0) {
    throw new Error('关卡地图不能为空。');
  }

  const width = config.map[0].length;
  if (config.map.some((row) => row.length !== width)) {
    throw new Error('关卡地图的每一行必须等宽。');
  }

  const unknownTile = config.map
    .flatMap((row) => [...row])
    .find((tile) => !allowedTiles.has(tile));
  if (unknownTile) {
    throw new Error(`关卡地图包含未知符号：${unknownTile}`);
  }

  if (!Number.isInteger(config.delay) || config.delay < 1) {
    throw new Error('影子延迟必须是正整数。');
  }

  return {
    ...config,
    map: [...config.map],
    width,
    height: config.map.length,
    positions: {
      start: findUniqueTile(config.map, 'S'),
      ghostSwitch: findUniqueTile(config.map, config.mechanics.echoGate.ghostSwitch),
      playerSwitch: findUniqueTile(config.map, config.mechanics.exitDoor.playerSwitch),
      echoGate: findUniqueTile(config.map, config.mechanics.echoGate.tile),
      exitDoor: findUniqueTile(config.map, config.mechanics.exitDoor.tile),
      exit: findUniqueTile(config.map, config.mechanics.exit.tile),
    },
  };
}
