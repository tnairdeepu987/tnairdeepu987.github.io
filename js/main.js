/* ============================================================
   Deepu T Nair — Portfolio interactions
   Vanilla JS, no dependencies.
   ============================================================ */
(function () {
  'use strict';

  const $  = (s, ctx) => (ctx || document).querySelector(s);
  const $$ = (s, ctx) => Array.from((ctx || document).querySelectorAll(s));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;

  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FINE_POINTER = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------------------------------------------------------
     1. Preloader
     --------------------------------------------------------- */
  function initPreloader(onDone) {
    const el = $('#preloader');
    const ring = $('.pl-ring--fill');
    const pct = $('#preloaderPct');
    const CIRC = 2 * Math.PI * 46;

    if (!el) { onDone(); return; }
    if (REDUCED) {
      el.classList.add('is-done');
      setTimeout(() => el.remove(), 400);
      onDone();
      return;
    }

    document.body.classList.add('is-locked');

    let p = 0;
    let settled = false;
    const paint = () => {
      if (ring) ring.style.strokeDashoffset = String(CIRC * (1 - p / 100));
      if (pct) pct.textContent = Math.round(p) + '%';
    };
    paint();

    const tick = setInterval(() => {
      // creep toward 90 while assets load, then snap to 100
      const ceiling = settled ? 100 : 92;
      p = Math.min(ceiling, p + (ceiling - p) * 0.14 + 1.2);
      paint();
      if (p > 99.4) {
        clearInterval(tick);
        p = 100; paint();
        setTimeout(finish, 260);
      }
    }, 55);

    const markSettled = () => { settled = true; };
    if (document.readyState === 'complete') setTimeout(markSettled, 220);
    else window.addEventListener('load', () => setTimeout(markSettled, 220));
    // never trap the visitor behind a stalled asset
    setTimeout(markSettled, 2600);

    let finished = false;
    function finish() {
      if (finished) return;
      finished = true;
      el.classList.add('is-done');
      document.body.classList.remove('is-locked');
      setTimeout(() => el.remove(), 800);
      onDone();
    }
  }

  /* ---------------------------------------------------------
     2. Split headline into animated characters
     --------------------------------------------------------- */
  function splitHeadings() {
    $$('[data-split]').forEach((node, wordIdx) => {
      const text = node.textContent;
      node.textContent = '';
      const frag = document.createDocumentFragment();
      Array.from(text).forEach((char, i) => {
        const span = document.createElement('span');
        span.className = 'ch';
        span.textContent = char === ' ' ? ' ' : char;
        span.style.animationDelay = (wordIdx * 190 + i * 42) + 'ms';
        frag.appendChild(span);
      });
      node.appendChild(frag);
    });
    paintGradientText();
    window.addEventListener('resize', paintGradientText);
    // the headline can be laid out before fonts settle, or inside a container
    // that is still zero-width; re-stitch whenever its box actually changes
    if ('ResizeObserver' in window) {
      const ro = new ResizeObserver(() => paintGradientText());
      $$('.split--accent').forEach((n) => ro.observe(n));
    }
  }

  // Stitch the per-character gradient slices back into one continuous sweep.
  // offsetLeft/offsetWidth are used deliberately: they ignore the entrance
  // transform still running on each character.
  function paintGradientText() {
    $$('.split--accent').forEach((node) => {
      const chars = $$('.ch', node);
      if (!chars.length) return;
      const first = chars[0];
      const last = chars[chars.length - 1];
      const width = last.offsetLeft + last.offsetWidth - first.offsetLeft;
      if (width <= 0) return;
      chars.forEach((ch) => {
        ch.style.backgroundSize = width + 'px 100%';
        ch.style.backgroundPositionX = -(ch.offsetLeft - first.offsetLeft) + 'px';
      });
    });
  }

  /* ---------------------------------------------------------
     3. Typewriter for the rotating role line
     --------------------------------------------------------- */
  function initTypewriter() {
    const target = $('#typeTarget');
    if (!target) return;

    const phrases = [
      'cloud-native .NET platforms.',
      'microservices out of monoliths.',
      'CI/CD pipelines teams trust.',
      'event-driven, async systems.',
      'SQL that actually stays fast.'
    ];

    if (REDUCED) { target.textContent = phrases[0]; return; }

    let pi = 0, ci = 0, deleting = false;

    (function step() {
      const full = phrases[pi];
      target.textContent = full.slice(0, ci);

      let wait;
      if (!deleting) {
        ci++;
        wait = 52 + Math.random() * 48;
        if (ci > full.length) { deleting = true; wait = 1900; }
      } else {
        ci--;
        wait = 26;
        if (ci === 0) { deleting = false; pi = (pi + 1) % phrases.length; wait = 320; }
      }
      setTimeout(step, wait);
    })();
  }

  /* ---------------------------------------------------------
     4. Scroll reveals (+ staggered delays)
     --------------------------------------------------------- */
  function initReveals() {
    const items = $$('.reveal');
    if (REDUCED || !('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('is-in'));
      return;
    }

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const delay = parseInt(el.dataset.delay || '0', 10);
        setTimeout(() => el.classList.add('is-in'), delay);
        io.unobserve(el);
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });

    items.forEach((el) => io.observe(el));
  }

  /* ---------------------------------------------------------
     5. Counters
     --------------------------------------------------------- */
  function initCounters() {
    const nodes = $$('.counter');
    if (!nodes.length) return;

    const run = (el) => {
      const target = parseFloat(el.dataset.count || '0');
      const suffix = el.dataset.suffix || '';
      const dur = 1600;
      const t0 = performance.now();
      const frame = (now) => {
        const t = clamp((now - t0) / dur, 0, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = Math.round(target * eased) + (t === 1 ? suffix : '');
        if (t < 1) requestAnimationFrame(frame);
      };
      requestAnimationFrame(frame);
    };

    // with reduced motion there is nothing to reveal, so show the final values now
    if (REDUCED) {
      nodes.forEach((el) => {
        el.textContent = (el.dataset.count || '0') + (el.dataset.suffix || '');
      });
      return;
    }
    if (!('IntersectionObserver' in window)) { nodes.forEach(run); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { run(e.target); io.unobserve(e.target); }
      });
    }, { threshold: 0.5 });
    nodes.forEach((n) => io.observe(n));
  }

  /* ---------------------------------------------------------
     6. Skill bars
     --------------------------------------------------------- */
  function initBars() {
    const bars = $$('.bar');
    if (!bars.length) return;

    const fill = (bar, i) => {
      const level = parseInt(bar.dataset.level || '0', 10);
      const inner = $('i', bar);
      if (!inner) return;
      setTimeout(() => { inner.style.width = level + '%'; }, REDUCED ? 0 : i * 110);
    };

    if (!('IntersectionObserver' in window) || REDUCED) {
      bars.forEach((b, i) => fill(b, i));
      return;
    }

    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const group = $$('.bar', e.target);
        group.forEach(fill);
        io.unobserve(e.target);
      });
    }, { threshold: 0.28 });

    $$('.bars').forEach((g) => io.observe(g));
  }

  /* ---------------------------------------------------------
     7. Nav: sticky, scroll-spy, pill indicator, mobile menu
     --------------------------------------------------------- */
  function initNav() {
    const nav = $('#nav');
    const links = $$('[data-nav]');
    const indicator = $('#navIndicator');
    const burger = $('#navBurger');
    const sections = links
      .map((a) => $(a.getAttribute('href')))
      .filter(Boolean);

    const moveIndicator = (el) => {
      if (!indicator || !el || window.innerWidth <= 860) return;
      indicator.style.left = el.offsetLeft + 'px';
      indicator.style.width = el.offsetWidth + 'px';
      indicator.style.opacity = '1';
    };
    const hideIndicator = () => { if (indicator) indicator.style.opacity = '0'; };

    links.forEach((a) => {
      a.addEventListener('mouseenter', () => moveIndicator(a));
      a.addEventListener('click', () => closeMenu());
    });
    $('#navLinks')?.addEventListener('mouseleave', () => {
      const active = links.find((a) => a.classList.contains('is-active'));
      active ? moveIndicator(active) : hideIndicator();
    });

    function closeMenu() {
      nav?.classList.remove('is-open');
      burger?.setAttribute('aria-expanded', 'false');
    }
    burger?.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', String(open));
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });

    // scroll-spy
    if ('IntersectionObserver' in window && sections.length) {
      const spy = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const id = e.target.id;
          links.forEach((a) => {
            const on = a.getAttribute('href') === '#' + id;
            a.classList.toggle('is-active', on);
            if (on) moveIndicator(a);
          });
        });
      }, { rootMargin: '-45% 0px -50% 0px' });
      sections.forEach((s) => spy.observe(s));
    }

    window.addEventListener('resize', () => {
      const active = links.find((a) => a.classList.contains('is-active'));
      active ? moveIndicator(active) : hideIndicator();
    });

    return nav;
  }

  /* ---------------------------------------------------------
     8. Scroll-driven bits: progress bar, nav shadow, timeline
     --------------------------------------------------------- */
  function initScrollDriven(nav) {
    const bar = $('#scrollBar');
    const timeline = $('#timeline');
    const tlFill = $('#timelineFill');
    let raf = null;

    const update = () => {
      raf = null;
      const y = window.scrollY || window.pageYOffset;
      const max = document.documentElement.scrollHeight - window.innerHeight;

      if (bar) bar.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
      if (nav) nav.classList.toggle('is-stuck', y > 24);

      if (timeline && tlFill) {
        const r = timeline.getBoundingClientRect();
        const start = window.innerHeight * 0.82;
        const progress = clamp((start - r.top) / (r.height * 0.86), 0, 1);
        tlFill.style.height = (progress * 100) + '%';
      }
    };

    const onScroll = () => { if (raf === null) raf = requestAnimationFrame(update); };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
  }

  /* ---------------------------------------------------------
     9. Cursor glow
     --------------------------------------------------------- */
  function initCursor() {
    const glow = $('#cursorGlow');
    if (!glow || !FINE_POINTER || REDUCED) return;

    let tx = window.innerWidth / 2, ty = window.innerHeight / 2;
    let cx = tx, cy = ty;

    window.addEventListener('mousemove', (e) => {
      tx = e.clientX; ty = e.clientY;
      document.body.classList.add('has-cursor');
    }, { passive: true });

    (function loop() {
      cx = lerp(cx, tx, 0.09);
      cy = lerp(cy, ty, 0.09);
      glow.style.transform = 'translate3d(' + cx + 'px,' + cy + 'px,0)';
      requestAnimationFrame(loop);
    })();
  }

  /* ---------------------------------------------------------
     10. Magnetic buttons
     --------------------------------------------------------- */
  function initMagnetic() {
    if (!FINE_POINTER || REDUCED) return;

    $$('.magnetic').forEach((el) => {
      const strength = 0.24;
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) * strength;
        const dy = (e.clientY - (r.top + r.height / 2)) * strength;
        el.style.transform = 'translate(' + dx.toFixed(2) + 'px,' + dy.toFixed(2) + 'px)';
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  }

  /* ---------------------------------------------------------
     11. 3D tilt + spotlight on cards
     --------------------------------------------------------- */
  function initTilt() {
    if (!FINE_POINTER || REDUCED) return;

    $$('.tilt').forEach((card) => {
      const MAX = 7;
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        card.style.setProperty('--mx', (px * 100) + '%');
        card.style.setProperty('--my', (py * 100) + '%');
        card.style.transform =
          'perspective(1000px) rotateY(' + ((px - 0.5) * MAX * 2).toFixed(2) + 'deg)' +
          ' rotateX(' + ((0.5 - py) * MAX * 2).toFixed(2) + 'deg)' +
          ' translateY(-4px)';
      });
      card.addEventListener('mouseleave', () => {
        card.style.transition = 'transform .7s cubic-bezier(.22,1,.36,1)';
        card.style.transform = '';
        setTimeout(() => { card.style.transition = ''; }, 720);
      });
      card.addEventListener('mouseenter', () => { card.style.transition = ''; });
    });
  }

  /* ---------------------------------------------------------
     12. Constellation canvas background
     --------------------------------------------------------- */
  function initConstellation() {
    const canvas = $('#constellation');
    if (!canvas || REDUCED) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = 0, h = 0, dpr = 1, dots = [], raf = null, running = true;
    const mouse = { x: -9999, y: -9999 };

    function size() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      // a hidden or not-yet-laid-out viewport reports 0; retry rather than
      // permanently sizing the canvas to nothing
      if (w < 1 || h < 1) { requestAnimationFrame(size); return; }
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    }

    function seed() {
      const density = Math.round((w * h) / 19000);
      const count = clamp(density, 34, 108);
      dots = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.24,
        vy: (Math.random() - 0.5) * 0.24,
        r: Math.random() * 1.5 + 0.6
      }));
    }

    const LINK = 132;

    function draw() {
      raf = null;
      ctx.clearRect(0, 0, w, h);

      for (let i = 0; i < dots.length; i++) {
        const d = dots[i];
        d.x += d.vx; d.y += d.vy;
        if (d.x < -20) d.x = w + 20; else if (d.x > w + 20) d.x = -20;
        if (d.y < -20) d.y = h + 20; else if (d.y > h + 20) d.y = -20;

        // pull gently toward the pointer
        const mdx = mouse.x - d.x, mdy = mouse.y - d.y;
        const md2 = mdx * mdx + mdy * mdy;
        if (md2 < 26000) {
          d.x += mdx * 0.0016;
          d.y += mdy * 0.0016;
        }

        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(180,205,255,.5)';
        ctx.fill();
      }

      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const a = dots[i], b = dots[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist2 = dx * dx + dy * dy;
          if (dist2 > LINK * LINK) continue;
          const t = 1 - Math.sqrt(dist2) / LINK;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = 'rgba(120,170,240,' + (t * 0.22).toFixed(3) + ')';
          ctx.lineWidth = 0.7;
          ctx.stroke();
        }
      }

      if (running) raf = requestAnimationFrame(draw);
    }

    window.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
    window.addEventListener('mouseout', () => { mouse.x = mouse.y = -9999; });

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(size, 180);
    });

    // pause when the tab is hidden
    document.addEventListener('visibilitychange', () => {
      running = !document.hidden;
      if (running && raf === null) raf = requestAnimationFrame(draw);
    });

    size();
    raf = requestAnimationFrame(draw);
  }

  /* ---------------------------------------------------------
     13. Hero parallax on the portrait
     --------------------------------------------------------- */
  function initHeroParallax() {
    const portrait = $('#portrait');
    if (!portrait || !FINE_POINTER || REDUCED) return;

    const hero = $('#hero');
    let raf = null, tx = 0, ty = 0, cx = 0, cy = 0;

    hero.addEventListener('mousemove', (e) => {
      const r = hero.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * 22;
      ty = ((e.clientY - r.top) / r.height - 0.5) * 22;
      if (raf === null) raf = requestAnimationFrame(loop);
    }, { passive: true });

    hero.addEventListener('mouseleave', () => { tx = 0; ty = 0; });

    function loop() {
      raf = null;
      cx = lerp(cx, tx, 0.07);
      cy = lerp(cy, ty, 0.07);
      portrait.style.transform =
        'perspective(1100px) rotateY(' + cx.toFixed(2) + 'deg) rotateX(' + (-cy).toFixed(2) + 'deg)';
      if (Math.abs(cx - tx) > 0.03 || Math.abs(cy - ty) > 0.03) raf = requestAnimationFrame(loop);
    }
  }

  /* ---------------------------------------------------------
     14. Smooth in-page scrolling that respects the fixed nav
     --------------------------------------------------------- */
  function initAnchors() {
    $$('a[href^="#"]').forEach((a) => {
      a.addEventListener('click', (e) => {
        const id = a.getAttribute('href');
        if (!id || id === '#') return;
        const target = $(id);
        if (!target) return;
        e.preventDefault();
        const offset = id === '#hero' ? 0 : 74;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: REDUCED ? 'auto' : 'smooth' });
        history.replaceState(null, '', id);
      });
    });
  }

  /* ---------------------------------------------------------
     Boot
     --------------------------------------------------------- */
  /* ---------------------------------------------------------
     15. Safety net
     Everything that fades in starts at opacity 0. If IntersectionObserver
     never dispatches (embedded viewers, odd visibility states, browser
     quirks) the page would read as blank, so reveal it unconditionally.
     --------------------------------------------------------- */
  function installRevealFallback() {
    setTimeout(() => {
      if (document.querySelector('.reveal.is-in')) return;
      $$('.reveal').forEach((el) => el.classList.add('is-in'));
      $$('.counter').forEach((el) => {
        el.textContent = (el.dataset.count || '0') + (el.dataset.suffix || '');
      });
      $$('.bar').forEach((b) => {
        const inner = $('i', b);
        if (inner) inner.style.width = (b.dataset.level || 0) + '%';
      });
      const fill = $('#timelineFill');
      if (fill) fill.style.height = '100%';
    }, 2500);
  }

  // one broken enhancement must never take the whole page down
  function safe(fn, arg) {
    try { return fn(arg); }
    catch (err) { console.warn('[portfolio] ' + fn.name + ' failed:', err); }
  }

  function boot() {
    const y = $('#year');
    if (y) y.textContent = String(new Date().getFullYear());

    safe(splitHeadings);
    // webfonts change glyph widths, so re-stitch the gradient once they land
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => safe(paintGradientText));
    }
    const nav = safe(initNav);
    safe(initScrollDriven, nav);
    safe(initAnchors);
    safe(initCursor);
    safe(initMagnetic);
    safe(initTilt);
    safe(initConstellation);
    safe(initHeroParallax);

    safe(initPreloader, () => {
      safe(initReveals);
      safe(initCounters);
      safe(initBars);
      safe(initTypewriter);
      safe(installRevealFallback);
      // restart the headline character animation so it plays after the curtain lifts
      $$('.split .ch').forEach((ch) => {
        ch.style.animation = 'none';
        void ch.offsetWidth;
        ch.style.animation = '';
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
