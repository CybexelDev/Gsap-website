import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./Features.css";

gsap.registerPlugin(ScrollTrigger);

const FEATURES = [
  { index: "01", title: "Titanium case", desc: "Aerospace-grade titanium shell, 38% lighter than steel, engineered to survive a drop from orbit (figuratively)." },
  { index: "02", title: "Always-on display", desc: "1000 nits of micro-LED clarity, visible in direct sunlight, invisible to your battery anxiety." },
  { index: "03", title: "14-day battery", desc: "A full two weeks on a single charge, because the future shouldn't need a nightly ritual." },
  { index: "04", title: "Sapphire glass", desc: "Scratch-resistant to nearly everything except diamond, which we assume you're not wearing on the other wrist." },
];

export default function Features() {
  const sectionRef = useRef(null);
  const dialRef = useRef(null);
  const needleRef = useRef(null);
  const indexRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    const section = sectionRef.current;
    const cards = cardsRef.current.filter(Boolean);
    if (!section || cards.length === 0) return;

    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const ctx = gsap.context(() => {
        // Set initial state directly with gsap.set (not a tween) so nothing
        // lingers as an inline style fighting later updates
        gsap.set(cards, { opacity: 0.35, y: 0 });
        gsap.set(cards[0], { opacity: 1 });

        const st = ScrollTrigger.create({
          trigger: section,
          start: "top top",
          end: () => `+=${cards.length * 600}`,
          pin: true,
          scrub: true,
          onUpdate: (self) => {
            const progress = self.progress;
            const total = cards.length;
            const activeIdx = Math.min(total - 1, Math.floor(progress * total));

            // Rotation set directly off progress — no separate tween, no lag
            gsap.set(needleRef.current, { svgOrigin: "120 120", rotation: progress * 360 * 2 });

            if (indexRef.current) {
              indexRef.current.textContent = FEATURES[activeIdx].index;
            }

            cards.forEach((card, i) => {
              const isActive = i === activeIdx;
              gsap.set(card, { opacity: isActive ? 1 : 0.35 });
              card.classList.toggle("is-active", isActive);
            });
          },
        });

        // Entrance for the dial (separate from card opacity logic above)
        gsap.fromTo(
          dialRef.current,
          { opacity: 0, scale: 0.85, filter: "blur(12px)" },
          {
            opacity: 1,
            scale: 1,
            filter: "blur(0px)",
            duration: 1,
            ease: "power3.out",
            scrollTrigger: { trigger: section, start: "top 85%" },
          }
        );

        // Entrance slide-up for the card stack — only animates y, leaves
        // opacity to the gsap.set calls above so they don't collide
        gsap.fromTo(
          cards,
          { y: 30 },
          {
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            stagger: 0.1,
            scrollTrigger: { trigger: section, start: "top 80%" },
          }
        );

        return () => st.kill();
      }, sectionRef);

      return () => ctx.revert();
    });

    return () => mm.revert();
  }, []);

  return (
    <section className="features" id="features" ref={sectionRef}>
      <div className="features-inner">
        <div className="dial-wrap">
          <div className="dial glass-panel" ref={dialRef}>
            <svg className="dial-face" viewBox="0 0 240 240">
              <circle cx="120" cy="120" r="108" className="dial-ring" />
              {Array.from({ length: 12 }).map((_, i) => (
                <line key={i} x1="120" y1="18" x2="120" y2="30" className="dial-tick" transform={`rotate(${i * 30} 120 120)`} />
              ))}
              <g
                ref={needleRef}
                style={{ transformBox: "view-box", transformOrigin: "120px 120px" }}
              >
                <line x1="120" y1="120" x2="120" y2="40" className="dial-needle" />
              </g>
              <circle cx="120" cy="120" r="4" className="dial-pivot" />
            </svg>
            <div className="dial-readout">
              <span className="dial-index" ref={indexRef}>01</span>
              <span className="dial-total">/ 04</span>
            </div>
          </div>
        </div>

        <div className="features-list">
          <span className="features-eyebrow">Specifications</span>
          {FEATURES.map((f, i) => (
            <div
              className="feature-card glass-panel"
              key={f.index}
              ref={(el) => (cardsRef.current[i] = el)}
            >
              <span className="feature-index">{f.index}</span>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}