// ============================================================
// ACADEMY CONFIGURATION & EDITABLE DATA
// (All text, teacher info, subjects, and milestones are here)
// ============================================================

// Three.js school objects (ES module)
import { initSchool3D } from './schoolObjects.js';
const ACADEMY_DATA = {
  name: "Khattak Academy",
  tagline: "Veritas &bull; Sapientia &bull; Innovatio",

  // ── SPREAD 1: FOUNDATION & PERFORMANCE ──
  spread1: {
    left: {
      chapter: "Chapter I &bull; Prolegomena",
      title: "The Academy Codex",
      dropCap: "F",
      paragraph: "ounded on the belief that modern intellect thrives through deep inquiry and disciplined mastery. Khattak Academy delivers rigorous mentorship in computation, mathematics, and natural sciences.",
      quote: "Excellence is not an act, but an unyielding pursuit of truth and understanding.",
      pageNum: "&mdash; 1 &mdash;"
    },
    right: {
      chapter: "Institutional Metrics",
      title: "How We Perform",
      intro: "A quantitative examination of academic progress and scholar achievement across all cohorts.",
      stats: [
        { number: "24", label: "Core Subjects" },
        { number: "12,500+", label: "Active Scholars" },
        { number: "96.4%", label: "Completion Rate" },
        { number: "4.9★", label: "Academic Rating" }
      ],
      pageNum: "&mdash; 2 &mdash;"
    }
  },

  // ── SPREAD 2: TEACHERS & SUBJECTS (PART 3) ──
  spread2: {
    left: {
      chapter: "Faculty & Mentorship",
      title: "Our Teachers",
      teachers: [
        {
          name: "Dr. Ahmed Khattak",
          subject: "Theoretical Physics & Math",
          initials: "AK"
        },
        {
          name: "Sarah Al-Rashid",
          subject: "Distributed Systems & Node.js",
          initials: "SR"
        },
        {
          name: "Prof. Tariq Hussain",
          subject: "Computational Biophysics",
          initials: "TH"
        },
        {
          name: "Zara Khan",
          subject: "Applied Mathematics & HCI",
          initials: "ZK"
        }
      ],
      pageNum: "&mdash; 3 &mdash;"
    },
    right: {
      chapter: "Curriculum Catalog",
      title: "Subjects We Teach",
      totalCount: "24 Active Master Disciplines",
      subjects: [
        { icon: "⚛️", name: "Quantum Physics & Mechanics" },
        { icon: "💻", name: "Distributed Computing & Node.js" },
        { icon: "📐", name: "Higher Calculus & Linear Algebra" },
        { icon: "🧬", name: "Molecular Genetics & Bio-Tech" },
        { icon: "🤖", name: "Applied Machine Intelligence" },
        { icon: "🎨", name: "Classical Geometry & Spatial Design" }
      ],
      pageNum: "&mdash; 4 &mdash;"
    }
  },

  // ── SPREAD 3: PRINCIPLES & TIMELINE (PART 3) ──
  spread3: {
    left: {
      chapter: "Scholarly Principles",
      title: "Why Choose Us",
      points: [
        {
          title: "Direct Master Mentorship",
          desc: "Learn in tight cohorts directly guided by active researchers and practitioners."
        },
        {
          title: "Rigorous Applied Lab Work",
          desc: "Every theoretical concept is validated with real computational and lab proofs."
        },
        {
          title: "Need-Blind Academic Grants",
          desc: "Merit and endowment subsidies ensure no capable scholar is turned away."
        },
        {
          title: "Lifelong Alumni Fellows",
          desc: "Permanent access to our research repository, colloquiums, and peer network."
        }
      ],
      pageNum: "&mdash; 5 &mdash;"
    },
    right: {
      chapter: "Historical Archive",
      title: "Our Journey",
      foundingYear: "Founded 2024 &bull; Peshawar & Islamabad",
      milestones: [
        {
          year: "2024",
          title: "Charter & Foundation",
          desc: "Inaugural cohort enrolled in pure mathematics and systems architecture."
        },
        {
          year: "2025",
          title: "Fellowship Expansion",
          desc: "Crossed 10,000 active scholars across 42 countries with open research lab access."
        },
        {
          year: "2026",
          title: "Advanced Research Labs",
          desc: "Launched dedicated fellowships in quantum simulation and AI alignment."
        }
      ],
      pageNum: "&mdash; 6 &mdash;"
    }
  }
};

// ============================================================
// GSAP & SCROLLTRIGGER MULTI-SPREAD CONTROLLER
// ============================================================
gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });
gsap.ticker.lagSmoothing(0);

window.addEventListener("DOMContentLoaded", () => {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isMobile = window.innerWidth < 768;

  // 1. Populate Front Cover
  const titleEl = document.getElementById("academyTitle");
  const taglineEl = document.getElementById("academyTagline");
  if (titleEl) titleEl.textContent = ACADEMY_DATA.name;
  if (taglineEl) taglineEl.innerHTML = ACADEMY_DATA.tagline;

  // 2. Populate Spread 1: Left & Right
  const s1LeftEl = document.getElementById("pageContentSpread1Left");
  const s1RightEl = document.getElementById("pageContentSpread1Right");

  if (s1LeftEl) {
    const d = ACADEMY_DATA.spread1.left;
    s1LeftEl.innerHTML = `
      <div>
        <div class="ornamental-header">
          <span class="header-chapter-name">${d.chapter}</span>
          <span class="header-motif">⚜</span>
        </div>
        <h2 class="page-heading">${d.title}</h2>
        <p class="page-text"><span class="drop-cap">${d.dropCap}</span>${d.paragraph}</p>
        <div class="quote-highlight">"${d.quote}"</div>
      </div>
      <div class="page-num-center">${d.pageNum}</div>
    `;
  }

  if (s1RightEl) {
    const d = ACADEMY_DATA.spread1.right;
    const statsHTML = d.stats.map(s => `
      <div class="stat-item">
        <span class="stat-number">${s.number}</span>
        <span class="stat-label">${s.label}</span>
      </div>
    `).join("");

    s1RightEl.innerHTML = `
      <div>
        <div class="ornamental-header">
          <span class="header-chapter-name">${d.chapter}</span>
          <span class="header-motif">⚜</span>
        </div>
        <h2 class="page-heading">${d.title}</h2>
        <p class="page-text">${d.intro}</p>
        <div class="stats-container">
          ${statsHTML}
        </div>
      </div>
      <div class="page-num-center">${d.pageNum}</div>
    `;
  }

  // 3. Populate Spread 2: Left (Teachers) & Right (Subjects)
  const s2LeftEl = document.getElementById("pageContentSpread2Left");
  const s2RightEl = document.getElementById("pageContentSpread2Right");

  if (s2LeftEl) {
    const d = ACADEMY_DATA.spread2.left;
    const teachersHTML = d.teachers.map(t => `
      <div class="teacher-card">
        <div class="teacher-avatar-circle">${t.initials}</div>
        <div class="teacher-info">
          <h4>${t.name}</h4>
          <span>${t.subject}</span>
        </div>
      </div>
    `).join("");

    s2LeftEl.innerHTML = `
      <div>
        <div class="ornamental-header">
          <span class="header-chapter-name">${d.chapter}</span>
          <span class="header-motif">⚜</span>
        </div>
        <h2 class="page-heading">${d.title}</h2>
        <div class="teachers-list">
          ${teachersHTML}
        </div>
      </div>
      <div class="page-num-center">${d.pageNum}</div>
    `;
  }

  if (s2RightEl) {
    const d = ACADEMY_DATA.spread2.right;
    const subjectsHTML = d.subjects.map(s => `
      <div class="subject-item">
        <span class="subject-icon">${s.icon}</span>
        <span>${s.name}</span>
      </div>
    `).join("");

    s2RightEl.innerHTML = `
      <div>
        <div class="ornamental-header">
          <span class="header-chapter-name">${d.chapter}</span>
          <span class="header-motif">⚜</span>
        </div>
        <h2 class="page-heading">${d.title}</h2>
        <span class="subjects-count-badge">${d.totalCount}</span>
        <div class="subjects-grid">
          ${subjectsHTML}
        </div>
      </div>
      <div class="page-num-center">${d.pageNum}</div>
    `;
  }

  // 4. Populate Spread 3: Left (Why Choose Us) & Right (Our Journey)
  const s3LeftEl = document.getElementById("pageContentSpread3Left");
  const s3RightEl = document.getElementById("pageContentSpread3Right");

  if (s3LeftEl) {
    const d = ACADEMY_DATA.spread3.left;
    const pointsHTML = d.points.map(p => `
      <div class="point-card">
        <h4>${p.title}</h4>
        <p>${p.desc}</p>
      </div>
    `).join("");

    s3LeftEl.innerHTML = `
      <div>
        <div class="ornamental-header">
          <span class="header-chapter-name">${d.chapter}</span>
          <span class="header-motif">⚜</span>
        </div>
        <h2 class="page-heading">${d.title}</h2>
        <div class="points-list">
          ${pointsHTML}
        </div>
      </div>
      <div class="page-num-center">${d.pageNum}</div>
    `;
  }

  if (s3RightEl) {
    const d = ACADEMY_DATA.spread3.right;
    const timelineHTML = d.milestones.map(m => `
      <div class="timeline-step">
        <span class="timeline-year">${m.year}</span>
        <h4>${m.title}</h4>
        <p>${m.desc}</p>
      </div>
    `).join("");

    s3RightEl.innerHTML = `
      <div>
        <div class="ornamental-header">
          <span class="header-chapter-name">${d.chapter}</span>
          <span class="header-motif">⚜</span>
        </div>
        <h2 class="page-heading">${d.title}</h2>
        <div class="timeline-founding-badge">${d.foundingYear}</div>
        <div class="timeline-track">
          ${timelineHTML}
        </div>
      </div>
      <div class="page-num-center">${d.pageNum}</div>
    `;
  }

  // 5. DOM References
  const book = document.getElementById("book");
  const bookStage = document.getElementById("bookStage");
  const bookShadow = document.getElementById("bookShadow");
  const coverBackingLeft = document.getElementById("coverBackingLeft");
  const stackLeft = document.getElementById("stackLeft");
  const stackRight = document.getElementById("stackRight");
  const bgStaticLayer = document.getElementById("bgStaticLayer");
  const spotCool = document.getElementById("spotCool");
  const spotWarm = document.getElementById("spotWarm");

  // Leaves
  const coverLeaf = document.getElementById("coverLeaf");
  const pageLeaf1 = document.getElementById("pageLeaf1");
  const pageLeaf2 = document.getElementById("pageLeaf2");

  // Shading overlays
  const leafShadowFront = document.getElementById("leafShadowFront");
  const leafShadowBack = document.getElementById("leafShadowBack");
  const leaf1ShadowFront = document.getElementById("leaf1ShadowFront");
  const leaf1ShadowBack = document.getElementById("leaf1ShadowBack");
  const leaf2ShadowFront = document.getElementById("leaf2ShadowFront");
  const leaf2ShadowBack = document.getElementById("leaf2ShadowBack");

  // Quotes (FIX 2: Fixed Top Overlay)
  const quote1 = document.getElementById("quote1");
  const quote2 = document.getElementById("quote2");
  const quote3 = document.getElementById("quote3");
  const quote4 = document.getElementById("quote4");

  if (!book || !coverLeaf) return;

  // Responsive center offset
  const offsetXClosed = isMobile ? -135 : -155;

  // Initial 3D State: Closed book lying flat
  gsap.set(book, {
    rotateX: 65,
    rotateY: 0,
    rotateZ: -25,
    x: offsetXClosed,
    transformPerspective: 1800
  });

  gsap.set(coverLeaf, { rotateY: 0, z: 14, transformPerspective: 1800 });
  gsap.set(pageLeaf1, { rotateY: 0, z: 8, transformPerspective: 1800 });
  gsap.set(pageLeaf2, { rotateY: 0, z: 4, transformPerspective: 1800 });

  // Pre-rendered Ground Shadow: transform scale and opacity only (no blur filters or width)
  gsap.set(bookShadow, {
    opacity: 0.85,
    scaleX: 1,
    scaleY: 1
  });

  // Stacks: transform scaleX only (no width)
  gsap.set(stackLeft, { scaleX: 0, opacity: 0 });
  gsap.set(stackRight, { scaleX: 1, opacity: 1 });

  // Initial Quotes States: Hidden above book
  gsap.set([quote1, quote2, quote3, quote4], { opacity: 0, y: 10 });

  // 6. Master Multi-Spread Scroll Timeline (Single timeline, scrub: 0.8)
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: ".scroll-track",
      start: "top top",
      end: "bottom bottom",
      scrub: 0.8
    }
  });

  // ── PHASE 1: Rotate Upright & Surah Al-Alaq Quote Appears (0 -> 1.2) ──
  tl.to(book, {
    rotateX: 10,
    rotateY: 0,
    rotateZ: 0,
    ease: "power1.inOut",
    duration: 1.2
  }, 0);

  tl.to(bookShadow, {
    opacity: 0.35,
    scaleX: 1.25,
    scaleY: 0.9,
    ease: "power1.inOut",
    duration: 1.2
  }, 0);

  // Quote 1: Surah Al-Alaq fades in at the top
  tl.to(quote1, {
    opacity: 1,
    y: 0,
    ease: "power1.out",
    duration: 1.0
  }, 0.2);

  // Gentle parallax on static background symbols (transform only)
  if (bgStaticLayer) {
    tl.to(bgStaticLayer, {
      y: -40,
      ease: "none",
      duration: 7.2
    }, 0);
  }

  // ── PHASE 2: Open Front Cover to Reveal Spread 1 (1.2 -> 3.0) ──
  // (Left: The Academy Codex Intro, Right: How We Perform Metrics)
  tl.to(book, {
    x: 0,
    ease: "power2.inOut",
    duration: 1.8
  }, 1.2);

  tl.to(coverBackingLeft, {
    opacity: 1,
    ease: "power2.inOut",
    duration: 1.2
  }, 1.4);

  // Left stack reveals via scaleX & opacity
  tl.to(stackLeft, {
    opacity: 1,
    scaleX: 0.45,
    ease: "power2.inOut",
    duration: 1.2
  }, 1.4);

  tl.to(bookShadow, {
    scaleX: 1.85,
    scaleY: 1.05,
    opacity: 0.28,
    ease: "power2.inOut",
    duration: 1.8
  }, 1.2);

  tl.to(coverLeaf, {
    rotateY: -180,
    z: 2,
    ease: "power2.inOut",
    duration: 1.8
  }, 1.2);

  // Dynamic shading overlays on cover turn
  if (leafShadowFront && leafShadowBack) {
    tl.fromTo([leafShadowFront, leafShadowBack], { opacity: 0 }, {
      opacity: 0.35,
      duration: 0.9,
      yoyo: true,
      repeat: 1,
      ease: "sine.inOut"
    }, 1.2);
  }

  // Crossfade spotlight to warm
  if (spotCool && spotWarm) {
    tl.to(spotCool, { opacity: 0.2, duration: 3.5, ease: "power1.inOut" }, 1.5);
    tl.to(spotWarm, { opacity: 1, duration: 3.5, ease: "power1.inOut" }, 1.5);
  }

  // Quote 1 stays visible during Spread 1, then fades out completely before Quote 2 starts
  tl.to(quote1, {
    opacity: 0,
    y: -8,
    ease: "power1.in",
    duration: 0.5
  }, 2.2);

  // ── PHASE 3: Turn Page 1 to Reveal Spread 2 (3.0 -> 5.0) ──
  // (Left: Our Teachers, Right: Subjects We Teach)
  // Quote 2 (Surah Ta-Ha: "Rabbi zidni 'ilma") fades in strictly after Quote 1 is gone
  tl.to(quote2, {
    opacity: 1,
    y: 0,
    ease: "power1.out",
    duration: 0.6
  }, 2.8);

  tl.to(pageLeaf1, {
    rotateY: -180,
    z: 6,
    ease: "power2.inOut",
    duration: 2.0
  }, 3.0);

  // Dynamic shading on leaf 1 turn
  if (leaf1ShadowFront && leaf1ShadowBack) {
    tl.fromTo([leaf1ShadowFront, leaf1ShadowBack], { opacity: 0 }, {
      opacity: 0.32,
      duration: 1.0,
      yoyo: true,
      repeat: 1,
      ease: "sine.inOut"
    }, 3.0);
  }

  // Stack scale adjustments (transform scaleX only)
  tl.to(stackLeft, { scaleX: 0.75, ease: "power2.inOut", duration: 2.0 }, 3.0);
  tl.to(stackRight, { scaleX: 0.75, ease: "power2.inOut", duration: 2.0 }, 3.0);

  // Quote 2 stays visible during Spread 2, then fades out completely before Quote 3 starts
  tl.to(quote2, {
    opacity: 0,
    y: -8,
    ease: "power1.in",
    duration: 0.5
  }, 4.3);

  // ── PHASE 4: Turn Page 2 to Reveal Spread 3 (5.0 -> 7.0) ──
  // (Left: Why Choose Us, Right: Our Journey Timeline)
  // Quote 3 (Hadith: Seeking knowledge...) fades in strictly after Quote 2 is gone
  tl.to(quote3, {
    opacity: 1,
    y: 0,
    ease: "power1.out",
    duration: 0.6
  }, 4.9);

  tl.to(pageLeaf2, {
    rotateY: -180,
    z: 10,
    ease: "power2.inOut",
    duration: 2.0
  }, 5.0);

  // Dynamic shading on leaf 2 turn
  if (leaf2ShadowFront && leaf2ShadowBack) {
    tl.fromTo([leaf2ShadowFront, leaf2ShadowBack], { opacity: 0 }, {
      opacity: 0.32,
      duration: 1.0,
      yoyo: true,
      repeat: 1,
      ease: "sine.inOut"
    }, 5.0);
  }

  // Left stack gets thicker, right stack thins down (scaleX only)
  tl.to(stackLeft, { scaleX: 1.0, ease: "power2.inOut", duration: 2.0 }, 5.0);
  tl.to(stackRight, { scaleX: 0.45, ease: "power2.inOut", duration: 2.0 }, 5.0);

  // Transition Quote 3 -> Quote 4 (Scholars names line) strictly one at a time
  tl.to(quote3, {
    opacity: 0,
    y: -8,
    ease: "power1.in",
    duration: 0.4
  }, 6.0);

  tl.to(quote4, {
    opacity: 1,
    y: 0,
    ease: "power1.out",
    duration: 0.4
  }, 6.45);

  // ── FINALE & CLOSING STEPS ──
  // Phase B (7.2 -> 8.6): The book closes. EVERY interior leaf must tuck back
  // flat over the right side (rotateY back to 0 around the spine). If any leaf
  // stays flipped at rotateY:-180, the later +180° book spin brings its net
  // rotation back to 0 and its front face shows again beside the back cover.
  tl.to(pageLeaf2, {
    rotateY: 0,
    z: 4,
    ease: "power2.inOut",
    duration: 1.0
  }, 7.4);

  tl.to(pageLeaf1, {
    rotateY: 0,
    z: 8,
    ease: "power2.inOut",
    duration: 1.2
  }, 7.2);

  tl.to(coverLeaf, {
    rotateY: 0,
    z: 14,
    ease: "power2.inOut",
    duration: 1.4
  }, 7.2);

  // Left stack scales back down to 0 as the pages tuck over it
  tl.to(stackLeft, {
    scaleX: 0,
    opacity: 0,
    ease: "power2.inOut",
    duration: 1.4
  }, 7.2);

  // Right stack thickens back up (closed book's fore-edge)
  tl.to(stackRight, {
    scaleX: 1,
    opacity: 1,
    ease: "power2.inOut",
    duration: 1.4
  }, 7.2);

  tl.to(coverBackingLeft, {
    opacity: 0,
    ease: "power2.inOut",
    duration: 1.0
  }, 7.4);

  // Book settles into its resting pose as it shuts
  tl.to(book, {
    x: offsetXClosed,
    rotateX: 15,
    rotateY: 0,
    rotateZ: -5,
    ease: "power2.inOut",
    duration: 1.4
  }, 7.2);

  tl.to(bookShadow, {
    scaleX: 1.25,
    scaleY: 0.95,
    opacity: 0.45,
    ease: "power2.inOut",
    duration: 1.4
  }, 7.2);

  // Phase C (8.6 -> 9.6): Recenter the closed book horizontally BEFORE the 180° turn.
  tl.to(book, {
    x: 0,
    rotateX: 14,
    rotateZ: -5,
    ease: "power1.inOut",
    duration: 1.4
  }, 8.6);

  tl.to(bookShadow, {
    scaleX: 1.05,
    scaleY: 0.9,
    opacity: 0.5,
    ease: "power1.inOut",
    duration: 1.4
  }, 8.6);

  // Phase D (9.6 -> 11.0): Closed book rotates 180° around its vertical axis to
  // show the BACK COVER. With all leaves flat (rotateY 0) their front faces now
  // point away from the camera, so only the back cover is visible — nothing beside it.
  tl.to(book, {
    rotateY: 180,
    rotateX: 12,
    rotateZ: 0,
    ease: "power2.inOut",
    duration: 1.4
  }, 9.6);

  // Fade the front-cover leaf so its inner face can never bleed over the back cover
  tl.to(coverLeaf, {
    opacity: 0,
    visibility: "hidden",
    ease: "power1.in",
    duration: 0.6
  }, 10.2);

  // Phase E (11.0 -> 12.2): Hold still on the readable back cover before pin release
  tl.to(book, {
    rotateY: 180,
    rotateX: 12,
    rotateZ: 0,
    x: 0,
    duration: 1.2,
    ease: "none"
  }, 11.0);

  // Restart book button handler on back cover
  const btnRestart = document.getElementById("btnRestartCodex");
  if (btnRestart) {
    btnRestart.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // 7. Desktop Interactive Mouse Tilt (Throttled with gsap.quickTo)
  if (!prefersReducedMotion && window.matchMedia("(hover: hover)").matches) {
    const tiltStageX = gsap.quickTo(bookStage, "rotateX", { duration: 0.5, ease: "power2.out" });
    const tiltStageY = gsap.quickTo(bookStage, "rotateY", { duration: 0.5, ease: "power2.out" });

    window.addEventListener("mousemove", (e) => {
      const mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      const mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
      tiltStageX(mouseY * -2.5);
      tiltStageY(mouseX * 3.5);
    }, { passive: true });
  }

  // 8. One small 200x200 Tiled Noise PNG (no live SVG filters)
  initNoiseGrain();

  // 9. Golden Dust Canvas (Capped at 30 desktop / 12 mobile, no shadowBlur)
  initDustParticles(prefersReducedMotion, isMobile);

  // 11. Three.js 3D School Objects (replaces CSS sticker objects)
  initSchool3D();

  // 10. Automatic Quality Degrade Switch (>24ms frame time for 1s)
  initQualitySwitch();
});

// ============================================================
// 1. ONE SMALL TILED GRAIN NOISE (200x200 PNG DATA-URI)
// ============================================================
function initNoiseGrain() {
  const grainEl = document.getElementById("bgGrain");
  if (!grainEl) return;
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 200;
    canvas.height = 200;
    const ctx = canvas.getContext("2d");
    const imgData = ctx.createImageData(200, 200);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const v = (Math.random() * 255) | 0;
      data[i] = v;
      data[i + 1] = v;
      data[i + 2] = v;
      data[i + 3] = (Math.random() * 12 + 4) | 0;
    }
    ctx.putImageData(imgData, 0, 0);
    grainEl.style.backgroundImage = `url(${canvas.toDataURL("image/png")})`;
  } catch (err) {
    console.warn("Noise grain creation bypassed:", err);
  }
}

// ============================================================
// 2. FLOATING GOLDEN DUST PARTICLES (LIGHTWEIGHT, NO SHADOWBLUR)
// ============================================================
function initDustParticles(reducedMotion, isMobile) {
  if (reducedMotion) return;

  const canvas = document.getElementById("dustCanvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let width, height;
  let animationFrameId;
  let isRunning = true;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener("resize", resize, { passive: true });

  // Cap at 30 on desktop and 12 on mobile
  const particleCount = isMobile ? 12 : 30;
  const particles = [];

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.0 + 0.8,
      speedY: Math.random() * 0.38 + 0.16,
      speedX: (Math.random() - 0.5) * 0.2,
      alpha: Math.random() * 0.35 + 0.12,
      wobbleSpeed: Math.random() * 0.02 + 0.01,
      wobbleAngle: Math.random() * Math.PI * 2
    });
  }

  function render() {
    if (!isRunning) return;

    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      p.y -= p.speedY;
      p.wobbleAngle += p.wobbleSpeed;
      p.x += Math.sin(p.wobbleAngle) * 0.28 + p.speedX;

      if (p.y < -10) {
        p.y = height + 10;
        p.x = Math.random() * width;
      }
      if (p.x < -10) p.x = width + 10;
      if (p.x > width + 10) p.x = -10;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(224, 184, 75, ${p.alpha})`;
      // No shadowBlur or shadowColor for high 60fps performance
      ctx.fill();
    }

    animationFrameId = requestAnimationFrame(render);
  }
  render();

  // Expose stop hook for quality switch
  window._stopDustLoop = function() {
    isRunning = false;
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
  };

  // Pause when tab is hidden
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      isRunning = false;
      cancelAnimationFrame(animationFrameId);
    } else {
      if (!window._qualityDegraded) {
        isRunning = true;
        render();
      }
    }
  });
}

// ============================================================
// 3. AUTOMATIC QUALITY DEGRADE SWITCH
// (If average frame time > 24ms for 1s, turn off particles, grain, symbols)
// ============================================================
function initQualitySwitch() {
  let frameCount = 0;
  let accumulatedTime = 0;
  let lastTime = performance.now();
  window._qualityDegraded = false;

  function monitor(now) {
    if (window._qualityDegraded) return;
    const delta = now - lastTime;
    lastTime = now;

    // Filter out huge deltas from tab switches or background
    if (delta < 200) {
      accumulatedTime += delta;
      frameCount++;
    }

    if (accumulatedTime >= 1000) {
      const avgFrameTime = accumulatedTime / frameCount;
      if (avgFrameTime > 24) {
        window._qualityDegraded = true;
        console.warn(`[Quality Switch] Degraded performance detected (${avgFrameTime.toFixed(1)}ms/frame). Disabling particles, grain, and symbols.`);

        // Turn off particles
        if (window._stopDustLoop) window._stopDustLoop();
        const canvas = document.getElementById("dustCanvas");
        if (canvas) canvas.style.display = "none";

        // Turn off grain
        const grain = document.getElementById("bgGrain");
        if (grain) grain.style.display = "none";

        // Turn off symbols layer
        const symbols = document.getElementById("bgStaticLayer");
        if (symbols) symbols.style.display = "none";

        // Stop the 3D school-object tumble when FPS drops
        if (window._stopSchoolObjectsTumble) window._stopSchoolObjectsTumble();
        return;
      }
      // Reset 1-second monitoring window
      accumulatedTime = 0;
      frameCount = 0;
    }

    requestAnimationFrame(monitor);
  }

  requestAnimationFrame(monitor);
}

// ============================================================
// 4. FLOATING 3D SCHOOL OBJECTS (PART 1 & 2)
// ============================================================
function initFloatingObjects(mainTimeline, reducedMotion, isMobile) {
  if (window.innerWidth < 480) return;

  // Object configuration:
  // cluster: starting tight position around flat closed book (x, y, z, rotX, rotY, rotZ)
  // spread: open book viewing position (wide to the left and right, leaving book clear)
  // return: closing book cluster position
  const OBJECTS = [
    // ── LEFT SIDE (cluster around left edge of book which centers around x = -155) ──
    {
      id: 'objBlackboard',
      side: 'left',
      cluster: { x: -350, y: -160, z: 50,  rotX: 20, rotY: -18, rotZ: -10 },
      spread:  { x: -460, y: -130, z: 90,  rotX: 8,  rotY: -14, rotZ: -4 },
      spinRate: { x: 0.05, y: 0.16, z: 0.02 },
      pageSpin: { x: 45,  y: 270,  z: -60 }
    },
    {
      id: 'objPencil',
      side: 'left',
      cluster: { x: -310, y: -30,  z: 80,  rotX: 30, rotY: 20,  rotZ: 25 },
      spread:  { x: -400, y: 110,  z: 140, rotX: 20, rotY: 30,  rotZ: 45 },
      spinRate: { x: 0.08, y: 0.06, z: 0.22 },
      pageSpin: { x: 90,  y: 180,  z: 320 }
    },
    {
      id: 'objBookStack',
      side: 'left',
      cluster: { x: -340, y: 100,  z: 30,  rotX: -14, rotY: 15, rotZ: 8 },
      spread:  { x: -480, y: 160,  z: 60,  rotX: -6,  rotY: 12, rotZ: 3 },
      spinRate: { x: 0.03, y: 0.12, z: 0.02 },
      pageSpin: { x: -40, y: 220,  z: 90 }
    },

    // ── RIGHT SIDE (cluster around right edge of book) ──
    {
      id: 'objWhiteboard',
      side: 'right',
      cluster: { x: 90,   y: -140, z: 45,  rotX: 18, rotY: 15,  rotZ: 8 },
      spread:  { x: 440,  y: -140, z: 80,  rotX: 6,  rotY: 15,  rotZ: 2 },
      spinRate: { x: 0.04, y: -0.15, z: 0.03 },
      pageSpin: { x: 60,  y: -280, z: 45 }
    },
    {
      id: 'objGlobe',
      side: 'right',
      cluster: { x: 120,  y: -30,  z: 75,  rotX: -10, rotY: 25, rotZ: -10 },
      spread:  { x: 470,  y: 10,   z: 120, rotX: -4,  rotY: 22, rotZ: -8 },
      spinRate: { x: 0.06, y: 0.22, z: 0.04 },
      pageSpin: { x: -50, y: 340,  z: -80 }
    },
    {
      id: 'objPen',
      side: 'right',
      cluster: { x: 75,   y: 70,   z: 85,  rotX: -22, rotY: -12, rotZ: -30 },
      spread:  { x: 390,  y: 130,  z: 130, rotX: -15, rotY: -25, rotZ: -40 },
      spinRate: { x: 0.06, y: 0.08, z: -0.24 },
      pageSpin: { x: -80, y: -200, z: -300 }
    },
    {
      id: 'objRuler',
      side: 'right',
      cluster: { x: 105,  y: 140,  z: 35,  rotX: 20, rotY: -15, rotZ: 12 },
      spread:  { x: 430,  y: 200,  z: 70,  rotX: 10, rotY: -10, rotZ: 8 },
      spinRate: { x: 0.05, y: -0.11, z: 0.16 },
      pageSpin: { x: 70,  y: 240,  z: -180 }
    }
  ];

  // Mobile/Tablet filter: max 4 objects (2 left, 2 right)
  const visibleIds = isMobile
    ? ['objBlackboard', 'objBookStack', 'objWhiteboard', 'objGlobe']
    : OBJECTS.map(o => o.id);

  // Function to compute spread coordinates based on viewport width and open book geometry
  // Open book extends to x = -314 on left and x = +304 on right (total width ~620px).
  // Left objects must be fully outside x = -354 (at least 40px clearance),
  // Right objects must be fully outside x = +344.
  function computeCoordinates() {
    const vw = window.innerWidth;
    const isNarrow = vw < 1200;
    const isVeryNarrow = vw < 768;

    // Available space between open book edge (354px) and screen edge (vw / 2)
    const halfWidth = vw / 2;
    const leftMargin = Math.max(380, Math.min(halfWidth - 70, 520));
    const rightMargin = Math.max(370, Math.min(halfWidth - 70, 510));

    return {
      leftMargin,
      rightMargin,
      scale: isVeryNarrow ? 0.7 : (isNarrow ? 0.82 : 1.0)
    };
  }

  const coords = computeCoordinates();

  const objs = OBJECTS.filter(o => visibleIds.includes(o.id)).map((cfg, idx) => {
    const el = document.getElementById(cfg.id);
    if (!el) return null;
    const inner = el.querySelector('.obj-3d');
    const shadow = el.querySelector('.obj-shadow');

    // Spread X positioned safely outside the open book pages with >40px clearance
    const spreadX = cfg.side === 'left' ? -coords.leftMargin - (idx === 1 ? -40 : 0) : coords.rightMargin + (idx === 5 ? -30 : 0);

    return {
      ...cfg,
      el,
      inner,
      shadow,
      idx,
      spreadX,
      spreadY: cfg.spread.y,
      spreadZ: cfg.spread.z,
      scaleFactor: coords.scale,
      curBaseX: cfg.cluster.x,
      curBaseY: cfg.cluster.y,
      curBaseZ: cfg.cluster.z,
      baseRotX: cfg.cluster.rotX,
      baseRotY: cfg.cluster.rotY,
      baseRotZ: cfg.cluster.rotZ,
      selfRotX: 0,
      selfRotY: 0,
      selfRotZ: 0,
      bobOffset: 0
    };
  }).filter(Boolean);

  if (!objs.length) return;

  // ── 1. INITIAL POSITION: Tightly clustered around the book (scroll = 0) ──
  objs.forEach(o => {
    gsap.set(o.el, {
      x: o.curBaseX,
      y: o.curBaseY,
      z: o.curBaseZ,
      rotateX: o.baseRotX,
      rotateY: o.baseRotY,
      rotateZ: o.baseRotZ,
      opacity: 0.86,
      scale: o.scaleFactor,
      force3D: true
    });
    if (o.shadow) {
      gsap.set(o.shadow, { opacity: 0.65 });
    }
  });

  // ── 2. MASTER SCRUBBED TIMELINE HOOK (Cluster -> Spread -> Return) ──
  // Scrubbed with scroll progress, exactly matches book animation phases
  if (mainTimeline) {
    objs.forEach((o, i) => {
      // Stagger each object slightly (0.04s apart)
      const spreadStart = 0.2 + (i * 0.05);
      const spreadDuration = 1.3;

      // Phase 1 -> 2: Glide outward to spread position outside open book (1.2 -> 2.5)
      mainTimeline.to(o.el, {
        x: o.spreadX,
        y: o.spreadY,
        z: o.spreadZ,
        rotateX: o.spread.rotX,
        rotateY: o.spread.rotY,
        rotateZ: o.spread.rotZ,
        scale: o.scaleFactor,
        ease: 'power2.out',
        duration: spreadDuration
      }, spreadStart);

      // Shadow becomes softer and wider when spread
      if (o.shadow) {
        mainTimeline.to(o.shadow, {
          opacity: 0.42,
          duration: spreadDuration,
          ease: 'power2.out'
        }, spreadStart);
      }

      // Page Turn 1 Extra Spin (Phase 3: Page 1 turns from Spread 1 to Spread 2, at timeline ~3.0 -> 4.5)
      mainTimeline.to(o.inner, {
        rotateY: `+=${o.pageSpin.y}`,
        rotateX: `+=${o.pageSpin.x * 0.5}`,
        rotateZ: `+=${o.pageSpin.z * 0.5}`,
        duration: 1.8,
        ease: 'power1.inOut'
      }, 3.0 + (i * 0.03));

      // Page Turn 2 Extra Spin (Phase 4: Page 2 turns from Spread 2 to Spread 3, at timeline ~5.0 -> 6.5)
      mainTimeline.to(o.inner, {
        rotateY: `+=${o.pageSpin.y * -0.8}`,
        rotateX: `+=${o.pageSpin.x * -0.6}`,
        rotateZ: `+=${o.pageSpin.z * -0.6}`,
        duration: 1.8,
        ease: 'power1.inOut'
      }, 5.0 + (i * 0.03));

      // Phase 5: RETURN to tight cluster as part of Step b when front cover swings shut (7.2 -> 8.6)
      // Clustered tightly around closed book outer edge, leaving back cover text and buttons completely clear
      const returnStart = 7.2 + (i * 0.04);
      mainTimeline.to(o.el, {
        x: o.cluster.x,
        y: o.cluster.y,
        z: o.cluster.z,
        rotateX: o.cluster.rotX,
        rotateY: o.cluster.rotY,
        rotateZ: o.cluster.rotZ,
        scale: o.scaleFactor,
        ease: 'power2.inOut',
        duration: 1.2
      }, returnStart);

      if (o.shadow) {
        mainTimeline.to(o.shadow, {
          opacity: 0.65,
          duration: 1.2,
          ease: 'power2.inOut'
        }, returnStart);
      }
    });

    // Window resize recalculation for spread positions
    window.addEventListener("resize", () => {
      const updated = computeCoordinates();
      objs.forEach(o => {
        o.scaleFactor = updated.scale;
        o.spreadX = o.side === 'left' ? -updated.leftMargin : updated.rightMargin;
      });
    }, { passive: true });
  }

  // ── 3. CONTINUOUS SELF-ROTATION & BOBBING IN PLACE (WHEN SPREAD & CLUSTERED) ──
  let rotActive = !reducedMotion;
  let lastTime = performance.now();
  let bobTime = 0;

  function ambientLoop(now) {
    if (!rotActive) return;
    const dt = Math.min(now - lastTime, 40); // cap delta time
    lastTime = now;
    bobTime += dt * 0.002;

    objs.forEach((o, idx) => {
      // Rotate on its own axis continuously
      o.selfRotX += o.spinRate.x * dt * 0.08;
      o.selfRotY += o.spinRate.y * dt * 0.08;
      o.selfRotZ += o.spinRate.z * dt * 0.08;

      // Gentle bob up and down (3-4 pixels max)
      const bob = Math.sin(bobTime + idx * 0.9) * 3.5;

      if (o.inner) {
        // Apply self spin + bob transform
        o.inner.style.transform = `translateY(${bob}px) rotateY(${o.selfRotY}deg) rotateX(${o.selfRotX}deg) rotateZ(${o.selfRotZ}deg)`;
      }
    });

    requestAnimationFrame(ambientLoop);
  }

  if (!reducedMotion) {
    requestAnimationFrame(ambientLoop);
  }

  // Hook into quality switch: stop spin & bobbing if FPS drops
  window._stopObjectRotation = function() {
    rotActive = false;
    objs.forEach(o => {
      if (o.inner) {
        o.inner.style.transform = 'none';
      }
    });
  };

  // Pause on visibility change
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      rotActive = false;
    } else if (!window._qualityDegraded && !reducedMotion) {
      rotActive = true;
      lastTime = performance.now();
      requestAnimationFrame(ambientLoop);
    }
  });
}

