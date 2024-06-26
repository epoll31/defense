"use client";

import React, { useMemo } from "react";
import { Cylinder } from "@react-three/drei";

export default function HealthBar({
  position,
  rotation,
  scale = [1, 1, 1],
  radius = 0.1,
  length = 1,
  percent: rawPercent,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  scale?: [number, number, number];
  radius?: number;
  length?: number;
  percent: number;
}) {
  const percent = useMemo(
    () => Math.min(1, Math.max(0, rawPercent)),
    [rawPercent]
  );
  const greenLength = length * percent;
  const redLength = length * (1 - percent);

  return (
    <group
      position={[
        position[0], // - length / 2,
        position[1] - radius / 2,
        position[2], // - length / 2,
      ]}
      rotation={[
        Math.PI / 2 + rotation[0],
        rotation[1],
        Math.PI / 2 + rotation[2],
      ]}
      scale={scale}
    >
      <Cylinder
        args={[radius, radius, redLength, 32, 1, false]}
        position={[0, -length / 2 + redLength / 2, 0]}
        rotation={[0, 0, 0]}
        scale={[1, 1, 1]}
      >
        <meshBasicMaterial attach="material" color="red" />
      </Cylinder>
      <Cylinder
        args={[radius, radius, greenLength, 32, 1, false]}
        position={[0, length / 2 - greenLength / 2, 0]}
        rotation={[0, 0, 0]}
        scale={[1, 1, 1]}
      >
        <meshBasicMaterial attach="material" color="green" />
      </Cylinder>
    </group>
  );
}
