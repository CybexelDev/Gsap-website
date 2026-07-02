import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./Hero.css";

gsap.registerPlugin(ScrollTrigger);

const TOTAL_FRAMES = 85;

const HeroAnimation = () => {
  const canvasRef = useRef();

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    const images = [];
    const frame = { current: 0 };

    // Resize Canvas
    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      render();
    }

    window.addEventListener("resize", resizeCanvas);

    // Load Images
    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = `/vedio_frames/frame_${String(i).padStart(3, "0")}.jpg`;
      images.push(img);
    }

    images[0].onload = () => {
      resizeCanvas();
    };

    // Draw Image
    function render() {
      const img = images[Math.round(frame.current)];

      if (!img || !img.complete) return;

      context.clearRect(0, 0, canvas.width, canvas.height);

      const scale = Math.max(
        canvas.width / img.width,
        canvas.height / img.height
      );

      const x = (canvas.width - img.width * scale) / 2;
      const y = (canvas.height - img.height * scale) / 2;

      context.drawImage(
        img,
        x,
        y,
        img.width * scale,
        img.height * scale
      );
    }

    gsap.to(frame, {
      current: TOTAL_FRAMES - 1,
      snap: "current",
      ease: "none",
      onUpdate: render,
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "+=5000",
        scrub: 1,
        pin: true,
        anticipatePin: 1,
        markers: false,
      },
    });

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, []);

  return (
    <>
    
      <section className="hero">
        <canvas ref={canvasRef}></canvas>
         <div className="hero-content">
        <h1>Premium Watch Series</h1>
        <p>The most advanced watch ever.</p>
      </div>
      </section>

      {/* <section className="content">
        <h1>Scroll Continues...</h1>
      </section> */}
    </>
  );
};

export default HeroAnimation;