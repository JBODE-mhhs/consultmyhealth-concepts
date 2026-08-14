/* Consult My Health — example build B
   Scroll behaviour. ~1.5 KB, no dependencies.

   Design rule: the page is COMPLETE AND READABLE WITH THIS FILE ABSENT.
   Everything here is progressive enhancement over static HTML/CSS.
   If prefers-reduced-motion is set we attach nothing at all — no observers,
   no scroll listener, no work. That is cheaper AND more accessible, which is
   the argument for doing it this way rather than animating-then-suppressing. */

(function () {
  'use strict';

  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) return;                       // ← the whole enhancement, opted out in one line

  var supportsIO = 'IntersectionObserver' in window;

  /* ── 1. reveals ─────────────────────────────────────────────────
     Fire once, then stop observing. A reveal that re-triggers on scroll-up
     reads as a glitch and costs work forever. */
  var revealables = document.querySelectorAll('.reveal');
  if (supportsIO) {
    var revealIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        revealIO.unobserve(e.target);        // once. never again.
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    revealables.forEach(function (el, i) {
      // Stagger only within a row-ish group, capped — long staggers feel broken.
      el.style.transitionDelay = Math.min(i % 4, 3) * 60 + 'ms';
      revealIO.observe(el);
    });
  } else {
    revealables.forEach(function (el) { el.classList.add('in'); });  // no IO → show everything
  }

  /* ── 2. "how it works" sequence ─────────────────────────────────
     The pinned visual tracks which step you are reading. This is the one
     place motion CARRIES INFORMATION rather than decorating: the card that
     is showing corresponds to the step you are on. */
  var steps = Array.prototype.slice.call(document.querySelectorAll('.step'));
  var cards = Array.prototype.slice.call(document.querySelectorAll('.pcard'));

  function activate(n) {
    steps.forEach(function (s) { s.classList.toggle('active', s.dataset.step === String(n)); });
    cards.forEach(function (c) { c.classList.toggle('show', c.dataset.card === String(n)); });
  }

  if (steps.length && supportsIO) {
    activate(1);                              // never start blank
    var stepIO = new IntersectionObserver(function (entries) {
      // Pick the entry nearest the middle of the viewport — avoids the flicker
      // you get from "last one to cross a line wins" when two are visible.
      var best = null, bestDist = Infinity, mid = window.innerHeight / 2;
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var r = e.target.getBoundingClientRect();
        var d = Math.abs((r.top + r.height / 2) - mid);
        if (d < bestDist) { bestDist = d; best = e.target; }
      });
      if (best) activate(best.dataset.step);
    }, { rootMargin: '-30% 0px -30% 0px', threshold: [0, 0.5, 1] });
    steps.forEach(function (s) { stepIO.observe(s); });
  } else {
    cards.forEach(function (c) { c.classList.add('show'); });
    steps.forEach(function (s) { s.classList.add('active'); });
  }

  /* ── 3. scroll progress ─────────────────────────────────────────
     rAF-throttled so we do at most one layout read per frame. */
  var bar = document.querySelector('.progress span');
  if (bar) {
    var ticking = false;
    var onScroll = function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var h = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + '%';
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
})();
