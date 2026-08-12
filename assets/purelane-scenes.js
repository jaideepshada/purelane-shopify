(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- reveal on scroll ---------- */
  var revs = document.querySelectorAll('.rv');
  if ('IntersectionObserver' in window && !reduce) {
    var ro = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); ro.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });
    revs.forEach(function (el) { ro.observe(el); });
  } else {
    revs.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- scene crossfade (scroll driven, deterministic) ---------- */
  var scenes = [].slice.call(document.querySelectorAll('.scene'));
  var zones = [].slice.call(document.querySelectorAll('[data-scene]'));
  var stage = document.getElementById('scenes');
  var current = 0;
  function setScene(n) {
    if (n === current) return;
    current = n;
    scenes.forEach(function (s, i) { s.classList.toggle('on', i + 1 === n); });
    if (stage) stage.setAttribute('data-d', String(n));
  }
  function pickScene() {
    var focus = window.scrollY + window.innerHeight * 0.5, n = 1;
    for (var i = 0; i < zones.length; i++) {
      var z = zones[i], top = 0, el = z;
      while (el) { top += el.offsetTop; el = el.offsetParent; }
      if (top <= focus) n = parseInt(z.getAttribute('data-scene'), 10) || n;
    }
    setScene(n);
  }

  /* ---------- parallax + header ---------- */
  var hdr = document.getElementById('hdr');
  var prod = document.getElementById('heroProd');
  var raf = null, mx = 0, my = 0;

  function frame() {
    raf = null;
    var y = window.scrollY || window.pageYOffset;
    if (hdr) hdr.classList.toggle('up', y > 90);
    if (!reduce) {
      var wl = document.querySelectorAll('#water .wl');
      for (var i = 0; i < wl.length; i++) {
        var d = [0.05, 0.09, 0.03, 0.02][i] || 0.05;
        wl[i].style.setProperty('--px', (mx * d * 130).toFixed(1) + 'px');
        wl[i].style.setProperty('--py', (-y * d + my * d * 90).toFixed(1) + 'px');
      }
      if (prod) {
        var f = Math.min(y / 700, 1);
        prod.style.transform = 'translate3d(' + (mx * -16).toFixed(2) + 'px,' + (-f * 54 + my * -10).toFixed(2) + 'px,0) scale(' + (1 - f * 0.06).toFixed(3) + ')';
        prod.style.opacity = (1 - f * 0.55).toFixed(3);
      }
    }
    pickScene();
  }
  function onScroll() { if (!raf) raf = requestAnimationFrame(frame); }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);

  if (!reduce && window.matchMedia('(min-width: 1024px)').matches) {
    window.addEventListener('mousemove', function (e) {
      mx = (e.clientX / window.innerWidth - 0.5) * 2;
      my = (e.clientY / window.innerHeight - 0.5) * 2;
      onScroll();
    }, { passive: true });
  }

  /* ---------- ambient drift on the hero product ---------- */
  if (!reduce && prod) {
    prod.animate(
      [{ filter: 'drop-shadow(0 34px 54px rgba(2,20,19,.6))' },
       { filter: 'drop-shadow(0 42px 68px rgba(2,20,19,.68))' },
       { filter: 'drop-shadow(0 34px 54px rgba(2,20,19,.6))' }],
      { duration: 7000, iterations: Infinity, easing: 'ease-in-out' }
    );
  }

  frame();
})();
