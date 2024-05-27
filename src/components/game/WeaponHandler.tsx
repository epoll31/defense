import { useGameStore } from "@/game/store";
import { useBlasterModel } from "./models/BlasterModel";
import { useCallback, useMemo, useRef } from "react";
import { InstancedMesh, Object3D, Raycaster, Vector2 } from "three";
import { ThreeEvent, useFrame, useThree } from "@react-three/fiber";
import { Weapon } from "@/game/types";
import { findTarget } from "@/game/utils/findTarget";
import { getAngle } from "@/game/utils/getAngle";
import { constants } from "fs/promises";
import { angleLerp } from "@/game/utils/angleLerp";

function convertAngle(angle: number) {
  return Math.PI - angle + Math.PI / 2;
}

export default function WeaponHandler() {
  const { nodes, materials } = useBlasterModel();
  const { weapons, updateWeapon, enemies } = useGameStore((state) => state);

  const instancedMeshRef1 = useRef<InstancedMesh>(null);
  const instancedMeshRef2 = useRef<InstancedMesh>(null);
  const instancedMeshRef3 = useRef<InstancedMesh>(null);
  const object3D = useMemo(() => new Object3D(), []);

  const { camera } = useThree();
  const raycaster = useMemo(() => new Raycaster(), []);
  const mouse = useRef(new Vector2());

  const handleWeaponUpdate = useCallback(
    (weapon: Weapon, index: number) => {
      const target = findTarget(weapon, enemies);
      let changes: Partial<Weapon>;

      if (target) {
        const nextDirection = convertAngle(
          getAngle(
            [weapon.position[0], weapon.position[2]] as [number, number],
            [target.position[0], target.position[2]] as [number, number]
          )
        );
        changes = {
          direction: angleLerp(weapon.direction, nextDirection, 0.1),
        };
      } else {
        changes = {
          direction: weapon.direction + 0.01,
        };
      }

      updateWeapon({
        ...weapon,
        ...changes,
      });
    },
    [enemies]
  );
  const handleInstanceUpdate = useCallback((weapon: Weapon, index: number) => {
    if (
      instancedMeshRef1.current &&
      instancedMeshRef2.current &&
      instancedMeshRef3.current
    ) {
      object3D.position.set(
        weapon.position[0],
        weapon.position[1] + 0.05,
        weapon.position[2]
      );
      object3D.scale.setScalar(1.5);
      object3D.rotation.set(0, weapon.direction, 0);
      object3D.updateMatrix();

      instancedMeshRef1.current.setMatrixAt(index, object3D.matrix);
      instancedMeshRef2.current.setMatrixAt(index, object3D.matrix);
      instancedMeshRef3.current.setMatrixAt(index, object3D.matrix);

      instancedMeshRef1.current.instanceMatrix.needsUpdate = true;
      instancedMeshRef2.current.instanceMatrix.needsUpdate = true;
      instancedMeshRef3.current.instanceMatrix.needsUpdate = true;
    }
  }, []);

  useFrame((delta) => {
    weapons.forEach((weapon, index) => {
      handleWeaponUpdate(weapon, index);
      handleInstanceUpdate(weapon, index);
    });
  });
  const handleClick = useCallback(
    (event: ThreeEvent<MouseEvent>) => {
      if (
        !instancedMeshRef1.current ||
        !instancedMeshRef2.current ||
        !instancedMeshRef3.current ||
        !camera
      )
        return;

      const { offsetX, offsetY } = event.nativeEvent;
      const { width, height } = event.target as HTMLCanvasElement;

      mouse.current.x = (offsetX / width) * 2 - 1;
      mouse.current.y = -(offsetY / height) * 2 + 1;

      raycaster.setFromCamera(mouse.current, camera);

      const intersects1 = raycaster.intersectObject(
        instancedMeshRef1.current,
        true
      );
      const intersects2 = raycaster.intersectObject(
        instancedMeshRef2.current,
        true
      );
      const intersects3 = raycaster.intersectObject(
        instancedMeshRef3.current,
        true
      );

      const intersects = [...intersects1, ...intersects2, ...intersects3];

      if (intersects.length > 0) {
        const instanceId = intersects[0].instanceId;
        console.log(`Instance ${instanceId} clicked`);
        event.stopPropagation();
      }
    },
    [camera, mouse, raycaster]
  );

  return (
    <>
      <instancedMesh
        ref={instancedMeshRef1}
        args={[
          nodes.Mesh_weapon_blaster.geometry,
          materials.stone,
          weapons.length,
        ]}
        onClick={handleClick}
      />
      <instancedMesh
        ref={instancedMeshRef2}
        args={[
          nodes.Mesh_weapon_blaster_1.geometry,
          materials.red,
          weapons.length,
        ]}
        onClick={handleClick}
      />
      <instancedMesh
        ref={instancedMeshRef3}
        args={[
          nodes.Mesh_weapon_blaster_2.geometry,
          materials.stoneDark,
          weapons.length,
        ]}
        onClick={handleClick}
      />
    </>
  );
}
