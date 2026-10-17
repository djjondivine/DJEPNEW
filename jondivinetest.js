/* Alive Events client portal add-on  ·  version 10  ·  made with Elevate Portal Studio
   Loaded by one line in DJ Event Planner > Website Tools > Client Portal > Appearance > Custom Scripting Code.
   Publishing from Portal Studio replaces this file, so the portal picks up changes by itself. */
(function (win, doc) {
    if (!doc || !/planningforms/i.test(win.location.pathname)) return;
    var text = function (n) { return String(n.textContent || '').replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim(); };
    var cellsAt = function (row) { var out = [], k = 0; [].slice.call(row.cells).forEach(function (c) { out.push({ cell: c, col: k }); k += c.colSpan || 1; }); return out; };
    function enhance(t) {
      if (t.__psGrid || /^planning_form_table_/.test(t.id || '')) return;
      var rows = [].slice.call(t.rows);
      if (rows.length < 2 || rows[0].querySelector('input, select, textarea')) return;
      var heads = {};
      cellsAt(rows[0]).forEach(function (h) { heads[h.col] = text(h.cell); });
      var named = Object.keys(heads).filter(function (k) { return heads[k]; });
      if (named.length < 2) return;
      var body = rows.slice(1).map(cellsAt);
      var filled = {};
      body.forEach(function (r) { r.forEach(function (x) { if (text(x.cell) || x.cell.querySelector('input, select, textarea, img, a')) filled[x.col] = true; }); });
      t.__psGrid = true;
      t.classList.add('ps-grid');
      rows[0].classList.add('ps-grid-head');
      var editable = !!t.querySelector('input, select, textarea');
      var has = function (c) { return !!(text(c) || c.querySelector('input, select, textarea, img, a')); };
      body.forEach(function (r, ri) {
        var answered = false;
        r.forEach(function (x) {
          if (!heads[x.col] && !filled[x.col]) x.cell.classList.add('ps-grid-spacer');
          else if (heads[x.col]) {
            x.cell.setAttribute('data-ps-label', heads[x.col]);
            if (has(x.cell)) answered = true; else if (!editable) x.cell.classList.add('ps-grid-empty');
          } else x.cell.classList.add('ps-grid-rowlabel');
        });
        // On a read-only form, a row with no answers at all is left out of the phone layout.
        if (!editable && !answered) rows[ri + 1].classList.add('ps-grid-blank');
      });
    }
    function run() { [].slice.call(doc.querySelectorAll('#djep-content table')).forEach(enhance); }
    if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', run); else run();
  })(window, document);
(function (win, doc) {
    if (!doc) return;
    function embed(raw) {
      var u = String(raw || '').trim(), m;
      if (!/^https?:\/\//i.test(u)) return null;
      if ((m = u.match(/(?:youtube(?:-nocookie)?\.com\/(?:watch\?(?:[^#]*&)?v=|embed\/|shorts\/|live\/|v\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/i))) return { frame: 'https://www.youtube-nocookie.com/embed/' + m[1] + '?rel=0&modestbranding=1&playsinline=1' };
      if ((m = u.match(/vimeo\.com\/(?:video\/|(?:channels|groups)\/[^/]+\/|manage\/videos\/)?(\d{6,})(?:\/([a-z0-9]{6,}))?/i))) { var h = m[2] || (u.match(/[?&]h=([a-z0-9]+)/i) || [])[1]; return { frame: 'https://player.vimeo.com/video/' + m[1] + (h ? '?h=' + h : '') }; }
      if ((m = u.match(/loom\.com\/(?:share|embed)\/([a-f0-9]{16,})/i))) return { frame: 'https://www.loom.com/embed/' + m[1] + '?hide_owner=true&hide_share=true' };
      if ((m = u.match(/(?:wistia\.com|wi\.st)\/medias\/([a-z0-9]+)/i))) return { frame: 'https://fast.wistia.net/embed/iframe/' + m[1] };
      if ((m = u.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:[^#]*&)?id=)([A-Za-z0-9_-]{10,})/i))) return { frame: 'https://drive.google.com/file/d/' + m[1] + '/preview' };
      if (/dropbox\.com\/(s|scl\/fi)\//i.test(u)) { var c = u.replace(/([?&])dl=\d&?/i, '$1').replace(/[?&]$/, ''); return { file: c + (c.indexOf('?') < 0 ? '?' : '&') + 'raw=1' }; }
      if (/\.(mp4|m4v|webm|mov)(\?|#|$)/i.test(u)) return { file: u };
      return null;
    }
    function run() {
      [].slice.call(doc.querySelectorAll('.ps-wp-frame a.ps-wp-vlink')).forEach(function (a) {
        var frame = a.parentNode;
        if (!frame || frame.querySelector('iframe, video')) return;
        var e = embed(a.getAttribute('href'));
        if (!e) return;
        var title = (frame.parentNode && frame.parentNode.querySelector('.ps-wp-vtitle')) ? frame.parentNode.querySelector('.ps-wp-vtitle').textContent : 'Video';
        var node;
        if (e.frame) {
          node = doc.createElement('iframe');
          node.src = e.frame;
          node.title = title;
          node.setAttribute('allow', 'autoplay; fullscreen; picture-in-picture; encrypted-media; clipboard-write');
          node.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
          node.setAttribute('allowfullscreen', 'true');
          node.setAttribute('loading', 'lazy');
        } else {
          node = doc.createElement('video');
          node.src = e.file;
          node.controls = true;
          node.preload = 'metadata';
          node.setAttribute('playsinline', 'playsinline');
        }
        frame.appendChild(node);
      });
    }
    if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', run); else run();
  })(window, document);
(function (win, doc, cfg) {
    if (!doc || doc.getElementById('ps-music-root')) return;

    var ARTIST = 'add_your_own_artist_name_id';
    var TITLE = 'add_your_own_song_title_id';
    var NOTES = 'add_your_own_comments_id';
    var byId = function (id) { return doc.getElementById(id); };

    function el(tag, attrs, html) {
      var n = doc.createElement(tag);
      for (var k in attrs || {}) n.setAttribute(k, attrs[k]);
      if (html != null) n.innerHTML = html;
      return n;
    }
    function escHtml(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

    // Base look for when the theme file isn't installed. :where() keeps it weaker than the theme's own rules.
    function baseStyle() {
      if (byId('ps-music-base')) return;
      var css = ':where(.ps-music){margin:0 0 16px;padding:16px;border-radius:12px;background:rgba(127,127,127,.08);border:1px solid rgba(127,127,127,.25)}' +
        ':where(.ps-music-title){display:flex;align-items:center;gap:8px;margin:0 0 4px;font-weight:700}' +
        ':where(.ps-music-sub){margin:0 0 12px;font-size:13px;opacity:.75}' +
        ':where(.ps-music-row){display:flex;gap:8px;flex-wrap:wrap}:where(.ps-music-row input){flex:1;min-width:200px;padding:10px 12px}' +
        ':where(.ps-music-status){margin-top:8px;font-size:13px;min-height:1em}:where(.ps-music-status.ok){color:#1f8a52;font-weight:600}:where(.ps-music-status.bad){color:#c0392b;font-weight:600}' +
        ':where(.ps-music-status:empty,.ps-music-player:empty){display:none}:where(.ps-music-player){margin-top:10px}:where(.ps-music-player iframe){display:block;width:100%;border:0;border-radius:12px}' +
        ':where(.ps-logos){display:inline-flex;gap:4px}:where(.ps-logos i){display:inline-grid;place-items:center;width:20px;height:20px;border-radius:50%;font-style:normal;font-size:11px;font-weight:800;color:#fff}' +
        ':where(.ps-logos i.sp){background:#1ed760;color:#000}:where(.ps-logos i.am){background:#fa233b}' +
        ':where(.ps-playlists){margin:0 0 16px}:where(.ps-playlists-title){margin:0 0 8px;font-weight:700}:where(.ps-playlists-row){display:flex;flex-wrap:wrap;gap:8px}' +
        ':where(.ps-playlist){display:inline-flex;align-items:center;gap:8px;padding:8px 14px 8px 8px;border-radius:999px;border:1px solid rgba(127,127,127,.3);text-decoration:none;font-weight:600}' +
        '.ps-filled{animation:ps-filled 1.6s ease}@keyframes ps-filled{0%,40%{box-shadow:0 0 0 4px rgba(30,215,96,.45)}100%{box-shadow:none}}';
      var s = el('style', { id: 'ps-music-base' });
      s.textContent = css;
      (doc.head || doc.documentElement).appendChild(s);
    }

    /* ---------- reading links ---------- */
    function parse(raw) {
      var url = String(raw || '').trim();
      if (!url) return null;
      var m = url.match(/(?:open\.spotify\.com\/(?:intl-[a-z-]+\/)?(?:embed\/)?|spotify:)(track|album|playlist|episode|show)[\/:]([A-Za-z0-9]{8,})/i);
      if (m) return { service: 'spotify', type: m[1].toLowerCase(), id: m[2], link: 'https://open.spotify.com/' + m[1].toLowerCase() + '/' + m[2] };
      if (/spotify\.link|spoti\.fi/i.test(url)) return { service: 'spotify', type: 'short' };
      m = url.match(/music\.apple\.com\/([a-z]{2})\/(album|song|playlist|music-video)\/([^?#]*)(\?[^#]*)?/i);
      if (m) {
        var cc = m[1].toLowerCase(), kind = m[2].toLowerCase(), parts = m[3].split('/').filter(Boolean);
        var last = parts[parts.length - 1] || '', slug = parts.length > 1 ? parts[0] : '';
        var track = (m[4] || '').match(/[?&]i=(\d+)/);
        if (kind === 'playlist') return { service: 'apple', type: 'playlist', cc: cc, id: last, name: slug, link: 'https://music.apple.com/' + cc + '/playlist/' + last };
        if (kind === 'song' || kind === 'music-video') return { service: 'apple', type: 'track', cc: cc, id: last, link: 'https://music.apple.com/' + cc + '/song/' + last };
        if (track) return { service: 'apple', type: 'track', cc: cc, id: track[1], album: last, link: 'https://music.apple.com/' + cc + '/song/' + track[1] };
        return { service: 'apple', type: 'album', cc: cc, id: last, link: 'https://music.apple.com/' + cc + '/album/' + last };
      }
      return { service: 'unknown' };
    }

    function getJson(url) {
      return fetch(url, { credentials: 'omit' }).then(function (r) { if (!r.ok) throw new Error('lookup failed'); return r.json(); })
        .catch(function () { return jsonp(url); });
    }
    // Some networks block cross-site fetches; Apple's API also answers JSONP, which always works.
    function jsonp(url) {
      return new Promise(function (resolve, reject) {
        if (!/itunes\.apple\.com/.test(url)) { reject(new Error('lookup failed')); return; }
        var name = 'psMusicCb' + Date.now() + Math.floor(Math.random() * 1000);
        var s = doc.createElement('script');
        var done = function () { try { delete win[name]; } catch (e) { win[name] = undefined; } s.remove(); };
        var t = setTimeout(function () { done(); reject(new Error('timeout')); }, 9000);
        win[name] = function (data) { clearTimeout(t); done(); resolve(data); };
        s.src = url + (url.indexOf('?') < 0 ? '?' : '&') + 'callback=' + name;
        s.onerror = function () { clearTimeout(t); done(); reject(new Error('lookup failed')); };
        doc.head.appendChild(s);
      });
    }
    var clean = function (s) { return String(s || '').replace(/\s+/g, ' ').trim(); };
    var slugName = function (s) { return clean(decodeURIComponent(String(s || '')).replace(/[-_]+/g, ' ')).replace(/\b\w/g, function (c) { return c.toUpperCase(); }); };

    function lookup(info) {
      if (info.service === 'spotify') {
        return getJson('https://open.spotify.com/oembed?url=' + encodeURIComponent(info.link)).then(function (o) {
          var title = clean(o.title);
          if (info.type !== 'track') return { title: title, artist: info.type === 'album' ? 'Album' : 'Playlist', guess: false, kind: info.type };
          // Spotify only gives the song name, so ask Apple's catalog who sings it.
          return getJson('https://itunes.apple.com/search?entity=song&limit=8&term=' + encodeURIComponent(title)).then(function (r) {
            var rows = (r && r.results) || [];
            var exact = rows.filter(function (x) { return clean(x.trackName).toLowerCase() === title.toLowerCase(); })[0];
            var best = exact || rows[0];
            return { title: title, artist: best ? clean(best.artistName) : '', guess: true, kind: 'track' };
          }).catch(function () { return { title: title, artist: '', guess: true, kind: 'track' }; });
        });
      }
      if (info.type === 'playlist') return Promise.resolve({ title: slugName(info.name) || 'Apple Music playlist', artist: 'Playlist', kind: 'playlist' });
      return getJson('https://itunes.apple.com/lookup?id=' + encodeURIComponent(info.id) + '&country=' + info.cc).then(function (r) {
        var x = r && r.results && r.results[0];
        if (!x) throw new Error('not found');
        if (info.type === 'album') return { title: clean(x.collectionName), artist: clean(x.artistName), kind: 'album' };
        return { title: clean(x.trackName || x.collectionName), artist: clean(x.artistName), kind: 'track' };
      });
    }

    /* ---------- filling DJEP's own fields ---------- */
    function setField(id, value) {
      var f = byId(id);
      if (!f || value == null) return false;
      f.value = value;
      ['input', 'change', 'keyup'].forEach(function (t) { f.dispatchEvent(new Event(t, { bubbles: true })); });
      if (win.jQuery) { try { win.jQuery(f).trigger('change'); } catch (e) { /* DJEP's handlers are optional */ } }
      f.classList.remove('ps-filled');
      void f.offsetWidth;
      f.classList.add('ps-filled');
      return true;
    }
    function setNotes(text) {
      var f = byId(NOTES);
      if (!f) return;
      var max = f.maxLength > 0 ? f.maxLength : 100; // DJEP keeps 100 characters of comments
      var cur = clean(f.value);
      if (cur && !/^(Spotify|Apple Music): /.test(cur)) {
        if ((cur + ' | ' + text).length <= max) setField(NOTES, cur + ' | ' + text);
        return;
      }
      setField(NOTES, text.slice(0, max));
    }

    function player(info) {
      if (!cfg.player) return '';
      var src = '', h = 152;
      if (info.service === 'spotify') { src = 'https://open.spotify.com/embed/' + info.type + '/' + info.id + '?utm_source=generator'; h = info.type === 'track' ? 152 : 352; }
      if (info.service === 'apple') {
        var kind = info.type === 'playlist' ? 'playlist' : info.album || info.type === 'album' ? 'album' : 'song';
        src = 'https://embed.music.apple.com/' + info.cc + '/' + kind + '/' + (info.album || info.id) + (info.album ? '?i=' + info.id : '');
        h = info.type === 'track' ? 175 : 450;
      }
      return src ? '<iframe src="' + src + '" height="' + h + '" loading="lazy" allow="autoplay *; encrypted-media *; clipboard-write" title="Song preview"></iframe>' : '';
    }

    /* ---------- the box ---------- */
    function mount() {
      var titleInput = byId(TITLE);
      if (!titleInput) return false;
      var panel = byId('tabs-6') || titleInput.closest('.ui-tabs-panel') || titleInput.parentNode;
      var anchor = byId('add_your_own_song_helper_div');
      if (!anchor || !panel.contains(anchor)) anchor = panel.firstElementChild;
      baseStyle();

      var root = el('div', { id: 'ps-music-root' });

      var lists = (cfg.playlists || []).filter(function (p) { return p && p.url; });
      if (lists.length) {
        var pl = el('div', { 'class': 'ps-playlists' });
        pl.innerHTML = (cfg.playlistsTitle ? '<p class="ps-playlists-title">' + escHtml(cfg.playlistsTitle) + '</p>' : '') +
          '<div class="ps-playlists-row">' + lists.map(function (p) {
            var am = /music\.apple\.com/i.test(p.url);
            return '<a class="ps-playlist" href="' + escHtml(p.url) + '" target="_blank" rel="noopener"><span class="ps-logos">' + (am ? '<i class="am">♪</i>' : '<i class="sp">♫</i>') + '</span>' + escHtml(p.label) + '</a>';
          }).join('') + '</div>';
        root.appendChild(pl);
      }

      if (cfg.paste) {
        var box = el('div', { 'class': 'ps-music', id: 'ps-music' });
        box.innerHTML =
          '<p class="ps-music-title"><span class="ps-logos"><i class="sp">♫</i><i class="am">♪</i></span>' + escHtml(cfg.title) + '</p>' +
          '<p class="ps-music-sub">' + escHtml(cfg.sub) + '</p>' +
          '<div class="ps-music-row"><input type="url" id="ps-music-link" inputmode="url" autocomplete="off" placeholder="Paste a Spotify or Apple Music song link" aria-label="Spotify or Apple Music link">' +
          '<button type="button" class="djep-actionbutton ps-music-go">Fill in song</button></div>' +
          '<div class="ps-music-status" role="status" aria-live="polite"></div><div class="ps-music-player"></div>';
        root.appendChild(box);

        var input = box.querySelector('#ps-music-link');
        var status = box.querySelector('.ps-music-status');
        var playerBox = box.querySelector('.ps-music-player');
        var say = function (kind, msg) { status.className = 'ps-music-status ' + (kind || ''); status.textContent = msg; };
        var last = '', seq = 0;

        var run = function () {
          var raw = input.value.trim();
          if (!raw || raw === last) return;
          last = raw;
          var info = parse(raw);
          playerBox.innerHTML = '';
          if (!info || info.service === 'unknown') { say('bad', 'That isn’t a Spotify or Apple Music link. In the app, tap Share → Copy Link, then paste it here.'); return; }
          if (info.type === 'short') { say('bad', 'Short links can’t be read. Open the link in your browser, then copy the full address from the address bar.'); return; }
          var mine = ++seq;
          say('', 'Looking it up…');
          lookup(info).then(function (r) {
            if (mine !== seq) return;
            if (r.artist) setField(ARTIST, r.artist);
            if (r.title) setField(TITLE, r.title);
            setNotes((info.service === 'spotify' ? 'Spotify: ' : 'Apple Music: ') + info.link);
            playerBox.innerHTML = player(info);
            var what = r.kind === 'track' ? '“' + r.title + '”' + (r.artist ? ' by ' + r.artist : '') : 'the ' + r.kind + ' “' + r.title + '”';
            say('ok', '✓ Filled in ' + what + '.' + (r.guess ? ' Please check the artist, then press Save below.' : ' Now press Save below.'));
          }).catch(function () {
            if (mine !== seq) return;
            setNotes((info.service === 'spotify' ? 'Spotify: ' : 'Apple Music: ') + info.link);
            playerBox.innerHTML = player(info);
            say('bad', 'We couldn’t look that song up right now. The link is saved in Comments. Please type the song and artist below.');
          });
        };
        var timer = null;
        input.addEventListener('paste', function () { setTimeout(run, 30); });
        input.addEventListener('input', function () { clearTimeout(timer); timer = setTimeout(run, 700); });
        // Enter would submit DJEP's music form, so it runs the lookup instead.
        input.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); last = ''; run(); } });
        box.querySelector('.ps-music-go').addEventListener('click', function (e) { e.preventDefault(); last = ''; run(); });
      }

      if (!root.children.length) return true;
      if (anchor) anchor.parentNode.insertBefore(root, anchor); else panel.appendChild(root);
      return true;
    }

    // DJEP can build the music tabs after the page loads, so keep checking for a little while
    // (20 seconds on music pages, 3 seconds anywhere else).
    var tries = 0, max = /music/i.test(win.location.pathname) ? 40 : 6;
    (function poll() {
      if (doc.getElementById('ps-music-root') || mount()) return;
      if (++tries < max) setTimeout(poll, 500);
    })();
  })(window, document, {"paste":true,"player":true,"title":"Add a song from Spotify or Apple Music","sub":"Paste a song link and we’ll fill in the title and artist for you.","playlistsTitle":"Need ideas? Browse our playlists","playlists":[]});
(function (win, doc) {
    if (!doc || !doc.body || !win.getComputedStyle || doc.documentElement.hasAttribute('data-ps-contrast')) return;
    doc.documentElement.setAttribute('data-ps-contrast', '1');
    var MIN = 3;
    // Left alone: the design's own pieces, form controls and buttons, and planning-form section headers (the theme
    // paints its own layer over DJEP's header color there, which a color check can't see).
    var SKIP = '.ps-wp, .ps-music, .ps-playlists, .ps-hero-eq, .ps-hero-media, script, style, noscript, option, select, textarea, input, button, .btn, a[class*="button"], [class*="paywith"], .djep-form-sections, .djep-sectiontitle, [class*="form-sections"]';
    function rgb(s) {
      var m = /rgba?\(([^)]+)\)/.exec(s || '');
      if (!m) return null;
      var p = m[1].split(/[\s,\/]+/).filter(Boolean).map(parseFloat);
      return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
    }
    function lum(c) {
      var f = function (v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
      return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
    }
    function ratio(a, b) { var x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
    function sat(c) { var mx = Math.max(c.r, c.g, c.b), mn = Math.min(c.r, c.g, c.b); return mx ? (mx - mn) / mx : 0; }
    // The design's own colors, read from the theme file (none when the theme isn't loaded).
    var root = win.getComputedStyle(doc.documentElement);
    var theme = function (name) { var v = root.getPropertyValue(name).trim(); if (!v) return null; var t = doc.createElement('i'); t.style.color = v; doc.body.appendChild(t); var c = rgb(win.getComputedStyle(t).color); t.remove(); return c; };
    var T = { page: theme('--ps-page'), card2: theme('--ps-card-2'), soft: theme('--ps-accent-soft'), text: theme('--ps-text') };
    // The surface behind an element: the nearest one with a solid color, or null when a picture or gradient is behind
    // it (those are the design's own and can't be measured).
    function surface(el) {
      for (var e = el; e && e !== doc.documentElement; e = e.parentElement) {
        var cs = win.getComputedStyle(e);
        if (cs.backgroundImage && cs.backgroundImage !== 'none') return null;
        var c = rgb(cs.backgroundColor);
        if (c && c.a >= 0.5) return { el: e, c: c };
      }
      return T.page ? { el: null, c: T.page } : null;
    }
    function check(el) {
      if (!el || el.closest(SKIP)) return;
      var fg = rgb(win.getComputedStyle(el).color);
      var s = surface(el);
      if (!fg || !s || ratio(fg, s.c) >= MIN) return;
      // Give a DJEP surface the design's matching one (theme loaded and the surface is DJEP's, not the page).
      if (s.el && T.card2 && T.text && !/^(djep-content|djep-page|djep-header|djep-navbar)$/.test(s.el.id) && s.el !== doc.body && !s.el.closest('.ps-wp')) {
        // DJEP fades some row colors in; switch fades off while the new surface is applied and measured.
        var fade = s.el.style.transition;
        s.el.style.transition = 'none';
        s.el.classList.add(sat(s.c) > 0.12 ? 'ps-fix-tint' : 'ps-fix-surface');
        var now = surface(el);
        win.getComputedStyle(s.el).backgroundColor;
        s.el.style.transition = fade;
        if (now && ratio(rgb(win.getComputedStyle(el).color), now.c) >= MIN) return;
        if (now && now.el === s.el && ratio(now.c, s.c) < 1.05) {
          // DJEP forces that color (inline !important): set it the same way.
          var want = sat(s.c) > 0.12 && T.soft ? T.soft : T.card2;
          s.el.style.setProperty('background-color', 'rgb(' + want.r + ',' + want.g + ',' + want.b + ')', 'important');
          now = surface(el);
          if (now && ratio(rgb(win.getComputedStyle(el).color), now.c) >= MIN) return;
        }
        s = surface(el) || s;
      }
      // Last resort: the most readable text color on what's behind it.
      var opts = [T.text, { r: 255, g: 255, b: 255 }, { r: 17, g: 17, b: 17 }].filter(Boolean);
      var best = opts.sort(function (a, b) { return ratio(b, s.c) - ratio(a, s.c); })[0];
      el.style.setProperty('color', 'rgb(' + best.r + ',' + best.g + ',' + best.b + ')', 'important');
    }
    function scan(rootEl) {
      if (!rootEl || rootEl.nodeType !== 1) return;
      var seen = [];
      var w = doc.createTreeWalker(rootEl, 4, null);
      for (var n = w.nextNode(); n; n = w.nextNode()) {
        if (!/\S/.test(n.nodeValue)) continue;
        var p = n.parentElement;
        if (p && seen.indexOf(p) < 0) { seen.push(p); check(p); }
      }
    }
    var areas = function () { return [doc.getElementById('djep-content')].concat([].slice.call(doc.querySelectorAll('.ui-dialog'))).filter(Boolean); };
    areas().forEach(scan);
    // DJEP adds content later (music search results, pop-ups): check what it adds.
    if (!win.MutationObserver) return;
    var pending = [], timer = 0;
    var mo = new win.MutationObserver(function (records) {
      records.forEach(function (r) {
        if (r.type === 'childList') [].forEach.call(r.addedNodes, function (n) { if (n.nodeType === 1) pending.push(n); else if (n.parentElement) pending.push(n.parentElement); });
        else if (r.target.nodeType === 1 && !/\bps-(fix|rv|wipe|spot)/.test(r.target.className + '')) pending.push(r.target);
      });
      if (!timer && pending.length) timer = setTimeout(function () {
        timer = 0;
        var list = pending.splice(0);
        list.forEach(function (n) { if (doc.contains(n) && n.closest && !n.closest(SKIP)) scan(n); });
        mo.takeRecords();
      }, 450);
    });
    mo.observe(doc.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style', 'bgcolor'] });
  })(window, document);
(function (win, doc, o) {
    if (!doc || !doc.body || doc.documentElement.hasAttribute('data-ps-motion')) return;
    doc.documentElement.setAttribute('data-ps-motion', '1');
    o = o || {};
    var mq = function (q) { return !!(win.matchMedia && win.matchMedia(q).matches); };
    var calm = mq('(prefers-reduced-motion: reduce)');
    var all = function (sel, root) { return sel ? [].slice.call((root || doc).querySelectorAll(sel)) : []; };
    var layer = function (cls) { var n = doc.createElement('div'); n.className = cls; n.setAttribute('aria-hidden', 'true'); return n; };

    // One-line buttons
    all(o.buttons).forEach(function (br) {
      var sp = doc.createTextNode(' ');
      br.parentNode.replaceChild(sp, br);
      sp.parentNode.normalize();
    });

    // Living hero
    if ((o.zoom || o.eq) && !calm) {
      var host = null;
      if (o.banner) {
        // The dashboard's banner is drawn by the theme as #djep-content::before; a real element with the same look
        // takes its place (the theme hides the drawn one), so the layers can sit inside it.
        var content = doc.getElementById('djep-content');
        var cs = content && win.getComputedStyle ? win.getComputedStyle(content, '::before') : null;
        var txt = cs ? String(cs.content || '') : '';
        if (cs && cs.display !== 'none' && /^["']/.test(txt)) {
          host = doc.createElement('div');
          host.className = 'ps-banner';
          var t = doc.createElement('span');
          t.className = 'ps-banner-text';
          t.textContent = txt.slice(1, -1).replace(/\\A ?/gi, '\n').replace(/\\(.)/g, '$1');
          host.appendChild(t);
          content.insertBefore(host, content.firstChild);
        }
      } else host = doc.getElementById('djep-header');
      if (host) {
        var first = host.firstChild;
        if (o.zoom) host.insertBefore(layer('ps-hero-media'), first);
        if (o.eq) {
          var eq = layer('ps-hero-eq');
          var n = Math.max(24, Math.min(96, Math.round((host.offsetWidth || 900) / 12)));
          for (var i = 0; i < n; i++) {
            var b = doc.createElement('i');
            b.style.setProperty('--ps-eq-d', (0.45 + Math.random() * 0.9).toFixed(2) + 's');
            b.style.setProperty('--ps-eq-dl', (-Math.random() * 2).toFixed(2) + 's');
            b.style.setProperty('--ps-eq-h', (0.35 + Math.random() * 0.65).toFixed(2));
            eq.appendChild(b);
          }
          host.insertBefore(eq, first);
        }
        if (!o.banner && o.zoom) host.appendChild(layer('ps-hero-logo'));
      }
    }

    // Panels: the outermost one under a point, never DJEP's Welcome Text wrapper around the welcome page.
    function panel(node) {
      var t = node && node.closest ? node.closest(o.cards) : null;
      if (t && t.querySelector('.ps-wp')) t = null;
      var up = t && t.parentElement && t.parentElement.closest(o.cards);
      while (up) {
        if (!up.querySelector('.ps-wp')) t = up;
        up = up.parentElement && up.parentElement.closest(o.cards);
      }
      return t;
    }

    // Spotlight
    if (o.spot && o.cards && mq('(hover: hover) and (pointer: fine)')) {
      var cur = null, raf = 0, px = 0, py = 0;
      var paint = function () {
        raf = 0;
        if (!cur) return;
        var r = cur.getBoundingClientRect();
        cur.style.setProperty('--ps-mx', Math.round(px - r.left) + 'px');
        cur.style.setProperty('--ps-my', Math.round(py - r.top) + 'px');
      };
      doc.addEventListener('pointermove', function (e) {
        if (e.pointerType && e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
        px = e.clientX; py = e.clientY;
        var t = panel(e.target);
        if (t !== cur) { if (cur) cur.classList.remove('ps-spot'); cur = t; if (cur) cur.classList.add('ps-spot'); }
        if (cur && !raf) raf = win.requestAnimationFrame(paint);
      }, { passive: true });
      doc.documentElement.addEventListener('mouseleave', function () { if (cur) cur.classList.remove('ps-spot'); cur = null; });
    }

    // Scroll-in: only what starts below the screen; anything already in view is left alone.
    if (o.reveal && !calm && 'IntersectionObserver' in win) {
      var vh = win.innerHeight || doc.documentElement.clientHeight || 800;
      var below = function (el) { var r = el.getBoundingClientRect(); return r.height > 0 && r.top > vh * 0.9; };
      var finish = function (el, cls) {
        var done = function (e) {
          if (e && e.target !== el) return;
          el.removeEventListener('transitionend', done);
          el.classList.remove(cls, cls + '-in');
          el.style.transitionDelay = '';
        };
        el.addEventListener('transitionend', done);
        setTimeout(done, 1800);
      };
      var io = new win.IntersectionObserver(function (entries) {
        var k = 0;
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          io.unobserve(e.target);
          var cls = e.target.classList.contains('ps-wipe') ? 'ps-wipe' : 'ps-rv';
          e.target.style.transitionDelay = (k++ * 0.08).toFixed(2) + 's';
          e.target.classList.add(cls + '-in');
          finish(e.target, cls);
        });
      }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });
      var seen = [];
      all(o.cards).forEach(function (el) {
        var p = panel(el);
        if (p && seen.indexOf(p) < 0) seen.push(p);
      });
      seen.forEach(function (el) { if (below(el)) { el.classList.add('ps-rv'); io.observe(el); } });
      all(o.wipe).forEach(function (el) { if (below(el)) { el.classList.add('ps-wipe'); io.observe(el); } });
    }
  })(window, document, {"buttons":".djep-actionbutton br, .djep-widgetaction br, .djep-paymentbutton br, .djep-planeventbutton br, .djep-eventdetailsbutton br, .djep-changebutton br, .djep-searchbutton br, .djep-addingplaylistbutton br, .djep-addplaylistbutton br, .djep-specialsongbutton br, #submit_payment_button br, #card-submit br, #paypal_paynowbutton br, #contact_submit br, #djep-content input[type=\"submit\"] br, #djep-content input[type=\"button\"] br, #djep-content button[type=\"submit\"] br, .ui-dialog .ui-dialog-buttonpane button br","banner":false,"zoom":true,"eq":true,"spot":true,"reveal":true,"cards":".djep-welcometextbox, .djep-eventlistbox, .djep-eventslistbox, .djep-latestemailsbox, .djep-upcomingmeetingsbox, .djep-eventdatetimesbox, .djep-eventdescriptionbox, .djep-servicedetailsbox, .djep-venueinfobox, .djep-staffingbox, .djep-paymentsfinancesbox, .djep-feedetailsbox, .djep-paymenthistorybox, .djep-totalfeebox, .djep-documentsbox, .djep-relatedfilesbox, .djep-requestchangesbox, .djep-requestchangesformbox, .djep-planneraccessbox, .djep-managemusicbox, .djep-planningformsbox, .djep-timelinebox, .djep-othertoolsbox, .djep-selectyourmusicbox, .djep-makepaymentbox, .djep-contactformbox, .djep-ourcontactinfobox, .djep-emailhistorybox, .djep-emailmessagebox, .djep-contactdetailsbox, .djep-logindetailsbox, .djep-edittimelinebox, .djep-viewtimelinebox, .djep-planningformseditbox, .djep-planningformsviewbox, .djep-editweddingnamesbox, .djep-viewweddingnamesbox, .djep-viewdocumentbox, .djep-printdocumentbox, .djep-viewrequestboxes, .djep-guestrequesthowitworksbox, .djep-guestrequestsocialbox, .djep-guestrequestsettingsbox, .djep-guestrequestdescription, .djep-specialsongsbox, .djep-songrequestbox, [id=\"djep-countdownclock\"], #djep-content div[class^=\"djep-\"][class$=\"box\"]:not(.djep-requestlimitbox), #djep-content div[class^=\"djepm-\"][class*=\"box\"]:not([class*=\"playlistbox\"]), .ps-wp-card","wipe":".djep-form-sections, .djep-sectiontitle"});
