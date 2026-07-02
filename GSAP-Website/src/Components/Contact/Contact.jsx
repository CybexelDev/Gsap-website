import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./Contact.css";

gsap.registerPlugin(ScrollTrigger);

const STONE_COUNT  = 208;
const GRAVITY      = 0.024;
const FRICTION     = 0.997;
const MOUSE_RADIUS = 115;
const MOUSE_FORCE  = 4.8;

const rand = (a, b) => a + Math.random() * (b - a);

function makeStone(W, H) {
  const r     = rand(13, 32);
  const sides = Math.floor(rand(5, 8));
  const verts = Array.from({ length: sides }, (_, i) => {
    const a = (i / sides) * Math.PI * 2;
    const j = rand(0.7, 1.3);
    return { dx: Math.cos(a) * r * j, dy: Math.sin(a) * r * j };
  });
  return {
    x: rand(r, W - r), y: rand(-H * 0.4, H * 0.05),
    vx: rand(-0.6, 0.6), vy: rand(0, 0.7),
    r, verts,
    angle: rand(0, Math.PI * 2),
    av: rand(-0.007, 0.007),
  };
}

export default function Contact() {
  const sectionRef    = useRef(null);
  const canvasRef     = useRef(null);
  const blobRef       = useRef(null);
  const cursorGlowRef = useRef(null);
  const eyebrowRef    = useRef(null);
  const titleRef      = useRef(null);
  const subRef        = useRef(null);
  const panelRef      = useRef(null);
  const sheenRef      = useRef(null);
  const mouseRef      = useRef({ x: -9999, y: -9999 });

  // ── Stone physics canvas ─────────────────────────────────
  useEffect(() => {
    const canvas  = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;
    const ctx = canvas.getContext("2d");
    let animId;

    const cssW = () => canvas.offsetWidth;
    const cssH = () => canvas.offsetHeight;

    function resize() {
      canvas.width  = cssW() * window.devicePixelRatio;
      canvas.height = cssH() * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }
    resize();
    window.addEventListener("resize", resize);

    const stones = Array.from({ length: STONE_COUNT }, () =>
      makeStone(cssW(), cssH())
    );

    // Re-trace the stone polygon on the context
    function trace(verts) {
      ctx.beginPath();
      verts.forEach((v, i) =>
        i === 0 ? ctx.moveTo(v.dx, v.dy) : ctx.lineTo(v.dx, v.dy)
      );
      ctx.closePath();
    }

    function draw(s) {
      const { x, y, verts, angle, r } = s;
      const { x: mx, y: my } = mouseRef.current;
      const dist  = Math.hypot(x - mx, y - my);
      const prox  = Math.max(0, 1 - dist / (MOUSE_RADIUS * 2.4));
      // Mouse direction in stone's LOCAL space
      const mAng  = Math.atan2(my - y, mx - x) - angle;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);

      // ── Clipped interior ──
      trace(verts);
      ctx.save();
      ctx.clip();

      // Base glass fill
      trace(verts);
      ctx.fillStyle = `rgba(255,255,255,${0.045 + prox * 0.11})`;
      ctx.fill();

      // 3-D face shading: each triangular face lit by mouse direction
      for (let i = 0; i < verts.length; i++) {
        const v1 = verts[i];
        const v2 = verts[(i + 1) % verts.length];
        const faceAng = Math.atan2(
          (v1.dy + v2.dy) / 2,
          (v1.dx + v2.dx) / 2
        );
        const dot = Math.max(0, Math.cos(faceAng - mAng));
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(v1.dx, v1.dy);
        ctx.lineTo(v2.dx, v2.dy);
        ctx.closePath();
        ctx.fillStyle = `rgba(255,255,255,${0.01 + dot * prox * 0.24})`;
        ctx.fill();
      }

      // Specular highlight gradient (top-left of stone)
      const sg = ctx.createRadialGradient(
        -r * 0.3, -r * 0.33, 0,
        -r * 0.3, -r * 0.33, r * 0.75
      );
      sg.addColorStop(0, `rgba(255,255,255,${0.22 + prox * 0.4})`);
      sg.addColorStop(1, "rgba(255,255,255,0)");
      trace(verts);
      ctx.fillStyle = sg;
      ctx.fill();

      ctx.restore(); // ── end clip ──

      // Border (brighter on hover)
      trace(verts);
      ctx.strokeStyle = `rgba(255,255,255,${0.16 + prox * 0.62})`;
      ctx.lineWidth = 0.7 + prox * 1.6;
      ctx.stroke();

      // Star glint on close hover
      if (prox > 0.46) {
        const ga = (prox - 0.46) / 0.54;
        const gs = r * 0.5 * ga;
        ctx.save();
        ctx.translate(-r * 0.27, -r * 0.29);
        for (let a = 0; a < 4; a++) {
          ctx.save();
          ctx.rotate((a / 4) * Math.PI * 2 + Math.PI / 8);
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(gs * 0.1, gs * 0.1);
          ctx.lineTo(0, gs);
          ctx.lineTo(-gs * 0.1, gs * 0.1);
          ctx.closePath();
          ctx.fillStyle = `rgba(255,255,255,${ga * 0.95})`;
          ctx.fill();
          ctx.restore();
        }
        ctx.restore();
      }

      ctx.restore();
    }

    function update(s) {
      const W = cssW(), H = cssH();
      const { x: mx, y: my } = mouseRef.current;

      s.vy += GRAVITY;

      // Mouse repulsion
      const dx = s.x - mx, dy = s.y - my;
      const dist = Math.hypot(dx, dy);
      const zone = MOUSE_RADIUS + s.r;
      if (dist < zone && dist > 0) {
        const f = ((zone - dist) / zone) * MOUSE_FORCE;
        const a = Math.atan2(dy, dx);
        s.vx += Math.cos(a) * f;
        s.vy += Math.sin(a) * f;
      }

      // Stone–stone soft repulsion
      stones.forEach((o) => {
        if (o === s) return;
        const ox = s.x - o.x, oy = s.y - o.y;
        const od = Math.hypot(ox, oy);
        const mn = s.r + o.r + 2;
        if (od < mn && od > 0) {
          const push = ((mn - od) / mn) * 0.28;
          const a = Math.atan2(oy, ox);
          s.vx += Math.cos(a) * push;
          s.vy += Math.sin(a) * push;
        }
      });

      const mv = 9;
      s.vx = Math.max(-mv, Math.min(mv, s.vx)) * FRICTION;
      s.vy = Math.max(-mv, Math.min(mv, s.vy)) * FRICTION;
      s.x += s.vx; s.y += s.vy;
      s.angle += s.av;

      if (s.x - s.r < 0)  { s.x = s.r;     s.vx *= -0.5; s.av *= -0.75; }
      if (s.x + s.r > W)  { s.x = W - s.r; s.vx *= -0.5; s.av *= -0.75; }
      if (s.y - s.r < 0)  { s.y = s.r;     s.vy *= -0.5; }
      if (s.y + s.r > H)  { s.y = H - s.r; s.vy *= -0.55; s.vx *= 0.88; }
    }

    function loop() {
      ctx.clearRect(0, 0, cssW(), cssH());
      stones.forEach(update);
      stones.forEach(draw);
      animId = requestAnimationFrame(loop);
    }
    loop();

    // Cursor glow init
    if (cursorGlowRef.current) {
      gsap.set(cursorGlowRef.current, { xPercent: -50, yPercent: -50, opacity: 0 });
    }

    const onMove = (e) => {
      const rect = section.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      mouseRef.current = { x, y };
      gsap.to(cursorGlowRef.current, {
        x, y, opacity: 1,
        duration: 0.22, ease: "power2.out", overwrite: true,
      });
    };
    const onLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 };
      gsap.to(cursorGlowRef.current, { opacity: 0, duration: 0.6, overwrite: true });
    };

    section.addEventListener("mousemove", onMove);
    section.addEventListener("mouseleave", onLeave);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      section.removeEventListener("mousemove", onMove);
      section.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  // ── GSAP scroll animations ────────────────────────────────
  useEffect(() => {
    const section = sectionRef.current;
    if (!section || !panelRef.current) return;
    const fields = panelRef.current.querySelectorAll("[data-field]");
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const ctx = gsap.context(() => {
        // Blob idle drift
        gsap.to(blobRef.current, {
          x: 50, y: -40, duration: 9,
          ease: "sine.inOut", repeat: -1, yoyo: true,
        });
        // Scroll parallax
        gsap.to(blobRef.current, {
          y: "+=180", x: "+=90", scale: 1.3, ease: "none",
          scrollTrigger: {
            trigger: section, start: "top bottom",
            end: "bottom top", scrub: true,
          },
        });

        gsap.fromTo(
          [eyebrowRef.current, titleRef.current, subRef.current],
          { y: 24, opacity: 0, filter: "blur(8px)" },
          {
            y: 0, opacity: 1, filter: "blur(0px)",
            duration: 1, ease: "power3.out", stagger: 0.1,
            scrollTrigger: { trigger: section, start: "top 78%" },
          }
        );

        gsap.fromTo(panelRef.current,
          { opacity: 0, y: 40, scale: 0.94, filter: "blur(18px)" },
          {
            opacity: 1, y: 0, scale: 1, filter: "blur(0px)",
            duration: 1.1, ease: "power3.out",
            scrollTrigger: { trigger: panelRef.current, start: "top 85%" },
          }
        );

        gsap.fromTo(sheenRef.current,
          { xPercent: -120 },
          {
            xPercent: 220, duration: 1.4, ease: "power2.inOut",
            scrollTrigger: { trigger: panelRef.current, start: "top 80%" },
          }
        );

        gsap.fromTo(fields,
          { y: 18, opacity: 0, scale: 0.97 },
          {
            y: 0, opacity: 1, scale: 1,
            duration: 0.7, ease: "power3.out", stagger: 0.08,
            scrollTrigger: { trigger: panelRef.current, start: "top 78%" },
          }
        );
      }, sectionRef);

      return () => ctx.revert();
    });

    return () => mm.revert();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const btn = e.currentTarget.querySelector(".contact-submit");
    gsap.fromTo(btn, { scale: 0.96 }, { scale: 1, duration: 0.35, ease: "power2.out" });
  };

  return (
    <section className="contact" id="contact" ref={sectionRef}>
      <div className="contact-blob" ref={blobRef} />
      <canvas ref={canvasRef} className="contact-canvas" />
      <div className="contact-cursor-glow" ref={cursorGlowRef} />

      <div className="contact-inner">
        <div className="contact-head">
          <span className="contact-eyebrow" ref={eyebrowRef}>Contact</span>
          <h2 className="contact-title" ref={titleRef}>Let's talk.</h2>
          <p className="contact-sub" ref={subRef}>
            Tell us a bit about what you're working on, and we'll get back to you shortly.
          </p>
        </div>

        <form className="contact-form glass-panel" ref={panelRef} onSubmit={handleSubmit} noValidate>
          <div className="glass-sheen" ref={sheenRef} />

          <div className="field" data-field>
            <label htmlFor="cf-name">Name</label>
            <input type="text" id="cf-name" name="name" placeholder="Your name" required />
          </div>

          <div className="field" data-field>
            <label htmlFor="cf-email">Email</label>
            <input type="email" id="cf-email" name="email" placeholder="you@domain.com" required />
          </div>

          <div className="field" data-field>
            <label htmlFor="cf-subject">Subject</label>
            <input type="text" id="cf-subject" name="subject" placeholder="What's this about?" />
          </div>

          <div className="field field-textarea" data-field>
            <label htmlFor="cf-message">Message</label>
            <textarea id="cf-message" name="message" rows="4" placeholder="Type your message..." required />
          </div>

          <button type="submit" className="contact-submit" data-field>
            Send message
          </button>
        </form>
      </div>
    </section>
  );
}