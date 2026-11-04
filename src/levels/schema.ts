import type { Direction, Point } from '../core/types';

export interface InstantGateConfig {
  readonly tile: string;
  readonly ghostSwitch: string;
  readonly blockedMessage: string;
  readonly passedMessage: string;
}

export interface GuideLegendItem {
  readonly kind: 'player' | 'ghost' | 'a' | 'b' | 'c';
  readonly label: string;
}

export interface LevelGuide {
  readonly steps: readonly string[];
  readonly legend: readonly GuideLegendItem[];
  readonly detailTitle: string;
  readonly detail: string;
  readonly goal: string;
}

export interface LevelMechanics {
  readonly allowWait: boolean;
  readonly instantGates: readonly InstantGateConfig[];
  readonly persistentDoor?: {
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
  readonly initialFeedback: string;
  readonly victoryText: string;
  readonly guide: LevelGuide;
  readonly hints: readonly string[];
  readonly verifiedRoute: readonly Direction[];
  readonly mechanics: LevelMechanics;
}

export interface LevelDefinition extends LevelConfig {
  readonly width: number;
  readonly height: number;
  readonly positions: {
    readonly start: Point;
    readonly exit: Point;
    readonly markers: Readonly<Record<string, Point>>;
  };
}

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

  if (config.mechanics.instantGates.length === 0) {
    throw new Error('关卡至少需要配置一道瞬时回声门。');
  }

  const markerTiles = new Set([
    'S',
    config.mechanics.exit.tile,
    ...config.mechanics.instantGates.flatMap((gate) => [gate.tile, gate.ghostSwitch]),
    ...(config.mechanics.persistentDoor
      ? [
          config.mechanics.persistentDoor.tile,
          config.mechanics.persistentDoor.ghostSwitch,
          config.mechanics.persistentDoor.playerSwitch,
        ]
      : []),
  ]);
  const allowedTiles = new Set(['#', '.', ...markerTiles]);
  const unknownTile = config.map
    .flatMap((row) => [...row])
    .find((tile) => !allowedTiles.has(tile));
  if (unknownTile) {
    throw new Error(`关卡地图包含未知符号：${unknownTile}`);
  }

  if (!Number.isInteger(config.delay) || config.delay < 1) {
    throw new Error('影子延迟必须是正整数。');
  }

  const markers = Object.fromEntries(
    [...markerTiles].map((tile) => [tile, findUniqueTile(config.map, tile)]),
  );

  return {
    ...config,
    map: [...config.map],
    width,
    height: config.map.length,
    positions: {
      start: markers.S,
      exit: markers[config.mechanics.exit.tile],
      markers,
    },
  };
}
