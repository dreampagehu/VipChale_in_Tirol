/* ============================================================
   Chalet in Tirol — görgetéssel vezérelt videós hero
   ------------------------------------------------------------
   A videó soha nem indul el magától: az aktuális időpontját
   kizárólag a görgetési pozíció határozza meg — lefelé előre,
   felfelé visszafelé. Nincs hang, nincs vezérlő, nincs loop.
   ============================================================ */
(function () {
  'use strict';

  /* ═════════ ITT CSERÉLD A FÁJLOK ELÉRÉSI ÚTJÁT ═════════
     Három felbontás: a böngésző a képernyő és a kapcsolat alapján választ.
     Ha csak egy fájlod van, írd mindhárom sorba ugyanazt. */
  var desktopVideoUrl = "assets/chalet-hero-1080.mp4";    /* nagy / Retina képernyő */
  var tabletVideoUrl  = "assets/chalet-hero.mp4";         /* közepes képernyő, lassú net */
  var mobileVideoUrl  = "assets/chalet-hero-portre.mp4";  /* álló telefon (9:16 vágás) */
  var posterUrl       = "assets/chalet-poster.jpg";
  var posterMobileUrl = "assets/chalet-poster-portre.jpg";
  /* ══════════════════════════════════════════════════════ */

  var MOBILE_BP = 860;          /* px — eddig számít mobilnak */
  var FPS       = 24;           /* a videó képkockasebessége — a keresés erre igazodik */
  var DL_TIMEOUT = 25000;       /* ms — ennyi után feladjuk a teljes letöltést */
  var TAU       = 70;           /* ms — a görgetéskövetés simasága (kisebb = közvetlenebb) */
  var SEEK_TIMEOUT = 700;       /* ms — ennyi után tekintjük elakadtnak egy keresést */
  var MAX_STALLS   = 4;         /* ennyi elakadás után mobilon tartalékra váltunk */

  var doc = document.documentElement,
      body = document.body,
      hero   = document.getElementById('hero'),
      stage  = document.getElementById('stage'),
      video  = document.getElementById('video'),
      poster = document.getElementById('poster'),
      wash   = document.getElementById('wash'),
      wash2  = document.getElementById('wash2'),
      fadeout= document.getElementById('fadeout'),
      lyIntro= document.getElementById('lyIntro'),
      lyArr  = document.getElementById('lyArrive'),
      hint   = document.getElementById('hint'),
      loader = document.getElementById('loader'),
      lFill  = document.getElementById('loaderFill'),
      nav    = document.getElementById('nav'),
      menu   = document.getElementById('menu'),
      burger = document.getElementById('burger');

  if (!hero || !stage || !video) return;

  /* ── segédfüggvények ── */
  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
  function range(p, a, b) { return clamp((p - a) / (b - a), 0, 1); }
  function smooth(t) { return t * t * (3 - 2 * t); }

  var prev = {};
  function css(el, prop, val, key) {
    if (!el) return;
    if (prev[key] === val) return;
    prev[key] = val;
    el.style[prop] = val;
  }
  function setLayer(el, key, o, y, blur) {
    if (!el) return;
    if (prev[key + 'o'] !== o) {
      prev[key + 'o'] = o;
      el.style.opacity = o.toFixed(3);
      el.style.visibility = o < 0.012 ? 'hidden' : '';
    }
    var t = (y ? 'translate3d(0,' + y.toFixed(1) + 'px,0)' : '') || '';
    if (prev[key + 't'] !== t) { prev[key + 't'] = t; el.style.transform = t; }
    if (blur !== undefined) {
      var f = blur > 0.1 ? 'blur(' + blur.toFixed(1) + 'px)' : '';
      if (prev[key + 'b'] !== f) { prev[key + 'b'] = f; el.style.filter = f; }
    }
  }

  /* ── forrásválasztás: képernyő, pixelsűrűség és kapcsolat alapján ── */
  var conn = navigator.connection || navigator.mozConnection || {};
  function isPortraitPhone() {
    var w = Math.min(window.innerWidth || 9999, (window.screen && window.screen.width) || 9999);
    return w <= MOBILE_BP && window.matchMedia('(orientation: portrait)').matches;
  }
  function pickVideo() {
    var slow = conn.saveData === true || /(^|-)2g$/.test(conn.effectiveType || '');
    if (isPortraitPhone() && mobileVideoUrl) return mobileVideoUrl;
    /* nincs külön mobil fájl → a többi közül választunk */
    var sc = window.screen || {};
    var deviceMax = Math.max(sc.width || 0, sc.height || 0) || window.innerWidth || 1280;
    var px = (window.innerWidth || 1280) * Math.min(window.devicePixelRatio || 1, 3);
    /* a nagy fájl csak valóban nagy készüléknek megy — telefonra fekvőben sem */
    if (!slow && deviceMax >= 1100 && px >= 1500 && desktopVideoUrl) return desktopVideoUrl;
    return tabletVideoUrl || desktopVideoUrl;
  }
  function pickPoster() {
    return (isPortraitPhone() && posterMobileUrl) ? posterMobileUrl : posterUrl;
  }

  /* ── poszter azonnal, hogy soha ne legyen üres/fekete a hero ── */
  function applyPoster() {
    var u = pickPoster();
    if (!u) return;
    poster.style.backgroundImage = 'url("' + u + '")';
    video.setAttribute('poster', u);
  }
  applyPoster();

  /* ═══════════════ NAVIGÁCIÓ ═══════════════ */
  (function initNav() {
    if (!burger || !menu) return;
    function close() {
      menu.classList.remove('is-open');
      burger.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
      burger.setAttribute('aria-label', 'Menü megnyitása');
    }
    burger.addEventListener('click', function () {
      var open = !menu.classList.contains('is-open');
      menu.classList.toggle('is-open', open);
      burger.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', open ? 'Menü bezárása' : 'Menü megnyitása');
    });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
    window.addEventListener('resize', function () {
      if (window.innerWidth > MOBILE_BP) close();
    });
  })();

  /* ═══════════════ MÉRÉS ═══════════════ */
  var heroTop = 0, travel = 1;
  function measure() {
    var r = hero.getBoundingClientRect();
    heroTop = r.top + (window.scrollY || window.pageYOffset || 0);
    travel  = Math.max(1, hero.offsetHeight - stage.clientHeight);
  }
  function progress() {
    if (travel <= 1) measure();
    return clamp(((window.scrollY || window.pageYOffset || 0) - heroTop) / travel, 0, 1);
  }

  /* ═══════════════ SZÖVEGRÉTEGEK ═══════════════ */
  function layers(p) {
    /* 0–20%: nyitó szöveg | 20–30%: lassan elhalványul és enyhén felfelé mozdul */
    var out = smooth(range(p, 0.20, 0.30));
    setLayer(lyIntro, 'i', 1 - out, -46 * out);

    /* középső szakasz: csak a visszafogott scrolljelző, a bejáratnál eltűnik */
    setLayer(hint, 'h', 1 - smooth(range(p, 0.56, 0.70)));

    /* utolsó ~14%: megérkezés */
    var a = smooth(range(p, 0.86, 0.95));
    setLayer(lyArr, 'a', a, 30 * (1 - a), 10 * (1 - a));

    /* háttérgradiensek */
    css(wash,  'opacity', (1 - 0.86 * smooth(range(p, 0.20, 0.40))).toFixed(3), 'w1');
    css(wash2, 'opacity', smooth(range(p, 0.82, 0.93)).toFixed(3), 'w2');

    /* átmenet a következő szekcióba — a videó alja a szekció színébe olvad */
    css(fadeout, 'opacity', smooth(range(p, 0.90, 1)).toFixed(3), 'fo');

    /* navigáció: a végén olvasható, világos háttérrel */
    var solid = p > 0.84;
    if (prev.navSolid !== solid) { prev.navSolid = solid; nav.classList.toggle('is-solid', solid); }
  }

  /* ═══════════════ TARTALÉK MÓDOK ═══════════════ */
  var mode = 'video';           /* 'video' | 'static' | 'parallax' */

  function hideLoader() {
    if (loader) loader.classList.add('is-done');
    doc.classList.add('is-ready');
  }

  /* videóhiba vagy csökkentett mozgás: poszter + normál hero tartalom */
  function goStatic(withParallax) {
    if (mode !== 'video') return;
    mode = withParallax ? 'parallax' : 'static';
    try { video.pause(); } catch (e) {}
    video.removeAttribute('src'); video.load();
    body.classList.add('static-hero');
    if (withParallax) body.classList.add('parallax-hero');
    poster.style.opacity = '1';
    nav.classList.remove('is-solid');
    var navSolid = function () { nav.classList.toggle('is-solid', (window.scrollY || 0) > 40); };
    window.addEventListener('scroll', navSolid, { passive: true });
    navSolid();
    setLayer(lyIntro, 'i', 1, 0);
    hideLoader();
    measure();
    if (withParallax) startParallax();
  }

  function startParallax() {
    var praf = 0;
    var step = function () {
      praf = 0;
      var r = hero.getBoundingClientRect();
      var y = clamp(-r.top / Math.max(1, hero.offsetHeight), 0, 1);
      poster.style.transform = 'translate3d(0,' + (y * 42).toFixed(1) + 'px,0) scale(1.06)';
    };
    var onScroll = function () { if (!praf) praf = requestAnimationFrame(step); };
    window.addEventListener('scroll', onScroll, { passive: true });
    step();
  }

  /* csökkentett mozgás: nincs görgetésvezérelt videó */
  var reduceQ = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduceQ.matches) {
    goStatic(false);
    return;
  }

  /* ═══════════════ VIDEÓ ═══════════════ */
  var isMobile = Math.min(window.innerWidth || 9999, (window.screen && window.screen.width) || 9999) <= MOBILE_BP;
  var currentSrc = '';
  var objectUrl = null;

  /* A videót egyben letöltjük a memóriába, és onnan játsszuk le. Így a
     görgetés közbeni keresés soha nem vár hálózatra: a részben letöltött
     fájlban való ugrálás az, ami akadozást okoz. Ha a letöltés nem megy
     (CORS, régi böngésző), visszaesünk a hagyományos, folyamatos módra. */
  function fetchToBlob(url, done) {
    if (!window.fetch || !window.URL || !URL.createObjectURL) return done(null);
    var ctrl = ('AbortController' in window) ? new AbortController() : null;
    var to = window.setTimeout(function () { if (ctrl) ctrl.abort(); }, DL_TIMEOUT);
    var opts = ctrl ? { signal: ctrl.signal, credentials: 'same-origin' } : undefined;

    window.fetch(url, opts).then(function (r) {
      if (!r.ok) throw new Error('http ' + r.status);
      var total = parseInt(r.headers.get('Content-Length') || '0', 10);
      if (!r.body || !r.body.getReader) return r.blob();
      var reader = r.body.getReader(), chunks = [], got = 0;
      return (function pump() {
        return reader.read().then(function (res) {
          if (res.done) return new Blob(chunks, { type: 'video/mp4' });
          chunks.push(res.value);
          got += res.value.length;
          if (total && lFill) lFill.style.width = Math.min(99, Math.round(got / total * 100)) + '%';
          return pump();
        });
      })();
    }).then(function (blob) {
      window.clearTimeout(to);
      done(URL.createObjectURL(blob));
    }).catch(function () {
      window.clearTimeout(to);
      done(null);
    });
  }

  function loadSource(url) {
    currentSrc = url;
    metaOK = false; frameOK = false; started = false; seeking = false; stalls = 0;
    if (objectUrl) { URL.revokeObjectURL(objectUrl); objectUrl = null; }
    fetchToBlob(url, function (blobUrl) {
      if (currentSrc !== url) {                 /* közben forrást váltottunk */
        if (blobUrl) URL.revokeObjectURL(blobUrl);
        return;
      }
      objectUrl = blobUrl;
      video.src = blobUrl || url;
      video.load();
    });
  }

  /* elforgatáskor / méretváltáskor a megfelelő felbontásra váltunk,
     a görgetési pozíciót megtartva */
  function swapSourceIfNeeded() {
    if (mode !== 'video') return;
    var want = pickVideo();
    if (want === currentSrc) return;
    applyPoster();
    poster.style.opacity = '1';
    video.classList.remove('is-live');
    if (lFill) lFill.style.width = '0%';
    loadSource(want);
  }

  var dur = 0, metaOK = false, frameOK = false, started = false;
  var seeking = false, seekAt = 0, stalls = 0, wanted = 0;

  video.addEventListener('loadedmetadata', function () {
    dur = video.duration || 0;
    metaOK = true;
    try { video.currentTime = 0; } catch (e) {}    /* első képkocka azonnal */
    maybeStart();
  });

  video.addEventListener('loadeddata', function () {
    frameOK = true;
    video.classList.add('is-live');
    window.setTimeout(function () { poster.style.opacity = '0'; }, 500);
    maybeStart();
  });

  video.addEventListener('progress', function () {
    if (!dur || !video.buffered || !video.buffered.length) return;
    var end = video.buffered.end(video.buffered.length - 1);
    if (lFill) lFill.style.width = Math.min(100, Math.round(end / dur * 100)) + '%';
  });

  video.addEventListener('canplay', function () { if (lFill) lFill.style.width = '100%'; });
  video.addEventListener('error', function () { goStatic(false); });
  window.setTimeout(function () {           /* ha eddig egy kép sincs, tartalékra váltunk */
    if (!frameOK && mode === 'video') goStatic(isMobile);
  }, DL_TIMEOUT + 8000);

  video.addEventListener('seeked', function () {
    seeking = false; stalls = 0;
    applySeek();
  });

  function maybeStart() {
    if (started || !metaOK || !frameOK) return;
    started = true;
    if (lFill) lFill.style.width = '100%';
    measure();
    cur = tgt = progress();
    applyAll(cur);
    window.setTimeout(hideLoader, 220);
    kick();
  }

  /* iOS: a dekóder egyszeri feloldása az első interakcióra —
     a lejátszás azonnal megáll, a videó ezután is csak a scrollt követi */
  var primed = false;
  function prime() {
    if (primed) return; primed = true;
    var pr;
    try { pr = video.play(); } catch (e) { return; }
    if (pr && pr.then) {
      pr.then(function () { video.pause(); applySeek(); }, function () {});
    } else {
      try { video.pause(); } catch (e) {}
    }
  }
  ['touchstart', 'pointerdown', 'wheel', 'keydown'].forEach(function (ev) {
    window.addEventListener(ev, prime, { passive: true, once: true });
  });

  function applySeek() {
    if (!metaOK || !dur) return;
    if (seeking) {
      if (Date.now() - seekAt < SEEK_TIMEOUT) return;
      seeking = false;
      stalls++;
      if (stalls >= MAX_STALLS && isMobile) { goStatic(true); return; }
    }
    var t = clamp(wanted, 0, Math.max(0, dur - 0.04));
    t = Math.round(t * FPS) / FPS;              /* a képkockák rácsára igazítva */
    if (Math.abs(video.currentTime - t) < 0.5 / FPS) return;   /* ugyanaz a képkocka */
    seeking = true; seekAt = Date.now();
    try {
      if (video.fastSeek) video.fastSeek(t); else video.currentTime = t;
    } catch (e) { seeking = false; }
  }

  function applyAll(p) {
    wanted = p * (dur ? dur - 0.04 : 0);
    applySeek();
    layers(p);
  }

  /* ═══════════════ GÖRGETÉSI MOTOR ═══════════════ */
  var cur = 0, tgt = 0, raf = 0, lastT = 0, visible = true;

  function frame(now) {
    raf = 0;
    var dt = lastT ? Math.min(now - lastT, 64) : 16;
    lastT = now;

    tgt = progress();
    cur += (tgt - cur) * (1 - Math.exp(-dt / TAU));
    if (Math.abs(tgt - cur) < 0.0003) cur = tgt;

    applyAll(cur);

    if (visible || cur !== tgt) schedule();
  }
  function schedule() { if (!raf && mode === 'video') raf = window.requestAnimationFrame(frame); }
  function kick() { lastT = 0; schedule(); }

  /* a ciklus csak akkor fusson, amikor a hero látszik */
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (e) {
      visible = e[0].isIntersecting;
      if (visible) kick();
    }, { rootMargin: '15% 0px' }).observe(hero);
  }

  window.addEventListener('scroll', kick, { passive: true });
  window.addEventListener('touchmove', kick, { passive: true });
  document.addEventListener('visibilitychange', function () { if (!document.hidden) kick(); });

  var rt = 0;
  function onResize() {
    window.clearTimeout(rt);
    rt = window.setTimeout(function () { swapSourceIfNeeded(); measure(); kick(); }, 150);
  }
  window.addEventListener('resize', onResize, { passive: true });
  window.addEventListener('orientationchange', function () {
    window.setTimeout(function () { swapSourceIfNeeded(); measure(); cur = tgt = progress(); applyAll(cur); kick(); }, 320);
  });
  window.addEventListener('load', function () { measure(); kick(); });

  /* indulás */
  measure();
  layers(progress());
  loadSource(pickVideo());

})();
