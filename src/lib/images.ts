import type { ImageMetadata } from 'astro';

const pick = (glob: Record<string, { default: ImageMetadata }>) =>
  Object.fromEntries(
    Object.entries(glob).map(([path, mod]) => [
      path
        .split('/')
        .pop()!
        .replace(/\.(jpg|png)$/, ''),
      mod.default,
    ]),
  ) as Record<string, ImageMetadata>;

export const patternImages = pick(import.meta.glob('../assets/patterns/*.jpg', { eager: true }));
export const environmentImages = pick(import.meta.glob('../assets/environments/*.jpg', { eager: true }));
export const closeupImages = pick(import.meta.glob('../assets/closeups/*.jpg', { eager: true }));
export const badgeImages = pick(import.meta.glob('../assets/badges/*.png', { eager: true }));
