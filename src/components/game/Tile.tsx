import React, { useCallback } from "react";
import { useGameStore } from "@/game/store";
import { positionEquals } from "@/game/utils/positionEquals";
import { checkPaths } from "@/game/utils/pathfinding";
import TileModel from "./models/TileModel";
import { ThreeEvent } from "@react-three/fiber";

export function Tile({
  position,
  color,
}: {
  position: [number, number];
  color?: string;
}) {
  const {
    enemies,
    weapons,
    spawnWeapon,
    removeWeapon,
    grid,
    weaponSpawnState,
    setSelectedWeapon,
  } = useGameStore((state) => state);

  const onClick = useCallback(
    (event: ThreeEvent<MouseEvent>) => {
      console.log("Clicked tile", position);
      setSelectedWeapon(null);
      if (weaponSpawnState !== "sphere") return;
      console.log("Trying to spawn weapon at", position);
      const taken = weapons.find((weapon) =>
        positionEquals([weapon.position[0], weapon.position[2]], position)
      );
      if (taken) {
        console.log("Position already taken");
        return;
      }
      if (
        !checkPaths(
          enemies.map((enemy) => ({
            position: [enemy.position[0], enemy.position[2]],
          })),
          grid,
          [
            ...weapons.map((weapon) => ({
              position: [weapon.position[0], weapon.position[2]] as [
                number,
                number
              ],
            })),
            { position },
          ]
        )
      ) {
        console.log("No path to end");
        return;
      }
      console.log("Spawning weapon at", position);
      spawnWeapon([position[0], 0, position[1]]);
    },
    [position, weapons, spawnWeapon]
  );

  return (
    <TileModel
      position={[position[0], -0.15, position[1]]}
      tint={color}
      onClick={(e) => {
        e.stopPropagation();
        onClick(e);
      }}
    />
  );
}
