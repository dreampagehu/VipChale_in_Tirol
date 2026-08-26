# VipChale in Tirol — görgetéssel vezérelt videós hero

Teljes képernyős hero szekció egy prémium tiroli chalet hotel egyoldalas
weboldalához. A videó **nem** játszik le magától: az aktuális képkockáját
kizárólag a görgetési pozíció határozza meg. Lefelé görgetve a kamera a chalet
tetejétől leereszkedik a főbejárathoz, az ajtó kinyílik és belépünk az épületbe —
felfelé görgetve ugyanez pontosan visszafelé fut.

Natív HTML + CSS + JavaScript. Nincs React, nincs build tool, nincs külső
animációs könyvtár.

## Felépítés

```
index.html              a teljes oldal (navigáció, hero, következő szekció)
css/style.css           designrendszer és a hero összes állapota
js/main.js              a görgetésmotor
elementor-hero.html     egyfájlos, beilleszthető változat Elementor HTML widgetbe
tools/build-elementor.py   az elementor-hero.html előállítása a fenti háromból
assets/
  chalet-hero-eredeti.mp4  az eredeti, változatlan videó (1280×720, 8 s, 24 fps)
  chalet-hero.mp4          tekerésre optimalizált másolat — 1280×720, 3,3 MB
  chalet-hero-mobil.mp4    ugyanaz 854×480-ban — 1,3 MB
  chalet-poster.jpg        poszter: az első képkocka
  chalet-belso.jpg         a záró képkocka (belső tér)
```

## Hol kell URL-t cserélni

**Önálló oldal:** `js/main.js` legelső három sora.

```js
var desktopVideoUrl = "assets/chalet-hero.mp4";
var mobileVideoUrl  = "assets/chalet-hero-mobil.mp4";   /* üresen a desktop tölt be */
var posterUrl       = "assets/chalet-poster.jpg";
```

**Elementor:** `elementor-hero.html`, a `<script>` elején.

```js
var desktopVideoUrl = "IDE_JON_A_DESKTOP_VIDEO_URL";
var mobileVideoUrl  = "IDE_JON_A_MOBIL_VIDEO_URL";
var posterUrl       = "IDE_JON_A_POSTER_KEP_URL";
```

## Beillesztés Elementorba

1. Töltsd fel a Média könyvtárba: `chalet-hero.mp4`, `chalet-hero-mobil.mp4`,
   `chalet-poster.jpg`. Másold ki a három URL-t.
2. Húzz egy **HTML widgetet** az oldalra, és illeszd be az `elementor-hero.html`
   teljes tartalmát.
3. Írd át a három URL-t a `<script>` elején.

További kapcsolók ugyanott:

| Kapcsoló | Mit csinál |
|---|---|
| `SHOW_NAV` | `false`, ha az Elementor sablonnak saját fejléce van |
| `NEXT_SEL` | pl. `"#szobak"` — ide görgetnek a gombok; üresen a hero utáni szakaszra |
| `FULLBLEED` | `true` esetén a hero kitör az Elementor konténer szélességéből |

Fontos: a szülő konténeren **ne kapcsolj be Motion Effects-et** — a `transform`
elrontja a sticky pozicionálást. (Erre van beépített tartalék pin-logika, de jobb
elkerülni.)

## Hogyan működik

A hero desktopon 500vh, mobilon 400vh magas görgetési terület, benne egy
`position: sticky` színpad. A görgetés arányát `requestAnimationFrame` ciklus
olvassa, időalapú interpolációval simítja (`TAU`, alapból 70 ms), és ebből számol
mindent: a videó `currentTime` értékét, a szövegrétegek átlátszóságát és a
gradiensek erősségét. A méreteket csak átméretezéskor olvassuk ki, így görgetés
közben nincs kényszerített layout-számítás.

Scroll-dramaturgia:

| Tartomány | Mi történik |
|---|---|
| 0–20 % | nyitó szöveg: felső felirat, főcím, leírás, két CTA |
| 20–30 % | a nyitó szöveg lassan elhalványul és enyhén felfelé mozdul |
| 30–56 % | csak a kameraút — visszafogott „Görgessen a belépéshez” jelző |
| 56–70 % | a scrolljelző eltűnik, ahogy a kamera eléri a bejáratot |
| 86–95 % | „Megérkezett.” — blur, opacity és felfelé mozdulás |
| 90–100 % | a videó alja a következő szekció színébe olvad, a navigáció világos hátteret kap |

A videó `muted`, `playsinline`, `webkit-playsinline`, `preload="auto"` — nincs
`autoplay`, `loop` és `controls`. Az időtartamot csak `loadedmetadata` után
használjuk. iOS-en az első felhasználói interakcióra egyetlen `play()` + azonnali
`pause()` oldja fel a dekódolást, utána a videó továbbra is csak a scrollt követi.

## Tekerésre optimalizált videó

Az eredeti fájlban egyetlen kulcsképkocka volt, ami akadóvá tenné a tekerést.
A `chalet-hero.mp4` ugyanazt a képet tartalmazza, csak 6 képkockánként van benne
kulcsképkocka, hang nélkül:

```bash
ffmpeg -i assets/chalet-hero-eredeti.mp4 -an -c:v libx264 -preset slow -crf 22 \
  -g 6 -keyint_min 6 -sc_threshold 0 -pix_fmt yuv420p -movflags +faststart \
  assets/chalet-hero.mp4

ffmpeg -i assets/chalet-hero-eredeti.mp4 -an -vf scale=854:480 -c:v libx264 \
  -preset slow -crf 26 -g 6 -keyint_min 6 -sc_threshold 0 -pix_fmt yuv420p \
  -movflags +faststart assets/chalet-hero-mobil.mp4
```

## Tartalékok és hozzáférhetőség

- **Videóhiba vagy 15 mp-en túli betöltés** → poszterkép, normál magasságú hero,
  az oldal használható marad.
- **Instabil mobilos tekerés** (négy egymást követő elakadt keresés) → automatikus
  váltás poszterképre finom parallaxszal.
- **`prefers-reduced-motion: reduce`** → nincs görgetésvezérelt videó: poszterkép
  és a normál hero tartalom.
- **JavaScript nélkül** ugyanez a statikus változat jelenik meg (`<noscript>`).
- Billentyűzettel minden gomb és menüpont elérhető, a hamburger menü
  `aria-expanded` / `aria-controls` attribútumokkal működik, Escape-re bezárul.
- A scroll listener `passive: true`, a ciklus `IntersectionObserver`-rel áll le,
  ha a hero nem látszik; a resize debounce-olt, orientációváltásra újramérünk.

## Helyi futtatás

```bash
python3 -m http.server 8000
```

Böngészőben: <http://localhost:8000> — ne `file://` protokollal nyisd meg.

## Az Elementor változat újraépítése

Ha az `index.html`, a `css/style.css` vagy a `js/main.js` módosul:

```bash
python3 tools/build-elementor.py
```
