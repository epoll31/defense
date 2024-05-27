import { Heuristic, getHeuristic } from "../utils/heuristics";
import { Enemy, Weapon } from "../types";

export function findTarget(
  weapon: Weapon,
  enemies: Enemy[],
  heuristic?: Heuristic
): Enemy | null {
  const trueHeuristic = heuristic || getHeuristic(weapon.focusMode);

  let min = Infinity;
  let target: Enemy | null = null;
  enemies.forEach((enemy) => {
    if (enemy.state !== "moving") {
      return;
    }

    const dist = Math.hypot(
      enemy.position[0] - weapon.position[0],
      enemy.position[2] - weapon.position[2]
    );
    if (dist > weapon.radius) {
      return;
    }

    const h = trueHeuristic(enemy, weapon);
    if (h < min) {
      min = h;
      target = enemy;
    }
  });
  return target;
}
