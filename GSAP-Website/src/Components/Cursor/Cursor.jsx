import { useEffect, useRef } from "react";
import gsap from "gsap";
import "./Cursor.css";

export default function Cursor() {
  const dotRef   = useRef(null);
  const ringRef  = useRef(null);
  const trailRef = useRef([]);
  const posRef   = useRef({ x: 0, y: 0 });
  const TRAIL    = 8;

  useEffect(() => {
    const dot  = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    // Hide native cursor everywhere
    document.body.style.cursor = "none";

    // ── Trail dots ─────────────────────────────────────────
    const trails = Array.from({ length: TRAIL }, (_, i) => {
      const el = document.createElement("div");
      el.className = "cursor-trail";
      el.style.setProperty("--i", i);
      document.body.appendChild(el);
      return { el, x: 0, y: 0 };
    });
    trailRef.current = trails;

    // ── Core position lerp loop ────────────────────────────
    let animId;
    function loop() {
      const { x, y } = posRef.current;

      // dot snaps
      gsap.set(dot, { x, y });

      // ring lags
      gsap.to(ring, { x, y, duration: 0.18, ease: "power2.out", overwrite: true });

      // trail lags progressively more
      trails.forEach((t, i) => {
        const delay = (i + 1) / TRAIL;
        gsap.to(t.el, {
          x: x, y: y,
          duration: 0.08 + delay * 0.35,
          ease: "power1.out",
          overwrite: true,
          onUpdate() {
            const cx = parseFloat(gsap.getProperty(t.el, "x"));
            const cy = parseFloat(gsap.getProperty(t.el, "y"));
            t.el.style.transform = `translate(${cx}px, ${cy}px) translate(-50%,-50%)`;
          }
        });
      });

      animId = requestAnimationFrame(loop);
    }
    loop();

    // ── Mouse move ─────────────────────────────────────────
    const onMove = (e) => {
      posRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", onMove);

    // ── Click burst ────────────────────────────────────────
    const onClick = (e) => {
      // Ripple
      const ripple = document.createElement("div");
      ripple.className = "cursor-ripple";
      ripple.style.left = e.clientX + "px";
      ripple.style.top  = e.clientY + "px";
      document.body.appendChild(ripple);

      gsap.fromTo(ripple,
        { scale: 0, opacity: 0.7 },
        {
          scale: 3.2, opacity: 0, duration: 0.55,
          ease: "power2.out",
          onComplete: () => ripple.remove(),
        }
      );

      // Dot pulse
      gsap.timeline()
        .to(dot, { scale: 0.35, duration: 0.1, ease: "power2.in" })
        .to(dot, { scale: 1,    duration: 0.4, ease: "elastic.out(1.4,0.5)" });

      // Ring squeeze
      gsap.timeline()
        .to(ring, { scale: 0.6, duration: 0.1 })
        .to(ring, { scale: 1,   duration: 0.5, ease: "elastic.out(1.2,0.5)" });
    };
    window.addEventListener("click", onClick);

    // ── Hover states ───────────────────────────────────────
    const addHover = () => {
      // Every interactive element gets the hover binding
      const targets = document.querySelectorAll(
        "a, button, input, textarea, select, [data-cursor], .spec-item, .sub-card, .feature-card, .annotation-card, .nav-links li, .footer-col a"
      );

      const enter = (el) => () => {
        const isText   = ["A","BUTTON"].includes(el.tagName);
        const isInput  = ["INPUT","TEXTAREA"].includes(el.tagName);

        gsap.to(ring, {
          scale: isInput ? 1.6 : 2.2,
          opacity: isInput ? 0.35 : 0.55,
          duration: 0.3, ease: "power2.out",
        });
        gsap.to(dot, {
          scale: isInput ? 0.5 : 0,
          opacity: isInput ? 0.6 : 0,
          duration: 0.25,
        });
        el.classList.add("cursor-hovering");
      };

      const leave = (el) => () => {
        gsap.to(ring, { scale: 1, opacity: 1, duration: 0.35, ease: "power2.out" });
        gsap.to(dot,  { scale: 1, opacity: 1, duration: 0.25 });
        el.classList.remove("cursor-hovering");
      };

      targets.forEach((el) => {
        const fn_in  = enter(el);
        const fn_out = leave(el);
        el.addEventListener("mouseenter", fn_in);
        el.addEventListener("mouseleave", fn_out);
        el._cursorIn  = fn_in;
        el._cursorOut = fn_out;
      });
    };

    // Run once + re-run after a tick for dynamically mounted elements
    addHover();
    const t = setTimeout(addHover, 800);

    // ── Cursor leaves window ───────────────────────────────
    const onLeave = () => gsap.to([dot, ring], { opacity: 0, duration: 0.3 });
    const onEnter = () => gsap.to([dot, ring], { opacity: 1, duration: 0.3 });
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);

    return () => {
      cancelAnimationFrame(animId);
      document.body.style.cursor = "";
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("click", onClick);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
      trails.forEach((t) => t.el.remove());
      clearTimeout(t);
    };
  }, []);

  return (
    <>
      <div ref={ringRef}  className="cursor-ring"  />
      <div ref={dotRef}   className="cursor-dot"   />
    </>
  );
}