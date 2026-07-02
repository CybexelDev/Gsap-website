import { useRef, useState, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import Watch from "./Watch";
import gsap from "gsap";

function SceneContent({ focused, setFocused }) {
  const { camera } = useThree();
  const spotLightRef = useRef();
  const spotlightTargetRef = useRef();

  // Handle Camera and Spotlight sweep animations via GSAP
  useEffect(() => {
    if (!camera || !spotLightRef.current) return;

    const tl = gsap.timeline({
      defaults: {
        duration: 2.4,
        ease: "power4.out" // Luxury smooth slow down
      }
    });

    if (focused) {
      // Zoom camera into watch and pan slightly for 3/4 composition
      tl.to(camera.position, {
        x: -4.5,
        y: 1.5,
        z: 42,
      })
      // Sweep spotlight position to pass light reflections across watch face
      .to(spotLightRef.current.position, {
        x: 18,
        y: 12,
        z: 20,
      }, "<")
      .to(spotLightRef.current, {
        intensity: 28,
      }, "<");
    } else {
      // Camera zooms out to show full centered watch
      tl.to(camera.position, {
        x: 0,
        y: 0,
        z: 60,
      })
      // Reset spotlight to initial dramatic angle
      .to(spotLightRef.current.position, {
        x: -18,
        y: 12,
        z: 20,
      }, "<")
      .to(spotLightRef.current, {
        intensity: 15,
      }, "<");
    }

    return () => {
      tl.kill();
    };
  }, [focused, camera]);

  return (
    <>
      {/* Canvas background is transparent to let CSS layers show through */}

      {/* Ambient light for subtle shadow fills */}
      <ambientLight intensity={0.12} />

      {/* Strong Rim Light from top-back to trace luxury contours */}
      <directionalLight position={[0, 15, -25]} intensity={5.0} color="#ffffff" />

      {/* Main Studio Key Light */}
      <directionalLight position={[15, 12, 18]} intensity={3.0} color="#fbfbfd" />

      {/* Studio Fill Light with a cooler tone */}
      <directionalLight position={[-18, 6, 12]} intensity={1.2} color="#d9e2ec" />

      {/* Luxury Spotlight with sweep animation */}
      <spotLight
        ref={spotLightRef}
        position={[-18, 12, 20]}
        angle={0.35}
        penumbra={1}
        intensity={15}
        distance={140}
        target={spotlightTargetRef.current}
        castShadow
      />

      {/* Invisible spotlight target */}
      <mesh ref={spotlightTargetRef} position={[0, 0, 0]} visible={false}>
        <boxGeometry args={[0.01, 0.01, 0.01]} />
        <meshBasicMaterial />
      </mesh>

      {/* HDR environment map for beautiful metal reflections */}
      <Environment preset="studio" />

      {/* Watch Model and overlays */}
      <Watch focused={focused} setFocused={setFocused} />
    </>
  );
}

export default function Scene() {
  const [focused, setFocused] = useState(false);
  const bgGlowRef = useRef();
  const bgSweepRef = useRef();

  // 1. Slow, infinite idle background breathing animation
  useEffect(() => {
    if (!bgGlowRef.current) return;
    const breathe = gsap.to(bgGlowRef.current, {
      scale: 1.08,
      opacity: 0.60,
      duration: 8.0,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });
    return () => breathe.kill();
  }, []);

  // 2. Focused background transitions
  useEffect(() => {
    if (!bgGlowRef.current || !bgSweepRef.current) return;

    if (focused) {
      // Spotlight glow shifts behind the watch and strengthens
      gsap.to(bgGlowRef.current, {
        left: "28%",
        opacity: 0.85,
        scale: 1.3,
        duration: 2.4,
        ease: "power4.out"
      });

      // Run soft linear light sweep reflection across background
      gsap.fromTo(bgSweepRef.current,
        { left: "-150%" },
        { left: "250%", duration: 2.6, ease: "power3.inOut" }
      );
    } else {
      // Reset spotlight glow to center
      gsap.to(bgGlowRef.current, {
        left: "50%",
        opacity: 0.45,
        scale: 1.0,
        duration: 2.4,
        ease: "power4.out"
      });
    }
  }, [focused]);

  return (
    <div className="luxury-scene-container">
      {/* Premium Cinematic Photo Studio Background Layers */}
      <div className="luxury-bg-base"></div>
      <div ref={bgGlowRef} className="luxury-bg-glow"></div>
      <div ref={bgSweepRef} className="luxury-bg-sweep"></div>
      <div className="luxury-grain-overlay"></div>

      <Canvas
        camera={{ position: [0, 0, 60], fov: 70 }}
        style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0, zIndex: 3 }}
      >
        <SceneContent focused={focused} setFocused={setFocused} />
      </Canvas>
    </div>
  );
}