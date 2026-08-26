/* ============================================================
   Tartalmi szekciók — visszafogott felfedő animációk és a
   gasztronómiai blokk magazinszerű, sticky képváltása.
   Nincs külső könyvtár, minden natív JavaScript.
   ============================================================ */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var MOBIL = 860;

  /* ── 1. felfedés görgetésre ── */
  var revek = document.querySelectorAll('.rev');
  if (reduce || !('IntersectionObserver' in window)) {
    for (var i = 0; i < revek.length; i++) revek[i].classList.add('is-in');
  } else {
    var revObs = new IntersectionObserver(function (bejegyzesek) {
      bejegyzesek.forEach(function (b) {
        if (!b.isIntersecting) return;
        b.target.classList.add('is-in');
        revObs.unobserve(b.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });
    for (var j = 0; j < revek.length; j++) revObs.observe(revek[j]);
  }

  /* ── 2. gasztronómia: a sticky kép a szöveghez igazodik ── */
  var media = document.getElementById('gastroMedia');
  var kepek = media ? media.querySelectorAll('.gastro__img') : [];
  var blokkok = document.querySelectorAll('.gastro__block');

  function aktiv(index) {
    for (var k = 0; k < kepek.length; k++) {
      kepek[k].classList.toggle('is-on', k === index);
    }
  }

  if (media && kepek.length && blokkok.length && 'IntersectionObserver' in window) {
    var gastroObs = new IntersectionObserver(function (bejegyzesek) {
      var legjobb = null;
      bejegyzesek.forEach(function (b) {
        if (b.isIntersecting && (!legjobb || b.intersectionRatio > legjobb.intersectionRatio)) legjobb = b;
      });
      if (legjobb) aktiv(+legjobb.target.getAttribute('data-gastro-blokk'));
    }, { rootMargin: '-35% 0px -35% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] });
    for (var b2 = 0; b2 < blokkok.length; b2++) gastroObs.observe(blokkok[b2]);
  }

  /* ── 3. mobilon a sticky kép helyett blokkonként egy kép ── */
  function mobilKepek() {
    if (window.innerWidth > MOBIL || !kepek.length) return;
    if (document.querySelector('.gastro__mobil')) return;
    for (var m = 0; m < blokkok.length; m++) {
      var forras = kepek[m];
      if (!forras) continue;
      var fig = document.createElement('figure');
      fig.className = 'gastro__mobil';
      var img = document.createElement('img');
      img.setAttribute('data-kep', forras.getAttribute('data-kep'));
      img.setAttribute('data-szelessegek', '800,1200');
      img.setAttribute('loading', 'lazy');
      img.width = 1200; img.height = 900;
      img.alt = '';                       /* dekoratív ismétlés — a szöveg hordozza a jelentést */
      img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
      fig.appendChild(img);
      blokkok[m].insertBefore(fig, blokkok[m].firstChild);
    }
    if (window.kepekAlkalmaz) window.kepekAlkalmaz();
  }
  mobilKepek();
  var mrt = 0;
  window.addEventListener('resize', function () {
    window.clearTimeout(mrt);
    mrt = window.setTimeout(mobilKepek, 200);
  }, { passive: true });

  /* ── 3/b. GYIK: egyszerre csak egy nyitott kérdés ── */
  var kerdesek = document.querySelectorAll('.kerdes');
  for (var q = 0; q < kerdesek.length; q++) {
    kerdesek[q].addEventListener('toggle', function () {
      if (!this.open) return;
      for (var w = 0; w < kerdesek.length; w++) {
        if (kerdesek[w] !== this) kerdesek[w].open = false;
      }
    });
  }

  /* ── 3/c. ajánlatkérő űrlap (előnézet) ──
     Éles oldalon a Fluent Forms veszi át: a <form> blokk helyére
     [fluentform id="..."] shortcode kerül, és ez a kód nem fut le. */
  var urlap = document.getElementById('ajanlatUrlap');
  var info = document.getElementById('urlapInfo');
  if (urlap && info) {
    urlap.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!urlap.checkValidity()) {
        info.textContent = 'Kérjük, töltse ki a kötelező mezőket (név, e-mail, adatkezelés).';
        urlap.reportValidity();
        return;
      }
      info.textContent = 'Előnézet: az adatok nem kerültek elküldésre. Éles oldalon a Fluent Forms továbbítja őket.';
    });
  }

  /* ── 4. finom parallax a sticky képen ── */
  if (!reduce && media) {
    var szekcio = document.getElementById('gasztronomia');
    var raf = 0;
    var lepes = function () {
      raf = 0;
      var r = szekcio.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      var p = (0 - r.top) / Math.max(1, r.height);          /* 0 → 1 a szekción belül */
      p = p < 0 ? 0 : (p > 1 ? 1 : p);
      media.style.transform = 'translate3d(0,' + ((p - 0.5) * 26).toFixed(1) + 'px,0)';
    };
    var gorget = function () { if (!raf) raf = window.requestAnimationFrame(lepes); };
    window.addEventListener('scroll', gorget, { passive: true });
    lepes();
  }

})();
