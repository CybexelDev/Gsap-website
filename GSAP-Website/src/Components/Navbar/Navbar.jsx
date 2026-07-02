import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import "./Navbar.css";

const NAV_LINKS = [
  { label: "FEATURES", href: "#features" },
  { label: "ABOUT", href: "#about" },
  { label: "SPECS", href: "#specs" },
  { label: "CONTACT", href: "#contact" },
];

export default function Navbar() {
  const navRef = useRef(null);
  const menuRef = useRef(null);
  const menuLinksRef = useRef([]);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  // Entrance animation
  useEffect(() => {
    gsap.fromTo(
      navRef.current,
      { y: -40, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.9, ease: "power3.out", delay: 0.2 }
    );
  }, []);

  // Scroll-state toggle (thicker glass once page has scrolled)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Mobile menu open/close animation
  useEffect(() => {
    if (!menuRef.current) return;

    const links = menuLinksRef.current.filter(Boolean);

    gsap.set(menuRef.current, {
      display: "none",
      opacity: 0,
      clipPath: "inset(0% 0% 100% 0% round 24px)",
    });

    const ctx = gsap.context(() => {
      if (open) {
        gsap.set(menuRef.current, { display: "flex" });
        gsap.to(menuRef.current, {
          opacity: 1,
          clipPath: "inset(0% 0% 0% 0% round 24px)",
          duration: 0.5,
          ease: "power3.out",
        });
        gsap.fromTo(
          links,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.4, ease: "power3.out", stagger: 0.06, delay: 0.15 }
        );
      } else {
        gsap.to(menuRef.current, {
          opacity: 0,
          clipPath: "inset(0% 0% 100% 0% round 24px)",
          duration: 0.35,
          ease: "power2.in",
          onComplete: () => gsap.set(menuRef.current, { display: "none" }),
        });
      }
    });

    return () => ctx.revert();
  }, [open]);

  return (
    <>
      <nav ref={navRef} className={`navbar glass-panel ${scrolled ? "is-scrolled" : ""}`}>
        <a href="#" className="nav-logo">CHRONOS</a>

        <ul className="nav-links">
          {NAV_LINKS.map((link) => (
            <li key={link.label}>
              <a href={link.href}>{link.label}</a>
            </li>
          ))}
        </ul>

        <div className="nav-actions">
          <button className="nav-cta">Pre-order</button>
          <button
            className={`nav-toggle ${open ? "is-open" : ""}`}
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            <span></span>
            <span></span>
          </button>
        </div>
      </nav>

      <div ref={menuRef} className="nav-mobile-menu glass-panel">
        {NAV_LINKS.map((link, i) => (
          <a
            key={link.label}
            href={link.href}
            ref={(el) => (menuLinksRef.current[i] = el)}
            onClick={() => setOpen(false)}
          >
            {link.label}
          </a>
        ))}
        <button className="nav-cta nav-cta-mobile" onClick={() => setOpen(false)}>
          Pre-order
        </button>
      </div>
    </>
  );
}
 