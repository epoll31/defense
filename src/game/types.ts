export type EnemyRemoveType = "fly" | "explode";
export type EnemyState = "spawning" | "moving" | "despawning";
export interface Enemy {
  id: string;
  position: [number, number, number];
  maxHealth: number;
  health: number;
  speed: number;
  direction: number;
  spawnedAt: number;
  state: EnemyState;
}

export const WeaponFocusModes = [
  "nearest",
  "oldest",
  "youngest",
  "weakest",
  "strongest",
] as const;
export type WeaponFocusMode = (typeof WeaponFocusModes)[number];
export interface Weapon {
  id: string;
  radius: number;
  focusMode: WeaponFocusMode;
  speed: number;
  damage: number;
  position: [number, number, number];
  direction: number;
}

export interface Grid {
  rows: number;
  columns: number;
  start: [number, number];
  end: [number, number];
}
