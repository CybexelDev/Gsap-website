import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./Footer.css";

gsap.registerPlugin(ScrollTrigger);

const LINK_GROUPS = [
  {
    heading: "Product",
    links: ["Overview", "Specifications", "Compare models", "Pricing"],
  },
  {
    heading: "Support",
    links: ["Help center", "Warranty", "Shipping", "Contact us"],
  },
  {
    heading: "Company",
    links: ["About", "Careers", "Press", "Sustainability"],
  },
];

export default function Footer() {
  const footerRef = useRef(null);
  const headlineRef = useRef(null);
  const formRef = useRef(null);
  const colRefs = useRef([]);
  const baseRef = useRef(null);

  useEffect(() => {
    const footer = footerRef.current;
    if (!footer) return;

    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const ctx = gsap.context(() => {
        gsap.fromTo(
          headlineRef.current,
          { y: 40, opacity: 0, filter: "blur(6px)" },
          {
            y: 0,
            opacity: 1,
            filter: "blur(0px)",
            duration: 1,
            ease: "power3.out",
            scrollTrigger: { trigger: footer, start: "top 85%" },
          }
        );

        gsap.fromTo(
          formRef.current,
          { y: 24, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: { trigger: footer, start: "top 80%" },
          }
        );

        gsap.fromTo(
          colRefs.current,
          { y: 24, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            ease: "power3.out",
            stagger: 0.1,
            scrollTrigger: { trigger: footer, start: "top 75%" },
          }
        );

        gsap.fromTo(
          baseRef.current,
          { opacity: 0 },
          {
            opacity: 1,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: { trigger: baseRef.current, start: "top 95%" },
          }
        );
      }, footerRef);

      return () => ctx.revert();
    });

    return () => mm.revert();
  }, []);

  const handleSubscribe = (e) => {
    e.preventDefault();
    const btn = e.currentTarget.querySelector(".footer-subscribe");
    gsap.fromTo(btn, { scale: 0.95 }, { scale: 1, duration: 0.3, ease: "power2.out" });
  };

  return (
    <footer className="site-footer" ref={footerRef}>
      <div className="footer-glow"></div>

      <div className="footer-inner">
        <div className="footer-top">
          <h2 className="footer-headline" ref={headlineRef}>
            Wear the future.
          </h2>

          <form className="footer-form glass-panel" ref={formRef} onSubmit={handleSubscribe}>
            <span className="footer-form-label">Stay in the loop</span>
            <div className="footer-form-row">
              <input type="email" placeholder="you@domain.com" required />
              <button type="submit" className="footer-subscribe">
                Subscribe
              </button>
            </div>
          </form>
        </div>

        <div className="footer-links">
          {LINK_GROUPS.map((group, i) => (
            <div className="footer-col" key={group.heading} ref={(el) => (colRefs.current[i] = el)}>
              <h4>{group.heading}</h4>
              <ul>
                {group.links.map((link) => (
                  <li key={link}>
                    <a href="#">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="footer-col footer-col-social" ref={(el) => (colRefs.current[3] = el)}>
            <h4>Follow</h4>
            <ul>
              <li><a href="#">Instagram</a></li>
              <li><a href="#">X / Twitter</a></li>
              <li><a href="#">YouTube</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-base" ref={baseRef}>
          <span>© {new Date().getFullYear()} Chronos. All rights reserved.</span>
          <div className="footer-base-links">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}