/* ============================================================
   KÉPJEGYZÉK — minden felhasznált stockfotó egy helyen
   ------------------------------------------------------------
   Minden kép valódi fényképfelvétel az Unsplash vagy a Pexels
   ingyenes licence alatt (weboldalas és kereskedelmi felhasználás
   engedélyezett, attribúció nem kötelező — a forrást mégis
   végig nyilvántartjuk).

   Csere: írd át a `base` értéket, a többi (srcset, méretek) marad.
   Az oldal betöltéskor ebből a jegyzékből tölti fel a
   data-kep="..." attribútummal jelölt <img> elemeket.
   ============================================================ */
window.KEPEK = {

  /* ─────────── A HOTEL ─────────── */
  'hotel-belso': {
    forras: 'Unsplash', fotos: 'Valentin DUCRETTET',
    url: 'https://unsplash.com/photos/luxurious-wooden-chalet-interior-with-dining-and-living-areas-gdhAPf_kZ14',
    base: 'https://images.unsplash.com/photo-1780391592801-5e8867523492',
    tipus: 'unsplash', w: 7008, h: 4672,
    hely: 'A hotel — nagy nyitókép',
    alt: 'Faburkolatú alpesi chalet nappalija étkezővel, természetes fényben'
  },
  'hotel-kulso': {
    forras: 'Pexels', fotos: 'Heinz Klier',
    url: 'https://www.pexels.com/photo/traditional-alpine-chalet-with-mountain-view-39045418/',
    base: 'https://images.pexels.com/photos/39045418/pexels-photo-39045418/free-photo-of-traditional-alpine-chalet-with-mountain-view.jpeg',
    tipus: 'pexels', w: 4000, h: 6000,
    hely: 'A hotel — fa homlokzat részlet',
    alt: 'Hagyományos alpesi chalet fa erkélye alulnézetből, mögötte a hegyekkel'
  },

  /* ─────────── SZOBÁK ─────────── */
  'szoba-panorama': {
    forras: 'Unsplash', fotos: 'Dominik Neuner',
    url: 'https://unsplash.com/photos/relaxing-lounge-area-with-mountain-view-at-sunrise-IcN_5_He218',
    base: 'https://images.unsplash.com/photo-1761470532026-322f58233efc',
    tipus: 'unsplash', w: 3840, h: 2560,
    hely: 'Szobák — lakosztály nappalija panorámaablakkal',
    alt: 'Világos lakosztály-nappali panorámaablakkal, mögötte havas hegycsúcsokkal, hajnali fényben'
  },
  'szoba-housekeeping': {
    forras: 'Pexels', fotos: 'Liliana Drew',
    url: 'https://www.pexels.com/photo/a-woman-fixing-a-bed-9462335/',
    base: 'https://images.pexels.com/photos/9462335/pexels-photo-9462335.jpeg',
    tipus: 'pexels', w: 4000, h: 6000,
    hely: 'Szobák — housekeeping, ágy előkészítése',
    alt: 'Szállodai munkatárs friss, fehér ágyneműt igazít el a megvetett ágyon'
  },

  /* ─────────── GASZTRONÓMIA ─────────── */
  'gasztro-reggeli': {
    forras: 'Pexels', fotos: 'Diego Simonovich',
    url: 'https://www.pexels.com/photo/breakfast-and-coffee-served-on-a-table-22598227/',
    base: 'https://images.pexels.com/photos/22598227/pexels-photo-22598227/free-photo-of-breakfast-and-coffee-served-on-a-table.jpeg',
    tipus: 'pexels', w: 4000, h: 6000,
    hely: 'Gasztronómia — reggeli, nagy kép',
    alt: 'Megterített reggelizőasztal kávéval, friss péksüteménnyel és gyümölcslével'
  },
  'gasztro-felszolgalas': {
    forras: 'Unsplash', fotos: 'Richard Bell',
    url: 'https://unsplash.com/photos/person-serving-breakfast-buffet-with-bacon-and-pastries-SdvrF7U-tVI',
    base: 'https://images.unsplash.com/photo-1763207291832-819499e261dd',
    tipus: 'unsplash', w: 6000, h: 4000,
    hely: 'Gasztronómia — reggeli, felszolgálás',
    alt: 'Munkatárs meleg reggeli fogásokat és péksüteményeket készít elő a pulton'
  },
  'gasztro-sef': {
    forras: 'Pexels', fotos: 'Willians Huerta',
    url: 'https://www.pexels.com/photo/chef-plating-gourmet-dish-in-kitchen-36430150/',
    base: 'https://images.pexels.com/photos/36430150/pexels-photo-36430150/free-photo-of-chef-plating-gourmet-dish-in-kitchen.jpeg',
    tipus: 'pexels', w: 4000, h: 6000,
    hely: 'Gasztronómia — à la carte, séf tálalás közben',
    alt: 'Séf gondosan tálalja az elkészült fogást a konyhában'
  },
  'gasztro-pincer': {
    forras: 'Pexels', fotos: 'Andrea Piacquadio',
    url: 'https://www.pexels.com/photo/waiter-with-tray-working-in-stylish-restaurant-3769740/',
    base: 'https://images.pexels.com/photos/3769740/pexels-photo-3769740.jpeg',
    tipus: 'pexels', w: 4000, h: 6000,
    hely: 'Gasztronómia — à la carte, pincér',
    alt: 'Pincér tálcával halad végig az elegáns, meleg fényű étteremben'
  },
  'gasztro-bar': {
    forras: 'Pexels', fotos: 'Airam Dato-on',
    url: 'https://www.pexels.com/photo/man-preparing-cocktails-in-a-bar-16807989/',
    base: 'https://images.pexels.com/photos/16807989/pexels-photo-16807989/free-photo-of-man-preparing-cocktails-in-a-bar.jpeg',
    tipus: 'pexels', w: 4000, h: 6000,
    hely: 'Gasztronómia — bár, koktélkészítés',
    alt: 'Bartender koktélt kever a bárpult mögött, a polcokon üvegekkel'
  },
  'gasztro-kandallo': {
    forras: 'Unsplash', fotos: 'Clay Banks',
    url: 'https://unsplash.com/photos/a-living-room-with-a-fire-place-inside-of-it-f_6yPIgDxxs',
    base: 'https://images.unsplash.com/photo-1698933787134-af2d451985c7',
    tipus: 'unsplash', w: 2856, h: 1904,
    hely: 'Gasztronómia — bár, kandallós esti hangulat',
    alt: 'Égő kandalló egy fával burkolt nappaliban, meleg esti fényben'
  },

  /* ─────────── NYÁRI PROGRAMOK ─────────── */
  'nyar-bicikli': {
    forras: 'Pexels', fotos: 'Jonathan Cooper',
    url: 'https://www.pexels.com/photo/man-using-a-mountain-bike-in-the-forest-11715051/',
    base: 'https://images.pexels.com/photos/11715051/pexels-photo-11715051.jpeg',
    tipus: 'pexels', w: 4000, h: 6000,
    hely: 'Nyár — hegyikerékpározás',
    alt: 'Hegyikerékpáros erdei ösvényen tekerve, természetes környezetben'
  },
  'nyar-tura': {
    forras: 'Pexels', fotos: 'Yaroslav Shuraev',
    url: 'https://www.pexels.com/photo/a-couple-hiking-in-the-mountain-4763005/',
    base: 'https://images.pexels.com/photos/4763005/pexels-photo-4763005.jpeg',
    tipus: 'pexels', w: 4000, h: 6000,
    hely: 'Nyár — túrázás',
    alt: 'Két túrázó hátizsákkal halad felfelé egy zöld hegygerincen'
  },
  'nyar-panorama': {
    forras: 'Unsplash', fotos: 'Tino Rischawy',
    url: 'https://unsplash.com/photos/a-green-mountain-with-a-few-clouds-in-the-sky-NKDI7qlLsM0',
    base: 'https://images.unsplash.com/photo-1679597454618-d1ae16573606',
    tipus: 'unsplash', w: 6000, h: 4000,
    hely: 'Nyár — alpesi panoráma',
    alt: 'Zöld alpesi hegyoldal néhány felhővel a nyári égen'
  },

  /* ─────────── TÉLI PROGRAMOK ─────────── */
  'tel-sieles': {
    forras: 'Pexels', fotos: 'Jonas Horsch',
    url: 'https://www.pexels.com/photo/skier-descending-snowy-slope-in-austria-36548334/',
    base: 'https://images.pexels.com/photos/36548334/pexels-photo-36548334/free-photo-of-skier-descending-snowy-slope-in-austria.jpeg',
    tipus: 'pexels', w: 4000, h: 6000,
    hely: 'Tél — síelés',
    alt: 'Síelő halad lefelé egy tágas, friss havas lejtőn az osztrák Alpokban'
  },
  'tel-tura': {
    forras: 'Pexels', fotos: 'rois martin',
    url: 'https://www.pexels.com/photo/back-view-of-person-walking-on-snow-covered-ground-6263776/',
    base: 'https://images.pexels.com/photos/6263776/pexels-photo-6263776.jpeg',
    tipus: 'pexels', w: 4000, h: 6000,
    hely: 'Tél — havas túra',
    alt: 'Túrázó botokkal halad a havas hegyoldalon, háttal a kamerának'
  },
  'tel-menedek': {
    forras: 'Pexels', fotos: 'Michael Fischer',
    url: 'https://www.pexels.com/photo/charming-snow-covered-cabin-in-austrian-alps-35685564/',
    base: 'https://images.pexels.com/photos/35685564/pexels-photo-35685564/free-photo-of-charming-snow-covered-cabin-in-austrian-alps.jpeg',
    tipus: 'pexels', w: 4000, h: 6000,
    hely: 'Tél — hegyi faház',
    alt: 'Hóval borított fa hegyi faház fenyők között, téli délutáni fényben'
  }
};

/* ── URL-építés a két CDN paraméterezésével ── */
(function () {
  'use strict';

  function url(k, w) {
    return k.tipus === 'unsplash'
      ? k.base + '?auto=format&fit=crop&q=72&w=' + w
      : k.base + '?auto=compress&cs=tinysrgb&fit=crop&w=' + w;
  }

  window.kepSrcset = function (kulcs, szelessegek) {
    var k = window.KEPEK[kulcs];
    if (!k) return null;
    return szelessegek.map(function (w) { return url(k, w) + ' ' + w + 'w'; }).join(', ');
  };

  /* a jegyzék alkalmazása a data-kep jelölésű képekre */
  window.kepekAlkalmaz = function () {
    var elemek = document.querySelectorAll('img[data-kep]');
    for (var i = 0; i < elemek.length; i++) {
      var el = elemek[i], k = window.KEPEK[el.getAttribute('data-kep')];
      if (!k) continue;
      var szel = (el.getAttribute('data-szelessegek') || '800,1200,1600,2000')
        .split(',').map(Number);
      el.srcset = szel.map(function (w) { return url(k, w) + ' ' + w + 'w'; }).join(', ');
      el.src = url(k, szel[szel.length - 1]);
      if (!el.alt) el.alt = k.alt;
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.kepekAlkalmaz);
  } else {
    window.kepekAlkalmaz();
  }
})();
