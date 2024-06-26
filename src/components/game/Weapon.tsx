import React, { useMemo, useState, useRef } from "react";
import { MeshProps, useFrame } from "@react-three/fiber";
import { useGameStore } from "@/game/store";
import { Enemy, EnemyState, type Weapon as WeaponType } from "@/game/types";
import BlasterModel from "./models/BlasterModel";
import { useSpring } from "@react-spring/three";
import usePulse from "@/game/utils/usePulse";
import Ring from "./utils/Ring";
import DebugLine from "./utils/DebugLine";
import { getAngle } from "@/game/utils/getAngle";
import { angleLerp } from "@/game/utils/angleLerp";
import { findTarget } from "@/game/utils/findTarget";
import CannonModel from "./models/CannonModel";

function convertAngle(angle: number) {
  return Math.PI - angle + Math.PI / 2;
}

export function Weapon({
  weapon,
}: Omit<MeshProps, "position"> & {
  weapon: WeaponType;
}) {
  const { enemies, setSelectedWeapon, selectedWeapon, grid, updateEnemy } =
    useGameStore((state) => state);
  const selected = useMemo(
    () => selectedWeapon === weapon.id,
    [selectedWeapon, weapon.id]
  );
  const directionRef = useRef(0);
  const rawDirectionRef = useRef(
    convertAngle(getAngle(weapon.position, grid.start))
  );
  const targetRef = useRef<Enemy | null>(null);

  const pulse = usePulse(1.15, 1.3, 2);

  const { scale } = useSpring({
    scale: selected ? pulse : 1,
    config: { tension: 170, friction: 26 },
  });
  const [x, setX] = useState(0);
  const [timer, setTimer] = useState(0);
  useFrame((state, delta) => {
    setX((prevX) => (prevX + 0.001) % (Math.PI * 2));
    setTimer((prev) => prev + delta);

    const target = findTarget(weapon, enemies);

    if (timer > weapon.speed && target) {
      setTimer(0);
      const nextHealth = target.health - weapon.damage;
      const change =
        nextHealth <= 0
          ? {
              state: "despawning" as EnemyState,
            }
          : {
              health: nextHealth,
            };
      updateEnemy({
        ...target,
        ...change,
      });
    }
    if (target && target !== targetRef.current) {
      rawDirectionRef.current = convertAngle(
        getAngle(weapon.position, [target.position[0], target.position[2]])
      );
      targetRef.current = target;
    } else if (!target) {
      rawDirectionRef.current += 0.01;
      targetRef.current = null;
    }

    directionRef.current = angleLerp(
      directionRef.current,
      rawDirectionRef.current,
      0.1
    );
  });

  return (
    <>
      {weapon.type === "Turret" && (
        <BlasterModel
          rotation={[0, directionRef.current, 0]}
          position={[weapon.position[0], 0.05, weapon.position[1]]}
          scale={scale.get()}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedWeapon(weapon.id);
          }}
        />
      )}
      {weapon.type === "Cannon" && (
        <CannonModel
          rotation={[0, directionRef.current, 0]}
          position={[weapon.position[0], 0.05, weapon.position[1]]}
          scale={scale.get()}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedWeapon(weapon.id);
          }}
        />
      )}
      {selected && (
        <>
          <Ring
            position={[weapon.position[0], 0.1, weapon.position[1]]}
            radius={weapon.radius}
            tube={0.05}
            dashCount={8}
            rotation={[0, x, 0]}
          />
          {targetRef.current && (
            <Ring
              position={[
                targetRef.current.position[0],
                0.1,
                targetRef.current.position[2],
              ]}
              radius={0.25}
              tube={0.03}
              color={"#f54949"}
              dashCount={4}
              dashGap={0.5}
              rotation={[0, x, 0]}
            />
          )}

          <DebugLine
            position={[
              weapon.position[0] - Math.sin(directionRef.current) * 0.5,
              0.05,
              weapon.position[1] - Math.cos(directionRef.current) * 0.5,
            ]}
            rotation={[0, directionRef.current + Math.PI / 2, Math.PI / 2]}
            length={1}
            color={"green"}
          />
          <DebugLine
            position={[
              weapon.position[0] - Math.sin(rawDirectionRef.current) * 0.5,
              0.05,
              weapon.position[1] - Math.cos(rawDirectionRef.current) * 0.5,
            ]}
            rotation={[0, rawDirectionRef.current + Math.PI / 2, Math.PI / 2]}
            length={1}
            color={"red"}
          />
        </>
      )}
    </>
  );
}
