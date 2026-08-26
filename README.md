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
  chalet-hero-eredeti.mp4  az eredeti, változatlan videó (1920×1080, 8 s, 24 fps)
  chalet-hero-1080.mp4     1920×1080 — 5,3 MB (nagy képernyő)
  chalet-hero.mp4          1280×720 — 2,7 MB (közepes képernyő, lassú net)
  chalet-hero-portre.mp4    720×1280, középre vágott 9:16 — 2,4 MB (álló telefon)
  chalet-poster.jpg        poszter 1920×1080
  chalet-poster-portre.jpg poszter álló telefonra 720×1280
  chalet-belso.jpg         a záró képkocka (belső tér)
```

## Hol kell URL-t cserélni

**Önálló oldal:** `js/main.js` legelső sorai.

```js
var desktopVideoUrl = "assets/chalet-hero-1080.mp4";    /* nagy / Retina képernyő */
var tabletVideoUrl  = "assets/chalet-hero.mp4";         /* közepes képernyő, lassú net */
var mobileVideoUrl  = "assets/chalet-hero-portre.mp4";  /* álló telefon (9:16 vágás) */
var posterUrl       = "assets/chalet-poster.jpg";
var posterMobileUrl = "assets/chalet-poster-portre.jpg";
```

**Elementor:** `elementor-hero.html`, a `<script>` elején.

```js
var desktopVideoUrl = "IDE_JON_A_DESKTOP_VIDEO_URL";    /* kötelező */
var tabletVideoUrl  = "";                               /* opcionális */
var mobileVideoUrl  = "";                               /* opcionális */
var posterUrl       = "IDE_JON_A_POSTER_KEP_URL";       /* kötelező */
var posterMobileUrl = "";                               /* opcionális */
```

Ha csak egy videód van, elég a `desktopVideoUrl` — a többi üresen hagyva
automatikusan arra esik vissza.

## Beillesztés Elementorba

1. Töltsd fel a Média könyvtárba: `chalet-hero-1080.mp4`, `chalet-hero.mp4`,
   `chalet-hero-portre.mp4`, `chalet-poster.jpg`, `chalet-poster-portre.jpg`.
   Másold ki az URL-eket.
2. Húzz egy **HTML widgetet** az oldalra, és illeszd be az `elementor-hero.html`
   teljes tartalmát.
3. Írd át az URL-eket a `<script>` elején.

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

## Videóváltozatok

Az eredeti fájlban egyetlen kulcsképkocka volt, ami akadóvá tenné a tekerést —
minden változatban 6–8 képkockánként van kulcsképkocka, hang nélkül.

A forrás natív 1920×1080, tehát sehol nincs felskálázás. A közepes és az álló
változat is ebből kicsinyítve készül. Az álló telefonos fájl a képkocka középső
9:16-os részének kivágása — pontosan az a képrész, amit a telefon `object-fit:
cover` mellett amúgy is mutatna, csak nem 4–5-szörös, hanem kb. kétszeres
nagyítással.

```bash
# nagy képernyő — 1920×1080
ffmpeg -i assets/chalet-hero-eredeti.mp4 -an -c:v libx264 -preset slow -crf 23 \
  -g 8 -keyint_min 8 -sc_threshold 0 -pix_fmt yuv420p -movflags +faststart \
  assets/chalet-hero-1080.mp4

# közepes képernyő — 1280×720
ffmpeg -i assets/chalet-hero-eredeti.mp4 -an -vf "scale=1280:720:flags=lanczos" \
  -c:v libx264 -preset slow -crf 24 -g 6 -keyint_min 6 -sc_threshold 0 \
  -pix_fmt yuv420p -movflags +faststart assets/chalet-hero.mp4

# álló telefon — 720×1280, középre vágva
ffmpeg -i assets/chalet-hero-eredeti.mp4 -an \
  -vf "crop=608:1080:656:0,scale=720:1280:flags=lanczos" \
  -c:v libx264 -preset slow -crf 23 -g 6 -keyint_min 6 -sc_threshold 0 \
  -pix_fmt yuv420p -movflags +faststart assets/chalet-hero-portre.mp4
```

A böngésző a képernyőméret, a pixelsűrűség és a kapcsolat alapján választ; álló
telefonon a portré változat megy, elforgatáskor menet közben vált, a görgetési
pozíciót megtartva.

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

## Miért nem akadozik

A görgetéses tekerés legnagyobb ellensége a hálózat: ha a videó még csak
részben van letöltve, minden olyan ugrás, ami a puffer elé esik, új
byte-tartomány-kérést indít. Mérve ugyanaz a fájl **155 ms**-ig keresett a
hálózatról és **6 ms**-ig a memóriából.

Ezért a hero a videót először egyben letölti (`fetch`, valódi százalékos
töltésjelzővel), Blobból játssza le, és csak utána engedi el a görgetést. Innentől
minden keresés helyi művelet.

Ha a letöltés nem sikerül (más domainen fekvő fájl CORS fejléc nélkül, régi
böngésző, 25 mp-es időkorlát), a kód automatikusan visszaesik a hagyományos,
folyamatos betöltésre — ilyenkor a tekerés akadozhat, de az oldal működik.

Ebből következik két dolog a kiszolgálásra:

- **A videó lehetőleg legyen ugyanazon a domainen**, vagy a CDN küldjön
  `Access-Control-Allow-Origin` fejlécet — különben a `fetch` nem használható.
- A tartalék útvonalhoz kell a **HTTP Range** támogatás (`Accept-Ranges: bytes`).
  Apache, nginx, GitHub Pages és a WordPress alapból tudja:

```bash
curl -sI -H "Range: bytes=0-99" https://a-te-oldalad.hu/.../chalet-hero-1080.mp4 | head -3
```

A válasz `206 Partial Content` legyen.

## Helyi futtatás

A beépített `python3 -m http.server` nem tud Range kérést kiszolgálni; a Blobos
út emiatt működik ugyan, de a tartalék nem tesztelhető vele. Range-képes szerver:

```bash
npx serve .
```

Böngészőben: <http://localhost:3000> — ne `file://` protokollal nyisd meg.

## Az Elementor változat újraépítése

Ha az `index.html`, a `css/style.css` vagy a `js/main.js` módosul:

```bash
python3 tools/build-elementor.py
```
