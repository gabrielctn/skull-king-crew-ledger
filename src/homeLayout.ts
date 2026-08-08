export const HOME_ACTIONS_HEIGHT = 52;
export const HOME_ACTIONS_TOP = 16;

interface HomeLayoutInput {
  isWeb: boolean;
  hasContent: boolean;
}

interface HeroSizeInput {
  isDesktop: boolean;
  hasContent: boolean;
}

export interface HomeHeroSize {
  emblem: number;
  skull: number;
  height: number;
}

/**
 * Leaves the safe-area-aware action overlay clear while keeping the scroll
 * content continuous beneath it on every platform.
 */
export function homeTopInset({ hasContent }: HomeLayoutInput): number {
  return HOME_ACTIONS_TOP + HOME_ACTIONS_HEIGHT + (hasContent ? 16 : 8);
}

/** A compact seal keeps returning crews oriented without wasting phone space. */
export function homeHeroSize({ isDesktop, hasContent }: HeroSizeInput): HomeHeroSize {
  if (isDesktop) return { emblem: 216, skull: 165, height: 204 };
  if (hasContent) return { emblem: 142, skull: 112, height: 132 };
  return { emblem: 188, skull: 145, height: 176 };
}
