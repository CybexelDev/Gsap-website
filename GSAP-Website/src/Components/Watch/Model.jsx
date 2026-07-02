import React, { useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import watchModel from "../../assets/dive_watch.glb"

export function Model({
  glassRef,
  crownRef,
  topBandRef,
  bottomBandRef,
  caseRef,
  ...props
}) {
  const { nodes, materials } = useGLTF(watchModel)

  // Adjust properties of the original band material (Matte vulcanized rubber)
  if (materials.band) {
    materials.band.roughness = 0.85;
    materials.band.metalness = 0.08;
  }

  // Adjust properties of the original watch material (Stainless steel case, dial, hands)
  if (materials.watch) {
    materials.watch.metalness = 0.92;
    materials.watch.roughness = 0.22;
    materials.watch.envMapIntensity = 2.0;
  }

  // Clone watch material for glass to add reflection and transparency without altering other meshes
  const glassMaterial = useMemo(() => {
    if (!materials.watch) return null;
    const cl = materials.watch.clone();
    cl.transparent = true;
    cl.opacity = 0.12;
    cl.roughness = 0.02;
    cl.metalness = 0.1;
    return cl;
  }, [materials.watch]);

  // Clone watch material for markers to add a premium Swiss Super-Luminova glow
  const markersMaterial = useMemo(() => {
    if (!materials.watch) return null;
    const cl = materials.watch.clone();
    if (cl.emissive) {
      cl.emissive.set("#a3e3d9");
      cl.emissiveIntensity = 0.25;
    }
    return cl;
  }, [materials.watch]);

  return (
    <group {...props} dispose={null}>
      <group position={[8.863, 0.046, -3.872]} rotation={[-Math.PI / 2, 0, 0]} scale={100}>
        <group position={[-0.004, -0.117, 0.146]}>
          <mesh
            ref={topBandRef}
            geometry={nodes.band_t_band_0.geometry}
            material={materials.band}
          />
          <mesh
            geometry={nodes.buckle_band_0.geometry}
            material={materials.band}
            position={[-0.37, 0.072, -0.117]}
          />
          <mesh
            geometry={nodes.buckle001_band_0.geometry}
            material={materials.band}
            position={[-0.367, 0.072, -0.118]}
          />
        </group>
        
        <mesh
          ref={caseRef}
          geometry={nodes.case_watch_0.geometry}
          material={materials.watch}
        />
        
        <mesh
          geometry={nodes.date_watch_0.geometry}
          material={materials.watch}
          position={[0.013, -0.048, 0.001]}
          rotation={[2.368, 0, 0]}
        />
        
        <mesh
          ref={glassRef}
          geometry={nodes.glass_watch_0.geometry}
          material={glassMaterial || materials.watch}
        />
       
        <mesh
          ref={crownRef}
          geometry={nodes.crown_watch_0.geometry}
          material={materials.watch}
          position={[-0.004, 0.095, -0.001]}
        />
        
        <mesh
          geometry={nodes.sec_watch_0.geometry}
          material={materials.watch}
          position={[0.017, -0.048, 0.001]}
        />
        
        <mesh
          geometry={nodes.min_watch_0.geometry}
          material={materials.watch}
          position={[0.016, -0.048, 0.001]}
        />
        
        <mesh
          geometry={nodes.hour_watch_0.geometry}
          material={materials.watch}
          position={[0.016, -0.048, 0.001]}
        />
        
        <mesh
          geometry={nodes.tm_watch_0.geometry}
          material={markersMaterial || materials.watch}
          position={[0.017, -0.048, 0.001]}
        />
        
        <mesh
          ref={bottomBandRef}
          geometry={nodes.band_b_band_0.geometry}
          material={materials.band}
          position={[0, -0.118, -0.147]}
        />
      </group>
    </group>
  )
}

useGLTF.preload(watchModel)