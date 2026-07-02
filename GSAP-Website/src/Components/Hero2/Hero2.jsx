import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./Hero2.css";

gsap.registerPlugin(ScrollTrigger);

const TOTAL_FRAMES = 139;

export default function HeroAnimation2() {
  const canvasRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const content = contentRef.current;
    const ctx = canvas.getContext("2d");

    const images = [];
    const frame = { current: 0 };

    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      render();
    }
    window.addEventListener("resize", resizeCanvas);

    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = `/images/ezgif-frame-${String(i).padStart(3, "0")}.jpg`;
      img.onload = () => {
        if (i === 1) resizeCanvas();
      };
      images.push(img);
    }

    function render() {
      const idx = Math.round(Math.max(0, Math.min(frame.current, TOTAL_FRAMES - 1)));
      const img = images[idx];
      if (!img || !img.complete || !img.naturalWidth) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const scale = Math.max(
        canvas.width / img.naturalWidth,
        canvas.height / img.naturalHeight
      );
      const x = (canvas.width - img.naturalWidth * scale) / 2;
      const y = (canvas.height - img.naturalHeight * scale) / 2;
      ctx.drawImage(img, x, y, img.naturalWidth * scale, img.naturalHeight * scale);

      // Text: fully visible from frame 0, fades out between frame 50–65
      if (content) {
        const f = frame.current;
        let opacity = 1;

        if (f <= 50) {
          // Fully visible for the first 50 frames
          opacity = 1;
        } else if (f <= 65) {
          // Fade out over frames 50 → 65
          opacity = 1 - (f - 50) / 15;
        } else {
          // Gone after frame 65 (both forward and reverse passes)
          opacity = 0;
        }

        content.style.opacity = Math.max(0, Math.min(1, opacity));
      }
    }

    // Set text visible immediately before any scroll
    if (content) content.style.opacity = 1;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: ".heroTow",
        start: "top top",
        end: "+=10000",
        scrub: 0.5,
        pin: true,
        anticipatePin: 1,
      },
    });

    // Forward: 0 → 138
    tl.to(frame, {
      current: TOTAL_FRAMES - 1,
      ease: "none",
      snap: "current",
      onUpdate: render,
      duration: 1,
    });

    // Reverse: 138 → 0
    tl.to(frame, {
      current: 0,
      ease: "none",
      snap: "current",
      onUpdate: render,
      duration: 1,
    });

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      ScrollTrigger.getAll().forEach((s) => s.kill());
    };
  }, []);

  return (
    <section className="heroTow">
      <canvas ref={canvasRef} />
      <div className="hero-content2" ref={contentRef}>
        <p className="hero-eyebrow2">SWISS CRAFTED</p>
        <h1>Every Second,<br />
            Engineered to <br /><span className="gold-text">Perfection</span>.</h1>
        <p className="hero-sub"> Experience uncompromising craftsmanship where <br />timeless mechanics meet modern luxury.</p>
        <button className="hero-button2">Explore the Collection</button>
      </div>
    </section>
  );
}