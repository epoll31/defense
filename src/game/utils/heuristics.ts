import { Enemy, Weapon, WeaponFocusMode } from "../types";

export type Heuristic = (enemy: Enemy, weapon: Weapon) => number;

export function oldestHeuristic(enemy: Enemy, weapon: Weapon) {
  return enemy.spawnedAt.valueOf();
}
export function youngestHeuristic(enemy: Enemy, weapon: Weapon) {
  return -enemy.spawnedAt.valueOf();
}
export function nearestHeuristic(enemy: Enemy, weapon: Weapon) {
  return Math.hypot(
    enemy.position[0] - weapon.position[0],
    enemy.position[2] - weapon.position[2]
  );
}
export function weakestHeuristic(enemy: Enemy, weapon: Weapon) {
  return enemy.health;
}
export function strongestHeuristic(enemy: Enemy, weapon: Weapon) {
  return -enemy.health;
}

export function getHeuristic(mode: WeaponFocusMode) {
  switch (mode) {
    case "nearest":
      return nearestHeuristic;
    case "oldest":
      return oldestHeuristic;
    case "youngest":
      return youngestHeuristic;
    case "weakest":
      return weakestHeuristic;
    case "strongest":
      return strongestHeuristic;
  }
}
