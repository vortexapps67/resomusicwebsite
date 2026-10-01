/* =========================================================================
   RESO MUSIC â€” interactions
   Built by OCTA DEVS Â· https://octadevs.fun
   No dependencies. Everything degrades gracefully without JS.
   ========================================================================= */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* -------------------------------------------------------------- 1b. LENIS
     Smooth scrolling. Progressive enhancement: if the script is missing, or the
     visitor prefers reduced motion, `lenis` stays null and the page falls back
     to native `scroll-behavior: smooth` from the CSS. Everything below must
     therefore work with Lenis *and* without it.

     syncTouch is off deliberately — hijacking touch scrolling makes phones feel
     wrong and is hostile on iOS. Mouse/trackpad gets the silky easing. */
  var lenis = null;

  if (window.Lenis && !reduceMotion.matches) {
    try {
      lenis = new window.Lenis({
        duration: 1.15,          // seconds; a touch under 1.2 keeps it responsive
        easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
        smoothWheel: true,
        syncTouch: false,        // leave touch scrolling native
        wheelMultiplier: 1,
        autoRaf: false
      });

      /* Lenis needs its own frame pump. */
      (function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      })(0);
    } catch (e) {
      lenis = null;             // fall back to native scrolling
    }
  }

  /* ------------------------------------------------------ 1. THEME TOGGLE */
  var STORAGE_KEY = 'reso-theme';

  function getTheme() {
    try {
      var stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'light' || stored === 'dark') return stored;
    } catch (e) { /* private mode */ }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function setTheme(theme, persist) {
    root.setAttribute('data-theme', theme);
    if (persist) {
      try { localStorage.setItem(STORAGE_KEY, theme); } catch (e) { /* ignore */ }
    }
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute('content', theme === 'dark' ? '#0f0b08' : '#fbf6ee');
    }
    document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
      btn.setAttribute('aria-pressed', String(theme === 'dark'));
      btn.setAttribute('aria-label',
        theme === 'dark' ? 'Switch to light appearance' : 'Switch to dark appearance');
    });
  }

  setTheme(getTheme(), false);

  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-theme-toggle]');
    if (!btn) return;
    setTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark', true);
  });

  // follow the OS only while the visitor has not chosen for themselves
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
    var stored = null;
    try { stored = localStorage.getItem(STORAGE_KEY); } catch (err) { /* ignore */ }
    if (!stored) setTheme(e.matches ? 'dark' : 'light', false);
  });

  /* ------------------------------------------------- 2. MOBILE NAV TOGGLE */
  var burger = document.querySelector('[data-nav-toggle]');
  var navLinks = document.querySelector('[data-nav-menu]');

  function closeNav() {
    if (!navLinks) return;
    navLinks.dataset.open = 'false';
    if (burger) burger.setAttribute('aria-expanded', 'false');
  }

  if (burger && navLinks) {
    burger.addEventListener('click', function () {
      var open = navLinks.dataset.open === 'true';
      navLinks.dataset.open = String(!open);
      burger.setAttribute('aria-expanded', String(!open));
    });
    navLinks.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeNav();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeNav();
    });
    document.addEventListener('click', function (e) {
      if (!e.target.closest('.nav')) closeNav();
    });
  }

  /* ------------------------------------------------- 3. STICKY NAV SHADOW */
  var nav = document.querySelector('[data-nav]');
  if (nav) {
    var onScroll = function () {
      nav.dataset.stuck = String(window.scrollY > 12);
    };
    onScroll();
    if (lenis) {
      /* Lenis drives the scroll, so subscribe to its event rather than the
         native one — this also catches the sub-pixel eased frames. */
      lenis.on('scroll', onScroll);
    } else {
      window.addEventListener('scroll', onScroll, { passive: true });
    }
  }

  /* ------------------------------------------------- 4. SCROLL REVEAL */
  var revealables = document.querySelectorAll('[data-reveal]');
  if (revealables.length) {
    if (reduceMotion.matches || !('IntersectionObserver' in window)) {
      revealables.forEach(function (el) { el.classList.add('is-in'); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        });
      }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });
      revealables.forEach(function (el) { io.observe(el); });
    }
  }

  /* ------------------------------------------- 5. LEGAL PAGE Â· TABLE OF
     CONTENTS â€” highlights the section you are reading.                   */
  var tocLinks = document.querySelectorAll('.toc a[href^="#"]');
  if (tocLinks.length && 'IntersectionObserver' in window) {
    var sections = Array.prototype.map.call(tocLinks, function (a) {
      return document.getElementById(a.getAttribute('href').slice(1));
    }).filter(Boolean);

    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        tocLinks.forEach(function (a) {
          var active = a.getAttribute('href') === '#' + entry.target.id;
          a.classList.toggle('is-active', active);
          if (active) a.setAttribute('aria-current', 'true');
          else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-15% 0px -70% 0px', threshold: 0 });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* -------------------------------- 6. SCREENSHOT SLOTS â€” hide the
     placeholder the moment a real screenshot is dropped in.              */
  document.querySelectorAll('.shot img').forEach(function (img) {
    var markFilled = function () { img.closest('.shot').classList.add('is-filled'); };
    if (img.complete && img.naturalWidth > 0) markFilled();
    img.addEventListener('load', markFilled);
    img.addEventListener('error', function () { img.closest('.shot').classList.remove('is-filled'); });
  });

  /* ------------------------------------------- 7. AMBIENT SPECTRUM CANVAS
     The one piece of motion that carries the product: a spectrum analyser.
     Cheap, paused when off-screen, frozen under reduced motion.          */
  function mountSpectrum(canvas) {
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    if (!ctx) return;

    var BARS = 56;
    var levels = new Array(BARS);
    for (var i = 0; i < BARS; i++) levels[i] = 0.12 + Math.random() * 0.2;

    var running = false;
    var rafId = 0;
    var t = 0;

    function readAccent() {
      /* must be a plain hex/rgb string: canvas addColorStop cannot parse oklch() */
      var probe = getComputedStyle(root).getPropertyValue('--accent-canvas').trim();
      if (!/^(#|rgb|hsl)/i.test(probe)) probe = '#f08c1a';
      return probe;
    }
    var accent = readAccent();

    function resize() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var rect = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function draw() {
      try {
        var rect = canvas.getBoundingClientRect();
        var w = rect.width;
        var h = rect.height;
        if (!w || !h) { rafId = requestAnimationFrame(draw); return; }

        ctx.clearRect(0, 0, w, h);

        var gap = Math.max(1, (w / BARS) * 0.34);
        var bw = (w - gap * (BARS - 1)) / BARS;
        var radius = Math.min(bw / 2, 3);

        for (var i = 0; i < BARS; i++) {
          // a travelling envelope so the bar field reads as one waveform
          var wave = Math.sin((i / BARS) * Math.PI * 2 + t * 0.7) * 0.5 + 0.5;
          var target = 0.14 + wave * 0.72 * (0.45 + 0.55 * Math.sin(t * 0.31 + i * 0.19));
          levels[i] += (target - levels[i]) * 0.14;

          var bh = Math.max(2, levels[i] * h);
          var x = i * (bw + gap);
          var y = (h - bh) / 2;

          var grad = ctx.createLinearGradient(0, y, 0, y + bh);
          grad.addColorStop(0, accent);
          grad.addColorStop(1, 'rgba(255,255,255,0.14)');
          ctx.fillStyle = grad;

          ctx.beginPath();
          if (ctx.roundRect) ctx.roundRect(x, y, bw, bh, radius);
          else ctx.rect(x, y, bw, bh);
          ctx.fill();
        }
        t += 0.045;
      } catch (err) {
        /* never let one bad frame kill the loop */
      }
      rafId = requestAnimationFrame(draw);
    }

    function start() {
      if (running || reduceMotion.matches) return;
      running = true;
      rafId = requestAnimationFrame(draw);
    }
    function stop() {
      running = false;
      cancelAnimationFrame(rafId);
    }

    if (reduceMotion.matches) {
      // one static, well-composed frame
      resize();
      t = 1.2;
      var rect = canvas.getBoundingClientRect();
      if (rect.width) {
        ctx.clearRect(0, 0, rect.width, rect.height);
        for (var k = 0; k < BARS; k++) {
          var wave2 = Math.sin((k / BARS) * Math.PI * 2 + 0.84) * 0.5 + 0.5;
          var bh2 = Math.max(2, (0.16 + wave2 * 0.6) * rect.height);
          var bw2 = (rect.width - (rect.width / BARS * 0.34) * (BARS - 1)) / BARS;
          var x2 = k * (bw2 + rect.width / BARS * 0.34);
          var y2 = (rect.height - bh2) / 2;
          ctx.fillStyle = accent;
          ctx.beginPath();
          if (ctx.roundRect) ctx.roundRect(x2, y2, bw2, bh2, Math.min(bw2 / 2, 3));
          else ctx.rect(x2, y2, bw2, bh2);
          ctx.fill();
        }
      }
    } else {
      resize();
      window.addEventListener('resize', resize, { passive: true });

      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (entries) {
          entries[0].isIntersecting ? start() : stop();
        }, { threshold: 0 }).observe(canvas);
      } else {
        start();
      }

      document.addEventListener('visibilitychange', function () {
        document.hidden ? stop() : start();
      });

      var themeObserver = new MutationObserver(function () {
        accent = readAccent();
        resize();
      });
      themeObserver.observe(root, { attributes: true, attributeFilter: ['data-theme'] });
    }
  }

  document.querySelectorAll('[data-spectrum]').forEach(mountSpectrum);

  /* ------------------------------------------------------- 8. IN-PAGE NAV
     With overflow-x moved to <html> as `clip`, native smooth scroll works
     cleanly on the viewport. We keep focus management and respect reduced
     motion, without hand-rolling RAF (which doesn't tick reliably here). */
  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest('a[href]');
    if (!a || a.target === '_blank' || a.hasAttribute('download')) return;

    var href = a.getAttribute('href');
    if (!href || href.charAt(0) !== '#' || href.length < 2) return;

    var id;
    try { id = decodeURIComponent(href.slice(1)); } catch (err) { id = href.slice(1); }
    var target = document.getElementById(id);
    if (!target) return; // leave it to the browser / a real page

    e.preventDefault();
    closeNav();

    /* Make the target programmatically focusable so keyboard/screen-reader
       users land in a meaningful place after jumping. */
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    try { target.focus({ preventScroll: true }); } catch (err) { /* ignore */ }

    if (lenis) {
      /* Lenis ignores CSS scroll-padding, so hand it the offset explicitly.
         --scroll-pad keeps the destination clear of the sticky nav. */
      var pad = parseFloat(getComputedStyle(root).getPropertyValue('--scroll-pad')) || 0;
      lenis.scrollTo(target, { offset: -pad, duration: 1.15 });
    } else {
      target.scrollIntoView({
        behavior: reduceMotion.matches ? 'auto' : 'smooth',
        block: 'start',
        inline: 'nearest'
      });
    }

    if (history.replaceState) history.replaceState(null, '', href);
  });

  /* ---------------------------------------------- 9. CURRENT YEAR IN FOOT */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });
})();
