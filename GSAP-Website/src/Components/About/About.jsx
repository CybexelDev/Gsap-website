import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./about.css";

gsap.registerPlugin(ScrollTrigger);

const LEFT_ANNOTATIONS = [
  {
    index: "01",
    title: "Premium design",
    desc: "Aerospace-grade titanium, machined to a tolerance of 0.02mm.",
  },
  {
    index: "02",
    title: "Sapphire glass",
    desc: "Scratch-resistant crystal, polished to optical clarity.",
  },
];

const RIGHT_ANNOTATIONS = [
  {
    index: "03",
    title: "Powerful performance",
    desc: "Industry-leading chip, tuned for instant response.",
  },
  {
    index: "04",
    title: "14-day battery",
    desc: "Two weeks per charge. No nightly ritual required.",
  },
];

const STATS = [
  { value: "85+", label: "Frames" },
  { value: "4K", label: "Display" },
  { value: "100%", label: "Premium" },
];

export default function About() {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const imageRef = useRef(null);
  const leftLineRefs = useRef([]);
  const rightLineRefs = useRef([]);
  const leftCardRefs = useRef([]);
  const rightCardRefs = useRef([]);
  const statsRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const allLines = [...leftLineRefs.current, ...rightLineRefs.current];
    const allCards = [...leftCardRefs.current, ...rightCardRefs.current];

    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const ctx = gsap.context(() => {
        gsap.set(allLines, { scaleX: 0 });
        gsap.set(allCards, { opacity: 0, y: 24, scale: 0.94, filter: "blur(8px)" });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "+=2800",
            scrub: 1,
            pin: true,
          },
        });

        tl.from(titleRef.current, { y: 80, opacity: 0, duration: 1, ease: "power3.out" })
          .from(
            imageRef.current,
            { scale: 0.6, opacity: 0, rotation: -8, duration: 1, ease: "power3.out" },
            "-=0.3"
          );

        // Interleave left/right pairs so both sides reveal together, row by row
        const rows = Math.max(LEFT_ANNOTATIONS.length, RIGHT_ANNOTATIONS.length);
        for (let r = 0; r < rows; r++) {
          const labelTime = r === 0 ? ">-0.1" : "<0.25";

          if (leftLineRefs.current[r]) {
            tl.to(leftLineRefs.current[r], { scaleX: 1, duration: 0.5, ease: "power2.inOut" }, labelTime)
              .to(
                leftCardRefs.current[r],
                { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", duration: 0.5, ease: "power3.out" },
                "<0.1"
              );
          }
          if (rightLineRefs.current[r]) {
            tl.to(rightLineRefs.current[r], { scaleX: 1, duration: 0.5, ease: "power2.inOut" }, labelTime)
              .to(
                rightCardRefs.current[r],
                { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", duration: 0.5, ease: "power3.out" },
                "<0.1"
              );
          }
        }

        tl.from(
          statsRef.current.querySelectorAll(".stat"),
          { y: 60, opacity: 0, stagger: 0.15, duration: 0.6, ease: "power3.out" },
          "+=0.2"
        );

        gsap.to(imageRef.current, {
          rotation: 3,
          duration: 4,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        });
      }, sectionRef);

      return () => ctx.revert();
    });

    return () => mm.revert();
  }, []);

  return (
    <section ref={sectionRef} className="about">
      <span className="about-eyebrow">Anatomy</span>
      <h1 ref={titleRef} className="about-title">
        CRAFTED FOR THE FUTURE
      </h1>

      <div className="about-stage">
        {/* LEFT COLUMN */}
        <div className="annotation-col col-left">
          {LEFT_ANNOTATIONS.map((a, i) => (
            <div className="annotation-row row-left" key={a.index}>
              <div
                className="annotation-card glass-panel"
                ref={(el) => (leftCardRefs.current[i] = el)}
              >
                <span className="annotation-index">{a.index}</span>
                <h3>{a.title}</h3>
                <p>{a.desc}</p>
              </div>
              <div className="leader-line" ref={(el) => (leftLineRefs.current[i] = el)} />
              <div className="leader-dot" />
            </div>
          ))}
        </div>

        {/* CENTER WATCH */}
        <div className="about-image-wrap">
          <div className="about-image" ref={imageRef}>
            <img src="/img/ff.png" alt="Watch" />
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="annotation-col col-right">
          {RIGHT_ANNOTATIONS.map((a, i) => (
            <div className="annotation-row row-right" key={a.index}>
              <div className="leader-dot" />
              <div className="leader-line" ref={(el) => (rightLineRefs.current[i] = el)} />
              <div
                className="annotation-card glass-panel"
                ref={(el) => (rightCardRefs.current[i] = el)}
              >
                <span className="annotation-index">{a.index}</span>
                <h3>{a.title}</h3>
                <p>{a.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="stats" ref={statsRef}>
        {STATS.map((s) => (
          <div className="stat" key={s.label}>
            <h2>{s.value}</h2>
            <p>{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}