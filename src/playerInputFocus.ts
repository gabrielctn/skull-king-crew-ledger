export interface PlayerInputHandle {
  focus: () => void;
}

/** Focus one mounted player-name input and keep Setup's focused row in sync. */
export function focusPlayerInput(
  id: string,
  inputs: Readonly<
    Record<string, PlayerInputHandle | null | undefined>
  >,
  onFocused: (id: string) => void
): boolean {
  const input = inputs[id];
  if (!input) return false;
  onFocused(id);
  input.focus();
  return true;
}
