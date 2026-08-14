/* ★ EXAMPLE BUILD A — spectacle by our own means.
   ★ ZERO DEPENDENCIES, ZERO NETWORK CALLS, NO ANALYTICS, NO FONTS FETCHED, NO KEYS.
   ★ scroll-world was NOT used: it bills per generated clip in USD and is blocked on a spend
     decision with Bode. Everything moving on this page is drawn locally on a <canvas>.
   ★ The hero visual is an ABSTRACT VITAL RHYTHM. It is deliberately non-representational:
     it must read "health" without asserting a specialty, a device, or a clinical claim,
     because the customer's actual business is UNKNOWN. */

(function () {
  'use strict';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── 1. generative pulse field ───────────────────────────────── */
  function pulseField(canvas, opts) {
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = 0, h = 0, t = 0;
    var LINES = opts.lines, AMP = opts.amp, SPEED = opts.speed;

    function size() {
      var r = canvas.getBoundingClientRect();
      w = r.width; h = r.height;
      canvas.width = Math.max(1, w * dpr);
      canvas.height = Math.max(1, h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    size();
    window.addEventListener('resize', size);

    // a soft ECG-ish spike shaped by a gaussian envelope — abstract, not a real trace
    function spike(x) {
      var g = Math.exp(-Math.pow((x - 0.5) * 9, 2));
      return g * Math.sin((x - 0.5) * 30);
    }

    function frame() {
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < LINES; i++) {
        var p = i / (LINES - 1);
        var yBase = h * (0.30 + p * 0.44);
        var phase = t * SPEED + i * 0.55;
        var alpha = 0.045 + (1 - Math.abs(p - 0.5) * 2) * 0.16;

        ctx.beginPath();
        for (var x = 0; x <= w; x += 5) {
          var u = x / w;
          var y = yBase
            + Math.sin(u * 5.2 + phase) * AMP * (0.55 + p * 0.5)
            + spike(((u + t * 0.06 + i * 0.17) % 1)) * AMP * 1.5;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        var grad = ctx.createLinearGradient(0, 0, w, 0);
        grad.addColorStop(0, 'rgba(95,240,196,0)');
        grad.addColorStop(0.35, 'rgba(95,240,196,' + alpha.toFixed(3) + ')');
        grad.addColorStop(0.72, 'rgba(57,178,255,' + (alpha * 0.85).toFixed(3) + ')');
        grad.addColorStop(1, 'rgba(57,178,255,0)');
        ctx.strokeStyle = grad;
        ctx.lineWidth = i === Math.floor(LINES / 2) ? 1.6 : 1;
        ctx.stroke();
      }
      t += reduced ? 0 : 0.016;
      requestAnimationFrame(frame);
    }
    frame();
  }

  pulseField(document.getElementById('pulse'),  { lines: 13, amp: 26, speed: 0.9 });
  pulseField(document.getElementById('pulse2'), { lines: 7,  amp: 16, speed: 0.6 });

  /* ── 2. reveal on enter ──────────────────────────────────────── */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.16, rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.reveal, .step').forEach(function (el) { io.observe(el); });

  /* ── 3. pathway rail fills with scroll progress ──────────────── */
  var pathway = document.getElementById('pathway');
  var fill = document.getElementById('railfill');
  function railTick() {
    if (!pathway || !fill) return;
    var r = pathway.getBoundingClientRect();
    var vh = window.innerHeight;
    var p = (vh - r.top) / (vh + r.height);
    fill.style.height = (Math.max(0, Math.min(1, p)) * 100).toFixed(2) + '%';
  }
  addEventListener('scroll', railTick, { passive: true });
  addEventListener('resize', railTick);
  railTick();
})();
