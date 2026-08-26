#!/usr/bin/env python3
"""
Az elementor-hero.html előállítása az index.html + css/style.css + js/main.js
fájlokból, hogy a két változat soha ne csússzon szét.

Használat a projekt gyökeréből:
    python3 tools/build-elementor.py
"""

import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

IDS = ['loader', 'loaderFill', 'nav', 'menu', 'burger', 'hero', 'stage', 'video',
       'poster', 'wash', 'wash2', 'fadeout', 'lyIntro', 'lyArrive', 'hint', 'enterBtn']

# oldalszintű szabályok, amiknek a widgetben nincs helyük
DROP_PREFIX = ('.wrap', '.sec', '.foot', '.placeholder', '.skip-link',
               '.parallax-hero', '.btn--dark', '.eyebrow--dark')
DROP_EXACT = ('html', 'body', 'img,video', 'a', 'ul', 'h1,h2,h3,p', 'button', ':focus-visible')


# ─────────────────────────── CSS szkópolás ───────────────────────────
def scope_sel(sel):
    out = []
    for one in sel.split(','):
        one = one.strip()
        if not one:
            continue
        if one.startswith(':root'):
            out.append('#chx')
        elif one.startswith('.is-ready'):
            out.append('#chx.is-ready' + one[len('.is-ready'):])
        elif one.startswith('.static-hero'):
            out.append('#chx.is-static' + one[len('.static-hero'):])
        else:
            out.append('#chx ' + one)
    return ','.join(out)


def keep(sel):
    for part in sel.split(','):
        p = part.strip()
        if p in DROP_EXACT:
            return False
        for d in DROP_PREFIX:
            if p.startswith(d):
                return False
    return True


def scope_css(block):
    res = []
    i, n = 0, len(block)
    while i < n:
        m = re.match(r'\s*@(media|keyframes|supports)[^{]*\{', block[i:])
        if m:
            head = block[i:i + m.end()]
            depth, j = 1, i + m.end()
            while j < n and depth:
                if block[j] == '{':
                    depth += 1
                elif block[j] == '}':
                    depth -= 1
                j += 1
            inner = block[i + m.end(): j - 1]
            body = inner if '@keyframes' in head else scope_css(inner)
            if body.strip():
                res.append(head.strip() + '\n' + body + '\n}')
            i = j
            continue
        b = block.find('{', i)
        if b < 0:
            break
        e = block.find('}', b)
        sel, body = block[i:b].strip(), block[b + 1:e].strip()
        i = e + 1
        if not sel or not keep(sel):
            continue
        res.append(scope_sel(sel) + '{ ' + ' '.join(body.split()) + ' }')
    return '\n'.join(res)


# ─────────────────────────── HTML darabolás ───────────────────────────
def block(src, start_pat, tag):
    i = src.find(start_pat)
    if i < 0:
        sys.exit('nem talalhato: ' + start_pat)
    depth, j = 0, i
    op, cl = re.compile(r'<%s\b' % tag), re.compile(r'</%s>' % tag)
    while j < len(src):
        mo, mc = op.search(src, j), cl.search(src, j)
        if mc is None:
            break
        if mo and mo.start() < mc.start():
            depth += 1
            j = mo.end()
        else:
            depth -= 1
            j = mc.end()
            if depth == 0:
                return src[i:j]
    sys.exit('nem zart elem: ' + start_pat)


def prefix_ids(s):
    for i in IDS:
        s = s.replace('id="%s"' % i, 'id="chx-%s"' % i)
        s = s.replace('aria-controls="%s"' % i, 'aria-controls="chx-%s"' % i)
    return s


EXTRA_CSS = """
#chx{ position:relative; font-family:var(--ff); color:var(--ink); line-height:1.6;
      -webkit-font-smoothing:antialiased; }
#chx .loader{ position:absolute; z-index:20; }
#chx.is-fixed .hero__stage{ position:fixed; top:0; }
#chx.is-pinbot .hero__stage{ position:absolute; top:auto; bottom:0; }
#chx.is-static .hero{ height:auto; }
#chx.is-static .hero__stage{ position:relative; height:100vh; height:100svh; min-height:560px; }
#chx img,#chx video{ display:block; max-width:100%; }
#chx a{ text-decoration:none; color:inherit; }
#chx ul{ margin:0; padding:0; list-style:none; }
#chx h1,#chx h2,#chx p{ margin:0; }
#chx button{ font:inherit; color:inherit; background:none; border:0; cursor:pointer; }
"""

CONFIG = '''  /* ═════════════════ ITT CSERÉLD AZ URL-EKET ═════════════════
     Három felbontás: a böngésző a képernyő és a kapcsolat alapján választ.
     Ha csak egy fájlod van, írd mindhárom videósorba ugyanazt. */
  var desktopVideoUrl = "IDE_JON_A_DESKTOP_VIDEO_URL";    /* nagy / Retina képernyő */
  var tabletVideoUrl  = "";                               /* opcionális: közepes képernyő / lassú net */
  var mobileVideoUrl  = "";                               /* opcionális: álló telefon (9:16 vágás) */
  var posterUrl       = "IDE_JON_A_POSTER_KEP_URL";
  var posterMobileUrl = "";                               /* opcionális: álló poszter */

  var SHOW_NAV  = true;   /* false: ha az Elementor sablonnak saját fejléce van */
  var NEXT_SEL  = "";     /* pl. "#szobak" — ide görgetnek a gombok; üresen a hero utáni részre */
  var FULLBLEED = true;   /* kitörés az Elementor konténer szélességéből */
  /* ═══════════════════════════════════════════════════════════ */'''

WIDGET_BOOT = '''  /* ── Elementor: teljes szélesség a konténeren belül ── */
  function fullBleed() {
    if (!FULLBLEED) return;
    root.style.marginLeft = '0'; root.style.width = 'auto';
    var l = root.getBoundingClientRect().left;
    root.style.width = document.documentElement.clientWidth + 'px';
    root.style.marginLeft = (-l) + 'px';
  }

  /* ── sticky tartalék: ha egy szülő transformja elrontaná a pinnelést ── */
  var stuckOK = null;
  function checkPin() {
    if (stuckOK !== null) return;
    var p = progress();
    if (p > 0.06 && p < 0.94) {
      stuckOK = Math.abs(stage.getBoundingClientRect().top) < 4;
      if (!stuckOK) pin();
    }
  }
  function pin() {
    var r = hero.getBoundingClientRect(), H = stage.clientHeight;
    root.classList.remove('is-fixed', 'is-pinbot');
    if (r.top <= 0 && r.bottom >= H) {
      root.classList.add('is-fixed');
      stage.style.left = r.left + 'px'; stage.style.width = r.width + 'px';
    } else {
      if (r.bottom < H) root.classList.add('is-pinbot');
      stage.style.left = ''; stage.style.width = '';
    }
  }

  /* ── a gombok a következő szakaszra görgetnek ── */
  root.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('[data-next]') : null;
    if (!a) return;
    e.preventDefault();
    var el = NEXT_SEL ? document.querySelector(NEXT_SEL) : null;
    var y = el ? (el.getBoundingClientRect().top + window.scrollY)
               : (hero.getBoundingClientRect().bottom + window.scrollY);
    try { window.scrollTo({ top: y, behavior: reduceQ.matches ? 'auto' : 'smooth' }); }
    catch (err) { window.scrollTo(0, y); }
  });

  if (!SHOW_NAV && nav && nav.parentNode) nav.parentNode.removeChild(nav);

  /* indulás */
  fullBleed();
  measure();
  layers(progress());
  video.load();'''


def main():
    css = open(os.path.join(ROOT, 'css/style.css'), encoding='utf-8').read()
    html = open(os.path.join(ROOT, 'index.html'), encoding='utf-8').read()
    js = open(os.path.join(ROOT, 'js/main.js'), encoding='utf-8').read()

    scoped = scope_css(re.sub(r'/\*.*?\*/', '', css, flags=re.S))

    navhtml = block(html, '<header class="nav"', 'header')
    herohtml = block(html, '<section class="hero"', 'section')
    loaderhtml = block(html, '<div class="loader"', 'div')

    navhtml, herohtml, loaderhtml = map(prefix_ids, (navhtml, herohtml, loaderhtml))
    herohtml = herohtml.replace(
        '  <div class="hero__stage" id="chx-stage">',
        '  <div class="hero__stage" id="chx-stage">\n\n'
        + '\n'.join('    ' + l for l in loaderhtml.split('\n')) + '\n')
    herohtml = herohtml.replace('href="#tartalom"', 'href="#" data-next')
    navhtml = navhtml.replace('href="#tartalom"', 'href="#" data-next')

    for i in IDS:
        js = js.replace("getElementById('%s')" % i, "getElementById('chx-%s')" % i)

    js = re.sub(r'  /\* ═════════ ITT CSERÉLD.*?═════ \*/', CONFIG, js, flags=re.S)
    js = js.replace("""  var doc = document.documentElement,
      body = document.body,""", """  var root = document.getElementById('chx'),
      doc = root, body = root,""")
    js = js.replace("if (!hero || !stage || !video) return;",
                    "if (!root || !hero || !stage || !video) return;")
    js = js.replace("body.classList.add('static-hero');", "root.classList.add('is-static');")
    js = js.replace("    if (withParallax) body.classList.add('parallax-hero');\n", "")
    js = js.replace("""  /* indulás */
  measure();
  layers(progress());
  video.load();""", WIDGET_BOOT)
    js = js.replace("""    applyAll(cur);

    if (visible || cur !== tgt) schedule();""",
                    """    applyAll(cur);
    if (stuckOK === false) pin(); else checkPin();

    if (visible || cur !== tgt) schedule();""")
    js = js.replace("""    rt = window.setTimeout(function () { measure(); kick(); }, 150);""",
                    """    rt = window.setTimeout(function () { fullBleed(); measure(); if (stuckOK === false) pin(); kick(); }, 150);""")

    out = """<!-- ══════════════════════════════════════════════════════════════
     CHALET IN TIROL — görgetéssel vezérelt videós hero
     Elementor HTML widgetbe illeszthető, önálló blokk.
     Generált fájl: tools/build-elementor.py
     A videó és a poszter URL-jét a <script> elején cseréld ki.
     ══════════════════════════════════════════════════════════════ -->

<div id="chx" class="chx">

%s

%s

</div>

<style>
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&family=Inter:wght@300;400;500;600&display=swap');

%s
%s
</style>

<script>
%s
</script>
""" % (navhtml, herohtml, scoped, EXTRA_CSS, js)

    path = os.path.join(ROOT, 'elementor-hero.html')
    open(path, 'w', encoding='utf-8').write(out)
    print('elementor-hero.html kesz — %d sor, div nyit/zar: %d/%d'
          % (out.count('\n') + 1, out.count('<div'), out.count('</div>')))


if __name__ == '__main__':
    main()
