import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import gsap from "gsap";
import { Model } from "./Model";
import "./Watch.css";

export default function Watch({ focused, setFocused }) {
  const watchRef = useRef();
  const floatRef = useRef();
  const exploreBtnRef = useRef();
  const panelRef = useRef();
  const labelContainerRef = useRef();
  const vignetteRef = useRef();
  const brandHeaderRef = useRef();
  
  // Refs for labels
  const labelRefs = [useRef(), useRef(), useRef(), useRef()];

  // Model references to pass to Model component
  const glassRef = useRef();
  const crownRef = useRef();
  const topBandRef = useRef();
  const bottomBandRef = useRef();
  const caseRef = useRef();

  // 1. Idle & Mouse Follow animation logic inside R3F loop
  useFrame((state) => {
    if (!floatRef.current) return;
    const t = state.clock.elapsedTime;

    // Very slow floating animation
    floatRef.current.position.y = Math.sin(t * 0.85) * 0.15;

    if (!focused) {
      // Extremely slow idle rotation
      floatRef.current.rotation.y += 0.0006;

      // Soft mouse-follow parallax
      const mouseX = state.mouse.x;
      const mouseY = state.mouse.y;

      const targetRotY = -Math.PI / 2 + mouseX * 0.22;
      const targetRotX = -mouseY * 0.12;

      floatRef.current.rotation.y +=
        (targetRotY - floatRef.current.rotation.y) * 0.05;

      floatRef.current.rotation.x +=
        (targetRotX - floatRef.current.rotation.x) * 0.05;
    } else {
      // Smoothly reset mouse-follow rotation when focused (facing 3/4 angle controlled by watchRef)
      floatRef.current.rotation.x += (0 - floatRef.current.rotation.x) * 0.08;
      floatRef.current.rotation.y += (0 - floatRef.current.rotation.y) * 0.08;
    }
  });

  // 2. GSAP Showcase Presentation Timeline
  useEffect(() => {
    if (!watchRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        paused: true,
        defaults: {
          duration: 2.0,
          ease: "power4.out" // Premium luxury ease
        }
      });

      // Watch shifts left, scales down slightly, and rotates to 3/4 angle
      tl.to(watchRef.current.position, {
        x: -4.5,
        y: 0.1,
        z: 0,
      }, 0)
        .to(watchRef.current.rotation, {
          x: 0.18,
          y: 0.58,
          z: -0.05,
        }, 0)
        .to(watchRef.current.scale, {
          x: 0.85,
          y: 0.85,
          z: 0.85,
        }, 0);

      // Explore Details button fades out and slides down
      if (exploreBtnRef.current) {
        tl.to(exploreBtnRef.current, {
          opacity: 0,
          y: 35,
          duration: 1.0,
          pointerEvents: "none",
        }, 0);
      }

      // Dim and darken background with luxury vignette overlay
      if (vignetteRef.current) {
        tl.to(vignetteRef.current, {
          opacity: 0.85,
          duration: 2.2,
        }, 0);
      }

      // Fade in brand watermark overlay header
      if (brandHeaderRef.current) {
        tl.to(brandHeaderRef.current, {
          opacity: 0.15,
          y: -10,
          duration: 1.8,
        }, 0);
      }

      // Activate labels container
      if (labelContainerRef.current) {
        tl.to(labelContainerRef.current, {
          opacity: 1,
          pointerEvents: "auto",
          duration: 0.1,
        }, 0.2);
      }

      // Stagger fade-in, blur-to-sharp, and slide-up labels
      labelRefs.forEach((ref, idx) => {
        if (ref.current) {
          tl.to(ref.current, {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 1.4,
          }, 0.5 + idx * 0.15); // Staggered 0.15s apart
        }
      });

      // Product panel slides in from the right
      if (panelRef.current) {
        tl.to(panelRef.current, {
          x: 0,
          opacity: 1,
          duration: 1.8,
          ease: "expo.out"
        }, 0.8);
      }

      // Execute based on React state change
      if (focused) {
        tl.play();
      } else {
        tl.reverse();
      }
    });

    return () => ctx.revert();
  }, [focused]);

  return (
    <group>
      {/* 3D Model Group */}
      <group
        ref={watchRef}
        onClick={(e) => {
          e.stopPropagation();
          if (!focused) setFocused(true);
        }}
        style={{ cursor: focused ? "default" : "pointer" }}
      >
        <group ref={floatRef}>
          <Model
            glassRef={glassRef}
            crownRef={crownRef}
            topBandRef={topBandRef}
            bottomBandRef={bottomBandRef}
            caseRef={caseRef}
          />
        </group>
      </group>

      {/* HTML Interface Overlay */}
      <Html fullscreen style={{ pointerEvents: "none" }}>
        <div className="luxury-watch-overlay">

          {/* Subtle Ambient Vignette Overlay */}
          <div ref={vignetteRef} className="luxury-vignette-overlay"></div>

          {/* Minimalist Watermark Branding */}
          <div ref={brandHeaderRef} className="luxury-brand-header" style={{ opacity: 0.6, transform: "translateY(0px)" }}>
            <span className="brand-subtitle">CIBEXEL CHRONOGRAPH</span>
            <h2 className="brand-name">AURA</h2>
          </div>

          {/* Initial Explore Button */}
          <div
            ref={exploreBtnRef}
            className="explore-button-container"
            style={{ opacity: 1, transform: "translateY(0px)" }}
          >
            <button className="explore-btn" onClick={() => setFocused(true)}>
              EXPLORE DETAILS
              <span className="explore-btn-line"></span>
            </button>
          </div>

          {/* Staggered Labels Container */}
          <div ref={labelContainerRef} className="labels-container" style={{ opacity: 0, pointerEvents: "none" }}>

            {/* Label 1: Sapphire Crystal */}
            <div
              ref={labelRefs[0]}
              className="watch-label label-sapphire"
              style={{ opacity: 0, transform: "translateY(20px)", filter: "blur(8px)", pointerEvents: "none" }}
            >
              <span className="label-title">SAPPHIRE CRYSTAL</span>
              <p className="label-desc">Scratch-resistant sapphire crystal with anti-reflective coating.</p>
            </div>

            {/* Label 2: 316L Stainless Steel */}
            <div
              ref={labelRefs[1]}
              className="watch-label label-steel"
              style={{ opacity: 0, transform: "translateY(20px)", filter: "blur(8px)", pointerEvents: "none" }}
            >
              <span className="label-title">316L STAINLESS STEEL</span>
              <p className="label-desc">Marine-grade brushed stainless steel case engineered for durability.</p>
            </div>

            {/* Label 3: Automatic Movement */}
            <div
              ref={labelRefs[2]}
              className="watch-label label-movement"
              style={{ opacity: 0, transform: "translateY(20px)", filter: "blur(8px)", pointerEvents: "none" }}
            >
              <span className="label-title">AUTOMATIC MOVEMENT</span>
              <p className="label-desc">Precision Swiss-inspired self-winding movement with exceptional accuracy.</p>
            </div>

            {/* Label 4: Rubber Strap */}
            <div
              ref={labelRefs[3]}
              className="watch-label label-strap"
              style={{ opacity: 0, transform: "translateY(20px)", filter: "blur(8px)", pointerEvents: "none" }}
            >
              <span className="label-title">RUBBER STRAP</span>
              <p className="label-desc">Premium soft-touch rubber strap engineered for comfort.</p>
            </div>
          </div>

          {/* Glassmorphic Product Spec Panel */}
          <div
            ref={panelRef}
            className="product-panel"
            style={{ transform: "translateX(480px)", opacity: 0, pointerEvents: "none" }}
          >
            <button className="panel-close-btn" onClick={() => setFocused(false)}>
              <span className="close-text">CLOSE PREVIEW</span>
              <span className="close-icon">✕</span>
            </button>

            <div className="panel-scroll-content">
              <div className="panel-header">
                <span className="collection-tag">AURA DEEP DIVER CO.</span>
                <h3 className="watch-model-name">AURA CHRONO</h3>
                <p className="watch-price">$12,500</p>
              </div>

              <div className="panel-divider"></div>

              <p className="watch-panel-desc">
                A masterclass in marine engineering, combining a high-integrity stainless steel case with Swiss precision timing. Crafted for the modern explorer who demands performance without compromising on elegance.
              </p>

              <div className="specs-section">
                <h5 className="specs-section-title">SPECIFICATIONS</h5>
                <div className="specs-grid">
                  <div className="spec-row">
                    <span className="spec-label">Movement</span>
                    <span className="spec-value">Swiss Calibre-V7 Automatic</span>
                  </div>
                  <div className="spec-row">
                    <span className="spec-label">Case Material</span>
                    <span className="spec-value">316L Brushed Steel</span>
                  </div>
                  <div className="spec-row">
                    <span className="spec-label">Crystal</span>
                    <span className="spec-value">AR Sapphire Crystal</span>
                  </div>
                  <div className="spec-row">
                    <span className="spec-label">Power Reserve</span>
                    <span className="spec-value">72 Hours</span>
                  </div>
                  <div className="spec-row">
                    <span className="spec-label">Water Resistance</span>
                    <span className="spec-value">300m / 1,000ft</span>
                  </div>
                  <div className="spec-row">
                    <span className="spec-label">Diameter</span>
                    <span className="spec-value">42mm</span>
                  </div>
                  <div className="spec-row">
                    <span className="spec-label">Strap</span>
                    <span className="spec-value">Stealth Black Rubber</span>
                  </div>
                  <div className="spec-row">
                    <span className="spec-label">Warranty</span>
                    <span className="spec-value">5 Years International</span>
                  </div>
                </div>
              </div>

              <div className="panel-actions">
                <button className="btn-secondary" onClick={() => alert("Detailed specifications manual downloaded.")}>
                  View Specifications
                </button>
                <button className="btn-primary" onClick={() => alert("Added to your bespoke private collection.")}>
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </Html>
    </group>
  );
}