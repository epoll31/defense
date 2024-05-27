import { useRef, useMemo, useCallback, useState } from "react";
import { InstancedMesh, Object3D } from "three";
import { useFrame } from "@react-three/fiber";
import { useGameStore } from "@/game/store";
import { Enemy } from "@/game/types";
import { getNextDirection } from "@/game/utils/pathfinding";
import { positionEquals } from "@/game/utils/positionEquals";
import { useInterval } from "react-use";
import { useGreenUFOModel } from "./models/GreenUFOModel";
import HealthBar from "./utils/HealthBar";

export default function EnemyHandler() {
  const { grid, enemies, spawnEnemy, updateEnemy, despawnEnemy, weapons } =
    useGameStore((state) => state);
  const { nodes, materials } = useGreenUFOModel();

  const instancedMeshRef1 = useRef<InstancedMesh>(null);
  const instancedMeshRef2 = useRef<InstancedMesh>(null);
  const instancedMeshRef3 = useRef<InstancedMesh>(null);

  const [anglesToCamera, setAnglesToCamera] = useState<number[]>([]);

  const object3D = useMemo(() => new Object3D(), []);

  useInterval(() => {
    spawnEnemy(grid.start);
  }, 1000);

  const obstacles = useMemo(() => {
    return weapons.map((weapon) => ({
      position: [weapon.position[0], weapon.position[2]] as [number, number],
      radius: weapon.radius,
    }));
  }, [weapons]);

  const handleEnemyUpdate = useCallback(
    (enemy: Enemy, delta: number) => {
      switch (enemy.state) {
        case "spawning":
          const nextHeight = enemy.position[1] - 0.1;
          if (nextHeight <= 0) {
            updateEnemy({
              ...enemy,
              position: [enemy.position[0], 0, enemy.position[2]],
              state: "moving",
            });
          } else {
            updateEnemy({
              ...enemy,
              position: [enemy.position[0], nextHeight, enemy.position[2]],
            });
          }
          break;
        case "moving":
          const direction = getNextDirection(
            {
              position: [enemy.position[0], enemy.position[2]],
              direction: enemy.direction,
            },
            grid,
            obstacles
          );
          const speed = enemy.speed * delta * 100;
          const nextX = enemy.position[0] + Math.cos(direction) * speed;
          const nextZ = enemy.position[2] + Math.sin(direction) * speed;
          const nextState = positionEquals([nextX, nextZ], grid.end)
            ? "despawning"
            : enemy.state;
          updateEnemy({
            ...enemy,
            position: [nextX, enemy.position[1], nextZ],
            direction,
            state: nextState,
          });
          break;
        case "despawning":
          if (enemy.position[1] >= 10) {
            despawnEnemy(enemy.id);
          } else {
            updateEnemy({
              ...enemy,
              position: [
                enemy.position[0],
                enemy.position[1] + 0.1,
                enemy.position[2],
              ],
            });
          }
          break;
      }
    },
    [obstacles, grid, updateEnemy, despawnEnemy]
  );

  useFrame(({ camera }, delta) => {
    const anglesToCamera: number[] = [];

    enemies.forEach((enemy, index) => {
      const vector = camera.position.clone().sub({
        x: enemy.position[0],
        y: enemy.position[1],
        z: enemy.position[2],
      });
      // Calculate the angle to rotate along the y-axis
      const angle = Math.atan2(vector.x, vector.z);
      // Apply the rotation
      anglesToCamera.push(angle);

      handleEnemyUpdate(enemy, delta);

      if (
        instancedMeshRef1.current &&
        instancedMeshRef2.current &&
        instancedMeshRef3.current
      ) {
        object3D.position.set(
          enemy.position[0],
          enemy.position[1] + 0.1,
          enemy.position[2]
        );
        object3D.scale.setScalar(0.5);
        object3D.updateMatrix();

        instancedMeshRef1.current.setMatrixAt(index, object3D.matrix);
        instancedMeshRef2.current.setMatrixAt(index, object3D.matrix);
        instancedMeshRef3.current.setMatrixAt(index, object3D.matrix);
      }
    });

    if (instancedMeshRef1.current)
      instancedMeshRef1.current.instanceMatrix.needsUpdate = true;
    if (instancedMeshRef2.current)
      instancedMeshRef2.current.instanceMatrix.needsUpdate = true;
    if (instancedMeshRef3.current)
      instancedMeshRef3.current.instanceMatrix.needsUpdate = true;

    setAnglesToCamera(anglesToCamera);
  });

  return (
    <>
      <instancedMesh
        ref={instancedMeshRef1}
        args={[
          nodes.Mesh_enemy_ufoGreen.geometry,
          materials.snowRoad,
          enemies.length,
        ]}
      />
      <instancedMesh
        ref={instancedMeshRef2}
        args={[
          nodes.Mesh_enemy_ufoGreen_1.geometry,
          materials.glass,
          enemies.length,
        ]}
      />
      <instancedMesh
        ref={instancedMeshRef3}
        args={[
          nodes.Mesh_enemy_ufoGreen_2.geometry,
          materials.foliage,
          enemies.length,
        ]}
      />
      {enemies.map(
        (enemy, i) =>
          enemy.state === "moving" && (
            <HealthBar
              key={enemy.id}
              position={[
                enemy.position[0],
                enemy.position[1] + 0.5,
                enemy.position[2],
              ]}
              rotation={[0, 0, -anglesToCamera[i]]}
              percent={enemy.health / enemy.maxHealth}
              radius={0.03}
              length={0.4}
            />
          )
      )}
    </>
  );
}
