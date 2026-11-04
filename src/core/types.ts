export type Direction = 'up' | 'down' | 'left' | 'right';

export interface Point {
  readonly x: number;
  readonly y: number;
}

export interface GameState {
  readonly levelId: string;
  readonly path: readonly Point[];
  readonly doorUnlockedAt: number | null;
  readonly won: boolean;
}

export type MoveEvent =
  | 'already-won'
  | 'wall-blocked'
  | 'echo-gate-blocked'
  | 'exit-door-blocked'
  | 'moved'
  | 'echo-gate-passed'
  | 'door-unlocked'
  | 'ghost-appeared'
  | 'standing-on-a'
  | 'standing-on-b-without-ghost'
  | 'won';

export interface StepResult {
  readonly state: GameState;
  readonly moved: boolean;
  readonly event: MoveEvent;
}
