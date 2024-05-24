export interface Enemy {
  id: string;
  position: [number, number];
  health: number;
  speed: number;
  direction: number;
}

export interface Weapon {
  id: string;
  position: [number, number];
  radius: number;
}

export interface Grid {
  rows: number;
  columns: number;
  start: [number, number];
  end: [number, number];
}
