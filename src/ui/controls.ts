import type { Direction } from '../core/types';

export interface ControlHandlers {
  readonly onMove: (direction: Direction) => void;
  readonly onUndo: () => void;
  readonly onReset: () => void;
  readonly onHint: () => void;
  readonly onWait: () => void;
  readonly onWinRestart: () => void;
}

const keyDirections: Readonly<Record<string, Direction>> = {
  arrowup: 'up',
  w: 'up',
  arrowdown: 'down',
  s: 'down',
  arrowleft: 'left',
  a: 'left',
  arrowright: 'right',
  d: 'right',
};

export function bindGameControls(
  root: ParentNode,
  handlers: ControlHandlers,
): () => void {
  const abortController = new AbortController();
  const options = { signal: abortController.signal };

  root.querySelectorAll<HTMLElement>('[data-dir]').forEach((button) => {
    button.addEventListener(
      'click',
      () => {
        const direction = button.dataset.dir as Direction | undefined;
        if (direction) handlers.onMove(direction);
      },
      options,
    );
  });

  root.querySelector('#undo')?.addEventListener('click', handlers.onUndo, options);
  root.querySelector('#reset')?.addEventListener('click', handlers.onReset, options);
  root.querySelector('#hint')?.addEventListener('click', handlers.onHint, options);
  root.querySelector('#win-restart')?.addEventListener('click', handlers.onWinRestart, options);

  document.addEventListener(
    'keydown',
    (event) => {
      const key = event.key.toLowerCase();
      const direction = keyDirections[key];
      if (direction) {
        event.preventDefault();
        handlers.onMove(direction);
        return;
      }
      if (key === ' ') {
        event.preventDefault();
        handlers.onWait();
        return;
      }
      if (key === 'z') {
        event.preventDefault();
        handlers.onUndo();
        return;
      }
      if (key === 'r') {
        event.preventDefault();
        handlers.onReset();
      }
    },
    options,
  );

  return () => abortController.abort();
}
