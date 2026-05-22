// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// ----------------------------------------------------
// 1. Custom Mouse Cursor Interaction
// ----------------------------------------------------
const cursor = document.getElementById('custom-cursor');
if (cursor) {
  document.addEventListener('mousemove', (e) => {
    gsap.to(cursor, {
      x: e.clientX,
      y: e.clientY,
      duration: 0.1,
      ease: "power2.out"
    });
  });

  // Hover state for interactive items
  const hoverables = document.querySelectorAll('a, button, [onclick], .menu-card');
  hoverables.forEach((item) => {
    item.addEventListener('mouseenter', () => cursor.classList.add('hovered'));
    item.addEventListener('mouseleave', () => cursor.classList.remove('hovered'));
  });
}

// ----------------------------------------------------
// 2. Lenis Smooth Scrolling Setup
// ----------------------------------------------------
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  direction: 'vertical',
  gestureDirection: 'vertical',
  smooth: true,
  mouseMultiplier: 1,
  smoothTouch: false,
  touchMultiplier: 2,
  infinite: false,
});

// Integration with GSAP ScrollTrigger
lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});

gsap.ticker.lagSmoothing(0);

// ----------------------------------------------------
// 3. Hero Load Animations
// ----------------------------------------------------
window.addEventListener('DOMContentLoaded', () => {
  const heroTL = gsap.timeline();
  
  // Stagger fade-in the 10 background Japanese character elements to an ambient opacity of 0.14
  heroTL.fromTo('.floating-neon-char',
    { opacity: 0, scale: 0.7, y: 30 },
    { opacity: 0.14, scale: 1, y: 0, duration: 1.8, stagger: 0.1, ease: "power2.out" }
  );

  // Other components fade in
  heroTL.fromTo('.hero-fade',
    { opacity: 0, y: 30 },
    { opacity: 1, y: 0, duration: 1, stagger: 0.2, ease: "power3.out" },
    "-=1.5"
  );
  
  // Infinite subtle drifting & breathing animations for background full words
  const floatingLetters = document.querySelectorAll('.floating-neon-char');
  floatingLetters.forEach((letter, index) => {
    // Unique drift distances and rotation angles based on index
    const yMove = 15 + (index % 3) * 6;
    const xMove = 12 - (index % 2) * 8;
    const rotChange = 4 + (index % 3) * 3;
    
    // Slow organic drifting
    gsap.to(letter, {
      y: `+=${yMove}`,
      x: `-=${xMove}`,
      rotation: `+=${rotChange}`,
      duration: 8 + index * 1.5,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });
    
    // Breathing opacity (ranging around 0.14 ambient value, e.g. from 0.08 to 0.22)
    gsap.to(letter, {
      opacity: 0.22,
      duration: 4 + index * 1.2,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });
  });
});

// ----------------------------------------------------
// 4. ScrollTrigger Initializations (Section 2 & 3)
// ----------------------------------------------------
window.addEventListener('load', () => {
  // Section 2: Menu Showdown Horizontal Scroll (Responsive: Desktop Pin vs Mobile Swipe)
  const scrollTrack = document.querySelector('.horizontal-scroll-track');
  const scrollContainer = document.querySelector('.horizontal-scroll-container');
  if (scrollTrack && scrollContainer) {
    let menuTrigger = null;

    function setupMenuScroll() {
      // Kill existing ScrollTrigger if any
      if (menuTrigger) {
        menuTrigger.kill();
        menuTrigger = null;
      }

      // Reset inline styles and classes
      gsap.set(scrollTrack, { clearProps: "all" });
      gsap.set(scrollContainer, { clearProps: "all" });
      scrollTrack.classList.remove('justify-center');
      scrollTrack.style.width = '';
      scrollTrack.style.paddingLeft = '';
      scrollTrack.style.paddingRight = '';

      const windowWidth = window.innerWidth;
      const maxW = 1280; // max-w-7xl
      const px6 = 24; // px-6

      // Temporarily clear inline and layout paddings to measure raw content width (cards + gaps only)
      scrollTrack.style.paddingLeft = '0px';
      scrollTrack.style.paddingRight = '0px';
      scrollTrack.style.width = 'max-content';
      const rawContentWidth = scrollTrack.scrollWidth;

      if (windowWidth >= 768) {
        // Desktop / Tablet
        if (rawContentWidth > windowWidth) {
          // Content exceeds screen width, we need horizontal scroll!
          let leftOffset = px6;
          if (windowWidth > maxW) {
            leftOffset = (windowWidth - maxW) / 2 + px6;
          } else {
            leftOffset = 48; // md:px-12 (48px)
          }

          scrollTrack.style.paddingLeft = `${leftOffset}px`;
          scrollTrack.style.paddingRight = `${leftOffset}px`;
          scrollTrack.style.width = 'max-content';
          scrollTrack.classList.remove('justify-center');
          scrollContainer.style.overflowX = 'visible';

          // Measure width with paddings applied to calculate horizontal scroll distance
          const contentWidth = scrollTrack.scrollWidth;
          const horizontalScrollAmount = contentWidth - windowWidth;

          menuTrigger = ScrollTrigger.create({
            trigger: "#menu",
            pin: true,
            scrub: 1,
            start: "top top",
            end: () => `+=${horizontalScrollAmount}`,
            invalidateOnRefresh: true,
            animation: gsap.to(scrollTrack, {
              x: -horizontalScrollAmount,
              ease: "none"
            })
          });
        } else {
          // Content fits on screen, center it and disable scrolling
          scrollTrack.style.width = '100%';
          scrollTrack.style.paddingLeft = '';
          scrollTrack.style.paddingRight = '';
          scrollTrack.classList.add('justify-center');
          scrollContainer.style.overflowX = 'hidden';
          gsap.set(scrollTrack, { x: 0 });
        }
      } else {
        // Mobile
        scrollTrack.style.paddingLeft = '';
        scrollTrack.style.paddingRight = '';
        scrollContainer.style.overflowX = 'auto';
        scrollContainer.style.webkitOverflowScrolling = 'touch';
        scrollTrack.style.width = 'max-content';
        scrollTrack.classList.remove('justify-center');
        gsap.set(scrollTrack, { x: 0 });
      }
    }

    // Initialize
    setupMenuScroll();

    // Re-initialize on window resize
    window.addEventListener('resize', setupMenuScroll);
  }

  // Section 3: Flavor Blueprint (Step Card Staggered Reveals)
  const howtoGrid = document.querySelector('#howto .grid');
  if (howtoGrid) {
    gsap.from(howtoGrid.children, {
      opacity: 0,
      y: 40,
      duration: 0.8,
      stagger: 0.15,
      ease: "power2.out",
      scrollTrigger: {
        trigger: howtoGrid,
        start: "top 85%",
        toggleActions: "play none none none"
      }
    });
  }

  // Refresh ScrollTrigger to calculate offsets correctly after pinning setup
  ScrollTrigger.refresh();
});

// ----------------------------------------------------
// 6. Review Ticker (Section 4) - Infinite Seamless Loops
// ----------------------------------------------------
// Clone review tracks for seamless marquee
const trackLeft = document.querySelector('.ticker-track-left');
const trackRight = document.querySelector('.ticker-track-right');

if (trackLeft) {
  // Clone cards to double the width
  const children = Array.from(trackLeft.children);
  children.forEach(card => {
    const clone = card.cloneNode(true);
    trackLeft.appendChild(clone);
  });

  // Calculate full half-track width
  const widthLeft = trackLeft.scrollWidth / 2;

  gsap.to(trackLeft, {
    x: -widthLeft,
    duration: 20,
    ease: "none",
    repeat: -1
  });
}

if (trackRight) {
  const children = Array.from(trackRight.children);
  children.forEach(card => {
    const clone = card.cloneNode(true);
    trackRight.appendChild(clone);
  });

  const widthRight = trackRight.scrollWidth / 2;

  // Set initial translation to negative half-width
  gsap.set(trackRight, { x: -widthRight });

  gsap.to(trackRight, {
    x: 0,
    duration: 20,
    ease: "none",
    repeat: -1
  });
}
