import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./Products.css";

gsap.registerPlugin(ScrollTrigger);

const PRODUCTS = [
  {
    id: "01",
    name: "Chronos One",
    tagline: "The genesis of precision.",
    price: "$2,400",
    image: "/img/w3.png", // ← swap your image paths per product
    specs: [
      { label: "Case material", value: "Titanium" },
      { label: "Crystal", value: "Sapphire" },
      { label: "Power reserve", value: "72 hours" },
      { label: "Water resistance", value: "50m" },
    ],
  },
  {
    id: "02",
    name: "Chronos Pro",
    tagline: "Engineered without compromise.",
    price: "$3,800",
    image: "/img/w1.png",
    specs: [
      { label: "Case material", value: "Gold PVD" },
      { label: "Movement", value: "Tourbillon" },
      { label: "Power reserve", value: "14 days" },
      { label: "Water resistance", value: "100m" },
    ],
  },
  {
    id: "03",
    name: "Chronos Ultra",
    tagline: "The summit of horology.",
    price: "$5,200",
    image: "/img/w2.png",
    specs: [
      { label: "Case material", value: "Ceramic" },
      { label: "Calendar", value: "Perpetual" },
      { label: "Power reserve", value: "21 days" },
      { label: "Water resistance", value: "200m" },
    ],
  },
];

export default function Products() {
  const sectionRef      = useRef(null);
  const slideRefs       = useRef([]);
  const imgRefs         = useRef([]);
  const imgWrapRefs     = useRef([]);
  const counterRef      = useRef(null);
  const progressFillRef = useRef(null);
  const dotRefs         = useRef([]);

  useEffect(() => {
    const section  = sectionRef.current;
    const slides   = slideRefs.current.filter(Boolean);
    const imgs     = imgRefs.current.filter(Boolean);
    const imgWraps = imgWrapRefs.current.filter(Boolean);
    if (!section || slides.length === 0) return;

    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      // ── Initial state ─────────────────────────────────────
      gsap.set(slides, { opacity: 0, x: 70 });
      gsap.set(imgs, { scale: 0.8, rotation: 12 });

      // Pre-hide all spec items so stagger works cleanly on enter
      const allSpecs = section.querySelectorAll(".spec-item");
      gsap.set(allSpecs, { opacity: 0, x: 40 });

      // ── Main timeline ─────────────────────────────────────
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: `+=${PRODUCTS.length * 1400}`,
          pin: true,
          scrub: 0.8,
          anticipatePin: 1,
          onUpdate(self) {
            const prog = self.progress;
            const idx  = Math.min(PRODUCTS.length - 1, Math.floor(prog * PRODUCTS.length));

            if (counterRef.current) {
              counterRef.current.textContent =
                `${String(idx + 1).padStart(2, "0")} / ${String(PRODUCTS.length).padStart(2, "0")}`;
            }
            if (progressFillRef.current) {
              progressFillRef.current.style.transform = `scaleX(${prog})`;
            }
            dotRefs.current.forEach((dot, di) => {
              if (dot) dot.classList.toggle("is-active", di === idx);
            });
          },
        },
      });

      // Product 1 enters
      tl.to(slides[0], { opacity: 1, x: 0, duration: 0.8, ease: "power3.out" });
      tl.to(imgs[0],   { scale: 1, rotation: 0, duration: 1,   ease: "power3.out" }, "<");

      const specs0 = slides[0].querySelectorAll(".spec-item");
      tl.fromTo(specs0,
        { opacity: 0, x: 40 },
        { opacity: 1, x: 0, stagger: 0.09, duration: 0.55, ease: "power2.out" },
        "<0.3"
      );
      tl.to({}, { duration: 0.8 }); // hold

      // Subsequent products
      for (let i = 1; i < PRODUCTS.length; i++) {
        // Exit previous
        tl.to(slides[i - 1], { opacity: 0, x: -70, duration: 0.5, ease: "power2.in" });
        tl.to(imgs[i - 1],   { scale: 0.8, rotation: -12, duration: 0.5 }, "<");

        // Enter current
        tl.fromTo(slides[i],
          { opacity: 0, x: 70 },
          { opacity: 1, x: 0, duration: 0.8, ease: "power3.out" },
          "<0.2"
        );
        tl.fromTo(imgs[i],
          { scale: 0.8, rotation: 12 },
          { scale: 1, rotation: 0, duration: 1, ease: "power3.out" },
          "<"
        );

        const specsI = slides[i].querySelectorAll(".spec-item");
        tl.fromTo(specsI,
          { opacity: 0, x: 40 },
          { opacity: 1, x: 0, stagger: 0.09, duration: 0.55, ease: "power2.out" },
          "<0.3"
        );
        tl.to({}, { duration: i === PRODUCTS.length - 1 ? 1 : 0.8 });
      }

      // ── 3D tilt on each watch image ───────────────────────
      const cleanups = imgWraps.map((wrap) => {
        const onMove = (e) => {
          const r  = wrap.getBoundingClientRect();
          const dx = (e.clientX - (r.left + r.width  / 2)) / (r.width  / 2);
          const dy = (e.clientY - (r.top  + r.height / 2)) / (r.height / 2);
          gsap.to(wrap, {
            rotateY: dx * 20,
            rotateX: -dy * 20,
            scale: 1.04,
            duration: 0.35,
            ease: "power2.out",
            transformPerspective: 1000,
          });
        };
        const onLeave = () => {
          gsap.to(wrap, { rotateY: 0, rotateX: 0, scale: 1, duration: 0.7, ease: "power3.out" });
        };
        wrap.addEventListener("mousemove", onMove);
        wrap.addEventListener("mouseleave", onLeave);
        return () => {
          wrap.removeEventListener("mousemove", onMove);
          wrap.removeEventListener("mouseleave", onLeave);
        };
      });

      return () => {
        cleanups.forEach((fn) => fn());
      };
    });

    return () => mm.revert();
  }, []);

  return (
    <section ref={sectionRef} className="products-section">
      <div className="products-bg-grid" />
      <div className="products-bg-orb" />

      {/* Top bar */}
      <div className="products-topbar">
        <span className="products-eyebrow">// Collection</span>
        <span className="products-counter" ref={counterRef}>01 / 0{PRODUCTS.length}</span>
      </div>

      {/* Stacked slides */}
      <div className="products-stage">
        {PRODUCTS.map((p, i) => (
          <div
            key={p.id}
            className="product-slide"
            ref={(el) => (slideRefs.current[i] = el)}
          >
            {/* Left: info */}
            <div className="product-info">
              <span className="product-id-badge">{p.id}</span>
              <h2 className="product-name">{p.name}</h2>
              <p className="product-tagline">{p.tagline}</p>
              <p className="product-price">{p.price}</p>
              <div className="product-actions">
                <button className="product-btn-primary">Order now</button>
                <button className="product-btn-ghost">Explore →</button>
              </div>
            </div>

            {/* Center: watch */}
            <div
              className="product-image-wrap"
              ref={(el) => (imgWrapRefs.current[i] = el)}
            >
              <div className="product-image-glow" />
              <img
                src={p.image}
                alt={p.name}
                ref={(el) => (imgRefs.current[i] = el)}
                className="product-img"
                draggable={false}
              />
            </div>

            {/* Right: specs */}
            <div className="product-specs">
              {p.specs.map((spec) => (
                <div key={spec.label} className="spec-item glass-panel">
                  <span className="spec-label">{spec.label}</span>
                  <span className="spec-value">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="products-bottom">
        <div className="products-dots">
          {PRODUCTS.map((_, i) => (
            <div
              key={i}
              className="products-dot"
              ref={(el) => (dotRefs.current[i] = el)}
            />
          ))}
        </div>
        <div className="products-progress-track">
          <div className="products-progress-fill" ref={progressFillRef} />
        </div>
      </div>
    </section>
  );
}