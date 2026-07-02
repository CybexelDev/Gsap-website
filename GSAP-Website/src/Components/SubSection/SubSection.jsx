import React, { useEffect, useRef } from "react";
import "./SubSection.css";

const BUBBLE_COUNT = 38;
const GRAVITY = 0.035;
const FRICTION = 0.994;
const MOUSE_RADIUS = 130;
const MOUSE_FORCE = 4.5;

function rand(a, b) {
  return a + Math.random() * (b - a);
}

export default function SubSection() {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animId;

    function resize() {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }

    function cssW() { return canvas.offsetWidth; }
    function cssH() { return canvas.offsetHeight; }

    resize();
    window.addEventListener("resize", resize);

    // Create bubbles
    const bubbles = Array.from({ length: BUBBLE_COUNT }, () => ({
      x: rand(80, cssW() - 80),
      y: rand(80, cssH() - 80),
      r: rand(26, 68),
      vx: rand(-1, 1),
      vy: rand(-1, 0.5),
      hourAngle: rand(0, Math.PI * 2),
      minuteAngle: rand(0, Math.PI * 2),
      secondAngle: rand(0, Math.PI * 2),
      timeSpeed: rand(0.004, 0.012),
    }));

    function drawBubble(b) {
      const { x, y, r } = b;
      ctx.save();
      ctx.translate(x, y);

      // Glass body
      const bodyGrad = ctx.createRadialGradient(
        -r * 0.3, -r * 0.3, r * 0.05,
         0, 0, r
      );
      bodyGrad.addColorStop(0,   "rgba(255,255,255,0.20)");
      bodyGrad.addColorStop(0.45,"rgba(255,255,255,0.06)");
      bodyGrad.addColorStop(1,   "rgba(255,255,255,0.01)");

      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fillStyle = bodyGrad;
      ctx.fill();

      // Outer border
      ctx.strokeStyle = "rgba(255,255,255,0.28)";
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Inner bezel ring
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.82, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255,255,255,0.1)";
      ctx.lineWidth = 0.7;
      ctx.stroke();

      // Tick marks
      for (let i = 0; i < 60; i++) {
        const angle = (i / 60) * Math.PI * 2 - Math.PI / 2;
        const isMajor = i % 5 === 0;
        const inner = r * (isMajor ? 0.68 : 0.74);
        const outer = r * 0.81;
        ctx.beginPath();
        ctx.moveTo(Math.cos(angle) * inner, Math.sin(angle) * inner);
        ctx.lineTo(Math.cos(angle) * outer, Math.sin(angle) * outer);
        ctx.strokeStyle = isMajor
          ? "rgba(255,255,255,0.75)"
          : "rgba(255,255,255,0.2)";
        ctx.lineWidth = isMajor ? 1.4 : 0.6;
        ctx.stroke();
      }

      // Hour hand
      ctx.save();
      ctx.rotate(b.hourAngle);
      ctx.beginPath();
      ctx.moveTo(0, r * 0.12);
      ctx.lineTo(0, -r * 0.4);
      ctx.strokeStyle = "rgba(255,255,255,0.95)";
      ctx.lineWidth = r > 45 ? 2.2 : 1.6;
      ctx.lineCap = "round";
      ctx.stroke();
      ctx.restore();

      // Minute hand
      ctx.save();
      ctx.rotate(b.minuteAngle);
      ctx.beginPath();
      ctx.moveTo(0, r * 0.14);
      ctx.lineTo(0, -r * 0.58);
      ctx.strokeStyle = "rgba(255,255,255,0.8)";
      ctx.lineWidth = r > 45 ? 1.4 : 0.9;
      ctx.lineCap = "round";
      ctx.stroke();
      ctx.restore();

      // Second hand (only for larger bubbles)
      if (r > 42) {
        ctx.save();
        ctx.rotate(b.secondAngle);
        ctx.beginPath();
        ctx.moveTo(0, r * 0.18);
        ctx.lineTo(0, -r * 0.66);
        ctx.strokeStyle = "rgba(255,255,255,0.5)";
        ctx.lineWidth = 0.7;
        ctx.lineCap = "round";
        ctx.stroke();
        ctx.restore();
      }

      // Centre pivot
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.055, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.fill();

      // Top-left shine
      const shine = ctx.createRadialGradient(
        -r * 0.38, -r * 0.42, 0,
        -r * 0.38, -r * 0.42, r * 0.52
      );
      shine.addColorStop(0, "rgba(255,255,255,0.22)");
      shine.addColorStop(1, "rgba(255,255,255,0)");
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fillStyle = shine;
      ctx.fill();

      ctx.restore();
    }

    function update() {
      const W = cssW();
      const H = cssH();

      bubbles.forEach((b) => {
        // Gravity
        b.vy += GRAVITY;

        // Mouse repulsion
        const dx = b.x - mouseRef.current.x;
        const dy = b.y - mouseRef.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const repelZone = MOUSE_RADIUS + b.r;
        if (dist < repelZone && dist > 0) {
          const force = ((repelZone - dist) / repelZone) * MOUSE_FORCE;
          const angle = Math.atan2(dy, dx);
          b.vx += Math.cos(angle) * force;
          b.vy += Math.sin(angle) * force;
        }

        // Bubble–bubble soft repulsion
        bubbles.forEach((o) => {
          if (o === b) return;
          const ox = b.x - o.x;
          const oy = b.y - o.y;
          const od = Math.sqrt(ox * ox + oy * oy);
          const min = b.r + o.r + 3;
          if (od < min && od > 0) {
            const push = ((min - od) / min) * 0.45;
            const a = Math.atan2(oy, ox);
            b.vx += Math.cos(a) * push;
            b.vy += Math.sin(a) * push;
          }
        });

        // Clamp velocity so bubbles don't rocket off screen
        const maxV = 8;
        b.vx = Math.max(-maxV, Math.min(maxV, b.vx));
        b.vy = Math.max(-maxV, Math.min(maxV, b.vy));

        // Friction
        b.vx *= FRICTION;
        b.vy *= FRICTION;

        b.x += b.vx;
        b.y += b.vy;

        // Wall bounce
        if (b.x - b.r < 0)  { b.x = b.r;      b.vx *= -0.55; }
        if (b.x + b.r > W)  { b.x = W - b.r;   b.vx *= -0.55; }
        if (b.y - b.r < 0)  { b.y = b.r;       b.vy *= -0.55; }
        if (b.y + b.r > H)  { b.y = H - b.r;   b.vy *= -0.55; }

        // Advance clock hands
        b.secondAngle += b.timeSpeed * 6;
        b.minuteAngle += b.timeSpeed * 0.1;
        b.hourAngle   += b.timeSpeed * 0.0083;
      });
    }

    function loop() {
      // Clear using CSS pixels (scale already applied by devicePixelRatio)
      ctx.clearRect(0, 0, cssW(), cssH());
      update();
      bubbles.forEach(drawBubble);
      animId = requestAnimationFrame(loop);
    }
    loop();

    // Mouse events
    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };
    const onLeave = () => { mouseRef.current = { x: -9999, y: -9999 }; };

    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("mouseleave", onLeave);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <section className="subsection">
      <canvas ref={canvasRef} className="subsection-canvas" />
      <div className="subsection-content">
        <span className="subsection-eyebrow">Craftsmanship</span>
        <h2 className="subsection-title">Horological<br />Masterpiece</h2>
        <p className="subsection-subtitle">
          Every component is crafted, assembled, and finished by hand.
          A testament to our relentless pursuit of precision and design.
        </p>
      </div>
    </section>
  );
}