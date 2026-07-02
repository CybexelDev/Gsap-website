import { useEffect } from "react";
import gsap from "gsap";

export default function GlobalEffects() {
  useEffect(() => {
    // ── Magnetic pull on buttons ──────────────────────────
    const applyMagnetic = () => {
      document.querySelectorAll("button, .nav-cta, .product-btn-primary, .contact-submit, .footer-subscribe").forEach((btn) => {
        if (btn._magnetic) return;
        btn._magnetic = true;

        const onMove = (e) => {
          const rect = btn.getBoundingClientRect();
          const dx   = (e.clientX - (rect.left + rect.width  / 2));
          const dy   = (e.clientY - (rect.top  + rect.height / 2));
          gsap.to(btn, {
            x: dx * 0.28,
            y: dy * 0.28,
            duration: 0.35,
            ease: "power2.out",
          });
        };
        const onLeave = () => {
          gsap.to(btn, { x: 0, y: 0, duration: 0.55, ease: "elastic.out(1.1,0.5)" });
        };
        btn.addEventListener("mousemove", onMove);
        btn.addEventListener("mouseleave", onLeave);
      });
    };

    // ── Click particle burst ──────────────────────────────
    const onClick = (e) => {
      const count = 9;
      for (let i = 0; i < count; i++) {
        const p = document.createElement("div");
        p.style.cssText = `
          position:fixed;
          top:${e.clientY}px;
          left:${e.clientX}px;
          width:${3 + Math.random() * 4}px;
          height:${3 + Math.random() * 4}px;
          border-radius:50%;
          background:rgba(255,255,255,${0.4 + Math.random() * 0.55});
          pointer-events:none;
          z-index:99996;
          transform:translate(-50%,-50%);
          will-change:transform,opacity;
        `;
        document.body.appendChild(p);
        const angle = (i / count) * Math.PI * 2;
        const dist  = 28 + Math.random() * 55;
        gsap.to(p, {
          x: Math.cos(angle) * dist,
          y: Math.sin(angle) * dist,
          opacity: 0,
          scale: 0.2,
          duration: 0.45 + Math.random() * 0.35,
          ease: "power2.out",
          onComplete: () => p.remove(),
        });
      }
    };

    // ── Section enter highlight ───────────────────────────
    const applyHoverShimmer = () => {
      document.querySelectorAll(".glass-panel").forEach((panel) => {
        if (panel._shimmer) return;
        panel._shimmer = true;

        const onMove = (e) => {
          const rect = panel.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width)  * 100;
          const y = ((e.clientY - rect.top)  / rect.height) * 100;
          panel.style.setProperty("--mx", `${x}%`);
          panel.style.setProperty("--my", `${y}%`);
          panel.classList.add("panel-lit");
        };
        const onLeave = () => panel.classList.remove("panel-lit");
        panel.addEventListener("mousemove", onMove);
        panel.addEventListener("mouseleave", onLeave);
      });
    };

    applyMagnetic();
    applyHoverShimmer();
    window.addEventListener("click", onClick);
    const t = setTimeout(() => { applyMagnetic(); applyHoverShimmer(); }, 800);

    return () => {
      window.removeEventListener("click", onClick);
      clearTimeout(t);
    };
  }, []);

  return null;
}