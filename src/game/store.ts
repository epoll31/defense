import { create } from "zustand";
import { Enemy, EnemyRemoveType, Grid, Weapon } from "./types";
import { getAngle } from "./utils/getAngle";
import { get } from "http";

export type WeaponSpawnState = "sphere" | null;
export interface GameState {
  grid: Grid;
  enemies: Enemy[];
  weapons: Weapon[];
  weaponSpawnState: WeaponSpawnState;
  selectedWeapon: string | null;
}

export interface GameActions {
  spawnEnemy: (position: [number, number]) => void;
  updateEnemy: (enemy: Enemy) => void;
  despawnEnemy: (id: string) => void;

  spawnWeapon: (position: [number, number, number]) => void;
  updateWeapon: (weapon: Weapon) => void;
  removeWeapon: (id: string) => void;

  setWeaponSpawnState: (state: WeaponSpawnState) => void;
  setSelectedWeapon: (id: string | null) => void;
}
export type GameStore = GameState & GameActions;

export const useGameStore = create<GameStore>()((set) => ({
  grid: {
    rows: 10,
    columns: 10,
    start: [0, 0],
    end: [9, 9],
  },
  enemies: [],
  weapons: [],
  weaponSpawnState: null,
  selectedWeapon: null,

  spawnEnemy: () =>
    set((state) => ({
      enemies: [
        ...state.enemies,
        {
          id: Date.now().toString(),
          position: [state.grid.start[0], 10, state.grid.start[1]],
          maxHealth: 20,
          health: 20,
          speed: 0.01,
          direction: getAngle(state.grid.start, state.grid.end),
          spawnedAt: Date.now(),
          state: "spawning",
        },
      ],
    })),
  despawnEnemy: (id: string) => {
    set((state) => ({
      enemies: state.enemies.filter((enemy) => enemy.id !== id),
    }));
  },
  removeEnemy: (id: string, type: EnemyRemoveType) =>
    set((state) => ({
      enemies: state.enemies.map((enemy) =>
        enemy.id === id ? { ...enemy, removed: type } : enemy
      ),
    })),
  updateEnemy: (update: Enemy) =>
    set((state) => ({
      enemies: state.enemies.map((enemy) =>
        enemy.id === update.id ? { ...enemy, ...update } : enemy
      ),
    })),

  spawnWeapon: (position: [number, number, number]) =>
    set((state) => ({
      weapons: [
        ...state.weapons,
        {
          id: Date.now().toString(),
          spawnTime: Date.now(),
          radius: 2,
          focusMode: "nearest",
          speed: 0.1,
          damage: 0.1,
          position,
          direction: getAngle(
            [position[0], position[2]] as [number, number],
            state.grid.end
          ),
        },
      ],
    })),
  updateWeapon: (update: Weapon) =>
    set((state) => ({
      weapons: state.weapons.map((weapon) =>
        weapon.id === update.id ? { ...weapon, ...update } : weapon
      ),
    })),
  removeWeapon: (id) =>
    set((state) => ({
      weapons: state.weapons.filter((weapon) => weapon.id !== id),
    })),

  setWeaponSpawnState: (state: WeaponSpawnState) =>
    set((prev) => ({
      ...prev,
      weaponSpawnState: state,
      selectedWeapon: state === null ? prev.selectedWeapon : null,
    })),
  setSelectedWeapon: (id: string | null) =>
    set((prev) => ({
      ...prev,
      selectedWeapon: id,
      weaponSpawnState: id === null ? prev.weaponSpawnState : null,
    })),
}));
