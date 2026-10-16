/* Alive Events client portal add-on  ·  version 5  ·  made with Elevate Portal Studio
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
