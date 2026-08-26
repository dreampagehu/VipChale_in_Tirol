/* ============================================================
   Foglaltsági naptár
   ------------------------------------------------------------
   A foglalt időszakokat az assets/foglaltsag.json tartalmazza.
   A vendég kijelöli az érkezés és a távozás napját, az időszak
   pedig átkerül az ajánlatkérő űrlapba.
   ============================================================ */
(function () {
  'use strict';

  var HONAPOK = ['január', 'február', 'március', 'április', 'május', 'június',
                 'július', 'augusztus', 'szeptember', 'október', 'november', 'december'];
  var NAPOK = ['H', 'K', 'Sze', 'Cs', 'P', 'Szo', 'V'];

  var racs   = document.getElementById('naptarHonapok');
  var nevEl  = document.getElementById('naptarNev');
  var vissza = document.getElementById('naptarVissza');
  var elore  = document.getElementById('naptarElore');
  if (!racs || !nevEl) return;

  var erkEl  = document.getElementById('valErkezes');
  var tavEl  = document.getElementById('valTavozas');
  var ejEl   = document.getElementById('valEjszaka');
  var infoEl = document.getElementById('foglalasInfo');
  var ctaEl  = document.getElementById('foglalasCta');
  var torol  = document.getElementById('foglalasTorol');
  var mezoE  = document.getElementById('mezoErkezes');
  var mezoT  = document.getElementById('mezoTavozas');

  /* tartalék adat, ha a JSON nem tölthető be (pl. file:// protokoll) */
  var adat = { minEjszaka: 2, foglalt: [] };
  var foglaltNapok = {};                 /* 'YYYY-MM-DD' → címke */

  var ma = new Date(); ma.setHours(0, 0, 0, 0);
  var elsoHonap = new Date(ma.getFullYear(), ma.getMonth(), 1);
  var mutatott = new Date(elsoHonap);
  var kettoHonap = window.matchMedia('(min-width: 861px)').matches;

  var erkezes = null, tavozas = null;

  /* ── segédek ── */
  function kulcs(d) {
    return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
  }
  function ebbol(sz) {
    var r = sz.split('-');
    return new Date(+r[0], +r[1] - 1, +r[2]);
  }
  function magyarDatum(d) {
    return d.getFullYear() + '. ' + HONAPOK[d.getMonth()] + ' ' + d.getDate() + '.';
  }
  function ejszakak(a, b) {
    return Math.round((b - a) / 86400000);
  }
  function foglalt(d) {
    return !!foglaltNapok[kulcs(d)];
  }
  function vanFoglaltKozte(a, b) {
    var d = new Date(a);
    while (d < b) {
      if (foglalt(d)) return true;
      d.setDate(d.getDate() + 1);
    }
    return false;
  }

  /* ── foglalt napok kibontása ── */
  function feldolgoz(j) {
    adat = j || adat;
    foglaltNapok = {};
    (adat.foglalt || []).forEach(function (idoszak) {
      var d = ebbol(idoszak.tol), veg = ebbol(idoszak.ig);
      while (d <= veg) {
        foglaltNapok[kulcs(d)] = idoszak.cimke || 'Foglalt';
        d.setDate(d.getDate() + 1);
      }
    });
  }

  /* ── egy hónap kirajzolása ── */
  function honapDoboz(ev, honap) {
    var doboz = document.createElement('div');
    doboz.className = 'honap';

    var cim = document.createElement('p');
    cim.className = 'honap__cim';
    cim.textContent = ev + '. ' + HONAPOK[honap];
    doboz.appendChild(cim);

    var fejlec = document.createElement('div');
    fejlec.className = 'honap__fejlec';
    fejlec.setAttribute('aria-hidden', 'true');
    NAPOK.forEach(function (n) {
      var sp = document.createElement('span');
      sp.textContent = n;
      fejlec.appendChild(sp);
    });
    doboz.appendChild(fejlec);

    var napracs = document.createElement('div');
    napracs.className = 'honap__racs';
    napracs.setAttribute('role', 'grid');

    var elsoNap = new Date(ev, honap, 1);
    var eltolas = (elsoNap.getDay() + 6) % 7;          /* hétfővel kezdünk */
    var napokSzama = new Date(ev, honap + 1, 0).getDate();

    for (var u = 0; u < eltolas; u++) {
      var ures = document.createElement('span');
      ures.className = 'nap nap--ures';
      napracs.appendChild(ures);
    }

    for (var n2 = 1; n2 <= napokSzama; n2++) {
      var d = new Date(ev, honap, n2);
      var gomb = document.createElement('button');
      gomb.type = 'button';
      gomb.className = 'nap';
      gomb.textContent = n2;
      gomb.dataset.datum = kulcs(d);

      var mult = d < ma;
      var fogl = foglalt(d);

      if (mult) { gomb.classList.add('nap--mult'); gomb.disabled = true; }
      if (fogl) { gomb.classList.add('nap--foglalt'); gomb.disabled = true; }
      if (d.getTime() === ma.getTime()) gomb.classList.add('nap--ma');

      gomb.setAttribute('aria-label', magyarDatum(d) + (fogl ? ' — foglalt' : mult ? ' — elmúlt' : ' — szabad'));
      if (fogl) gomb.title = foglaltNapok[kulcs(d)];

      napracs.appendChild(gomb);
    }

    doboz.appendChild(napracs);
    return doboz;
  }

  function rajzol() {
    racs.innerHTML = '';
    racs.appendChild(honapDoboz(mutatott.getFullYear(), mutatott.getMonth()));
    if (kettoHonap) {
      var kov = new Date(mutatott.getFullYear(), mutatott.getMonth() + 1, 1);
      racs.appendChild(honapDoboz(kov.getFullYear(), kov.getMonth()));
    }
    if (kettoHonap) {
      var k2 = new Date(mutatott.getFullYear(), mutatott.getMonth() + 1, 1);
      nevEl.textContent = HONAPOK[mutatott.getMonth()] + ' – ' + HONAPOK[k2.getMonth()]
        + ' · ' + k2.getFullYear();
    } else {
      nevEl.textContent = HONAPOK[mutatott.getMonth()] + ' · ' + mutatott.getFullYear();
    }
    vissza.disabled = (mutatott.getFullYear() === elsoHonap.getFullYear() &&
                       mutatott.getMonth() === elsoHonap.getMonth());
    jelolesFrissit();
  }

  /* ── kijelölés megjelenítése ── */
  function jelolesFrissit() {
    var napok = racs.querySelectorAll('.nap[data-datum]');
    for (var i = 0; i < napok.length; i++) {
      var el = napok[i], d = ebbol(el.dataset.datum);
      el.classList.remove('nap--valasztott', 'nap--kozott');
      if (erkezes && d.getTime() === erkezes.getTime()) el.classList.add('nap--valasztott');
      if (tavozas && d.getTime() === tavozas.getTime()) el.classList.add('nap--valasztott');
      if (erkezes && tavozas && d > erkezes && d < tavozas) el.classList.add('nap--kozott');
    }

    erkEl.textContent = erkezes ? magyarDatum(erkezes) : '—';
    tavEl.textContent = tavozas ? magyarDatum(tavozas) : '—';
    ejEl.textContent = (erkezes && tavozas) ? ejszakak(erkezes, tavozas) + ' éjszaka' : '—';

    if (mezoE) mezoE.value = erkezes ? kulcs(erkezes) : '';
    if (mezoT) mezoT.value = tavozas ? kulcs(tavozas) : '';
  }

  /* ── kattintás a napokra ── */
  racs.addEventListener('click', function (e) {
    var gomb = e.target.closest ? e.target.closest('.nap[data-datum]') : null;
    if (!gomb || gomb.disabled) return;
    var d = ebbol(gomb.dataset.datum);

    if (!erkezes || (erkezes && tavozas)) {
      erkezes = d; tavozas = null;
      infoEl.textContent = 'Most válassza ki a távozás napját.';
    } else if (d <= erkezes) {
      erkezes = d; tavozas = null;
      infoEl.textContent = 'Most válassza ki a távozás napját.';
    } else if (ejszakak(erkezes, d) < (adat.minEjszaka || 1)) {
      infoEl.textContent = 'Legalább ' + (adat.minEjszaka || 1) + ' éjszakára tudunk foglalást vállalni.';
    } else if (vanFoglaltKozte(erkezes, d)) {
      infoEl.textContent = 'A két dátum között van foglalt nap. Válasszon másik időszakot.';
      erkezes = d; tavozas = null;
    } else {
      tavozas = d;
      infoEl.textContent = 'Rendben — küldje el az ajánlatkérést, és 24 órán belül válaszolunk.';
    }
    jelolesFrissit();
  });

  vissza.addEventListener('click', function () {
    mutatott = new Date(mutatott.getFullYear(), mutatott.getMonth() - 1, 1);
    rajzol();
  });
  elore.addEventListener('click', function () {
    mutatott = new Date(mutatott.getFullYear(), mutatott.getMonth() + 1, 1);
    rajzol();
  });

  torol.addEventListener('click', function () {
    erkezes = null; tavozas = null;
    infoEl.textContent = 'Kattintson az érkezés napjára, majd a távozás napjára.';
    jelolesFrissit();
  });

  /* az ajánlatkérés gomb átviszi az időszakot az űrlaphoz */
  ctaEl.addEventListener('click', function () {
    if (erkezes && !tavozas) {
      infoEl.textContent = 'Válassza ki a távozás napját is, hogy pontos ajánlatot tudjunk adni.';
    }
  });

  /* képernyőméret változásakor egy vagy két hónap */
  var mrt = 0;
  window.addEventListener('resize', function () {
    window.clearTimeout(mrt);
    mrt = window.setTimeout(function () {
      var uj = window.matchMedia('(min-width: 861px)').matches;
      if (uj !== kettoHonap) { kettoHonap = uj; rajzol(); }
    }, 200);
  }, { passive: true });

  /* ── indulás ── */
  function indul() {
    rajzol();
    if (adat.minEjszaka > 1) {
      infoEl.textContent = 'Kattintson az érkezés napjára, majd a távozás napjára. Legalább '
        + adat.minEjszaka + ' éjszaka foglalható.';
    }
  }

  if (window.fetch) {
    window.fetch('assets/foglaltsag.json', { cache: 'no-cache' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) { if (j) feldolgoz(j); indul(); })
      .catch(function () { indul(); });
  } else {
    indul();
  }

})();
