import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './WatchHero.css';

gsap.registerPlugin(ScrollTrigger);

export default function WatchHero() {
  const canvasRef = useRef(null);
  const preloaderRef = useRef(null);
  const imagesRef = useRef([]);
  const watchObjRef = useRef({ frame: 0 });

  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loaderDone, setLoaderDone] = useState(false);

  // Helper to map index (0 to 276) to unique image array index (0 to 138)
  const getFrameImage = (index) => {
    if (index < 139) {
      return imagesRef.current[index] || imagesRef.current[0];
    } else {
      const uniqueIndex = 276 - index;
      return imagesRef.current[uniqueIndex] || imagesRef.current[0];
    }
  };

  // Canvas Drawing Function
  const drawFrame = (index) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = getFrameImage(index);
    if (!img || !img.complete) return;

    const dpr = window.devicePixelRatio || 1;
    const canvasWidth = canvas.width / dpr;
    const canvasHeight = canvas.height / dpr;

    // Clear Canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const imgWidth = img.naturalWidth || img.width;
    const imgHeight = img.naturalHeight || img.height;
    if (!imgWidth || !imgHeight) return;

    // Calculate Responsive Sizing: Full viewport width
    const targetWidth = canvasWidth;
    const targetHeight = canvasWidth * (imgHeight / imgWidth);

    // Center Coordinates
    const x = (canvasWidth - targetWidth) / 2;
    const y = (canvasHeight - targetHeight) / 2;

    // Set Crisp Drawing Rules
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    ctx.drawImage(img, x * dpr, y * dpr, targetWidth * dpr, targetHeight * dpr);
  };

  // 1. Initial Load: Load Frame 1 and then Preload Remaining frames
  useEffect(() => {
    const totalFrames = 139;
    let loadedCount = 0;

    // Pre-fill the array to hold images
    imagesRef.current = new Array(totalFrames);

    // Load Frame 1 Immediately
    const frame1 = new Image();
    frame1.src = '/images/ezgif-frame-001.jpg';
    frame1.onload = () => {
      imagesRef.current[0] = frame1;
      // Draw first frame immediately
      drawFrame(0);

      // Now load the other 138 frames
      for (let i = 2; i <= totalFrames; i++) {
        const img = new Image();
        img.src = `/images/ezgif-frame-${String(i).padStart(3, '0')}.jpg`;
        
        img.onload = () => {
          imagesRef.current[i - 1] = img;
          loadedCount++;
          
          const percent = Math.round((loadedCount / (totalFrames - 1)) * 100);
          setProgress(percent);

          if (loadedCount === totalFrames - 1) {
            setIsLoading(false);
          }
        };

        img.onerror = () => {
          console.warn(`Failed to preload watch frame ${i}`);
          loadedCount++;
          const percent = Math.round((loadedCount / (totalFrames - 1)) * 100);
          setProgress(percent);
          if (loadedCount === totalFrames - 1) {
            setIsLoading(false);
          }
        };
      }
    };

    frame1.onerror = () => {
      console.error('Failed to load initial watch frame');
      setIsLoading(false);
    };
  }, []);

  // 2. Preloader Fade-out Animation
  useEffect(() => {
    if (isLoading) return;

    // Create a timeline to fade out preloader and reveal content
    const tl = gsap.timeline({
      onComplete: () => {
        setLoaderDone(true);
      }
    });

    tl.to(preloaderRef.current, {
      opacity: 0,
      duration: 0.8,
      ease: 'power2.out'
    });

  }, [isLoading]);

  // 3. ScrollTrigger Setup and Canvas Buffer Resizing
  useEffect(() => {
    if (!loaderDone) return;

    // Handle canvas buffer resizing
    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const dpr = window.devicePixelRatio || 1;

      canvas.width = viewportWidth * dpr;
      canvas.height = viewportHeight * dpr;
      canvas.style.width = `${viewportWidth}px`;
      canvas.style.height = `${viewportHeight}px`;

      // Redraw current frame
      drawFrame(Math.round(watchObjRef.current.frame));
    };

    // Initialize dimensions
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Set up GSAP scroll triggers and animations within a context for automatic cleanup
    const ctx = gsap.context(() => {
      // Stagger Entry Animation for Text Items
      gsap.fromTo(
        '.hero-text-item',
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: 'power4.out',
          stagger: 0.15,
          delay: 0.2
        }
      );

      // Create scroll timeline pinning the section for 200vh
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: '.hero-container',
          start: 'top top',
          end: '+=200%', // Complete animation in 200vh of scroll
          scrub: 0.7, // Scrub with smooth interpolation
          pin: true,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const totalFramesSeq = 276; // 0 to 276 steps
            const currentFrameIndex = Math.round(self.progress * totalFramesSeq);
            watchObjRef.current.frame = currentFrameIndex;
            drawFrame(currentFrameIndex);
          }
        }
      });

      // Text scroll animation: subtle parallax and fade out
      // Fades out and moves up within first 35% of the scroll timeline
      tl.to(
        '.hero-text-content',
        {
          opacity: 0,
          y: -40,
          ease: 'power1.out',
          duration: 0.35
        },
        0
      );

      // Dummy tween to fill the rest of the 1.0 timeline
      tl.to({}, { duration: 0.65 });
    });

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      ctx.revert();
    };
  }, [loaderDone]);

  return (
    <>
      {/* Premium Preloader */}
      {!loaderDone && (
        <div className="preloader" ref={preloaderRef}>
          <div className="preloader-content">
            <span className="preloader-subtitle">CRAFTSMANSHIP IN MOTION</span>
            <h2 className="preloader-title">AURA</h2>
            <div className="preloader-bar-bg">
              <div className="preloader-bar-fill" style={{ width: `${progress}%` }}></div>
            </div>
            <span className="preloader-percentage">{progress}%</span>
          </div>
        </div>
      )}

      {/* Hero Showcase */}
      <div className="hero-container">
        <canvas ref={canvasRef} className="watch-canvas" />
        <div className="hero-bg-glow" />
        <div className="hero-vignette" />

        <div className="hero-text-content">
          <span className="hero-text-item hero-label">SWISS CRAFTED</span>
          <h1 className="hero-text-item hero-heading">
            Every Second,<br />
            Engineered to <span className="gold-text">Perfection</span>.
          </h1>
          <p className="hero-text-item hero-description">
            Experience uncompromising craftsmanship where timeless mechanics meet modern luxury.
          </p>
          <div className="hero-text-item hero-button-wrap">
            <button className="hero-button">
              Explore Collection <span className="arrow">→</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
