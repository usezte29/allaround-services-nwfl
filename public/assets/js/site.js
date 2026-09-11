/* ============================================================================
   All Around Services of NWFL — site behaviour
   Vanilla JS, no dependencies. Every enhancement degrades to working HTML.
   ========================================================================== */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ------------------------------------------------- header + scroll ring */
  var hdr = $('.hdr');
  var prog = $('.logo-ring .prg');
  var RING_LEN = 113.1; /* 2 * PI * r(18) */

  function onScroll() {
    var y = window.pageYOffset || document.documentElement.scrollTop;
    if (hdr) hdr.classList.toggle('is-stuck', y > 12);
    if (prog) {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      var p = h > 0 ? Math.min(1, Math.max(0, y / h)) : 0;
      prog.style.strokeDashoffset = String(RING_LEN * (1 - p));
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  onScroll();

  /* ------------------------------------------------------- mobile drawer */
  var burger = $('.burger');
  var drawer = $('#drawer');
  if (burger && drawer) {
    var setDrawer = function (open) {
      burger.setAttribute('aria-expanded', String(open));
      drawer.classList.toggle('is-open', open);
      drawer.setAttribute('aria-hidden', String(!open));
      document.body.style.overflow = open ? 'hidden' : '';
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    };
    burger.addEventListener('click', function () {
      setDrawer(burger.getAttribute('aria-expanded') !== 'true');
    });
    $$('a', drawer).forEach(function (a) {
      a.addEventListener('click', function () { setDrawer(false); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') {
        setDrawer(false); burger.focus();
      }
    });
  }

  /* ------------------------------------------------------ reveal on scroll */
  var rising = $$('[data-rise]');
  if (rising.length) {
    if (reduced || !('IntersectionObserver' in window)) {
      rising.forEach(function (el) { el.classList.add('is-in'); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          var el = en.target;
          var d = parseFloat(el.getAttribute('data-rise')) || 0;
          el.style.transitionDelay = d + 'ms';
          el.classList.add('is-in');
          io.unobserve(el);
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
      rising.forEach(function (el) { io.observe(el); });
    }
  }

  /* -------------------------------------------------------- the hero ring */
  var ringPhoto = $('.ring-photo');
  if (ringPhoto) {
    var shots = $$('img', ringPhoto);
    var cap = $('.ring-cap');
    var i = 0;
    if (shots.length > 1) {
      setInterval(function () {
        shots[i].classList.remove('is-on');
        i = (i + 1) % shots.length;
        shots[i].classList.add('is-on');
        /* swap the label halfway through the crossfade, so it changes with the
           picture rather than ahead of it */
        var label = shots[i].getAttribute('data-cap') || '';
        setTimeout(function () { if (cap) cap.textContent = label; }, 550);
      }, 4200);
    }
  }

  /* ---------------------------------------------------- gallery + lightbox */
  var grid = $('#gallery');
  if (grid) {
    var tiles = $$('.tile', grid);

    /* filters */
    var fbtns = $$('.filters button');
    fbtns.forEach(function (b) {
      b.addEventListener('click', function () {
        var f = b.getAttribute('data-filter');
        fbtns.forEach(function (o) { o.setAttribute('aria-pressed', String(o === b)); });
        var shown = 0;
        tiles.forEach(function (t) {
          var ok = f === 'all' || (t.getAttribute('data-cat') || '').split(' ').indexOf(f) > -1;
          t.hidden = !ok;
          if (ok) shown++;
        });
        var count = $('#gallery-count');
        if (count) count.textContent = shown + (shown === 1 ? ' project photo' : ' project photos');
      });
    });

    /* lightbox */
    var lb = $('#lightbox');
    if (lb) {
      var lbImg = $('img', lb);
      var lbCap = $('#lb-cap');
      var lbKind = $('#lb-kind');
      var last = null;
      var cur = 0;

      var visible = function () { return tiles.filter(function (t) { return !t.hidden; }); };

      var show = function (idx) {
        var list = visible();
        if (!list.length) return;
        cur = (idx + list.length) % list.length;
        var t = list[cur];
        var full = t.getAttribute('data-full');
        var img = $('img', t);
        lbImg.src = full || img.currentSrc || img.src;
        lbImg.alt = img.alt;
        lbCap.textContent = t.getAttribute('data-cap') || img.alt;
        lbKind.textContent = t.getAttribute('data-kind') || '';
      };

      var open = function (idx) {
        last = document.activeElement;
        show(idx);
        lb.classList.add('is-open');
        lb.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        /* The dialog transitions from visibility:hidden, so focus has to wait
           a tick or the browser refuses to move it. A timer rather than rAF —
           rAF never fires in a background tab. */
        setTimeout(function () { $('.lb-close', lb).focus(); }, 30);
      };
      var close = function () {
        lb.classList.remove('is-open');
        lb.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        if (last) last.focus();
      };

      tiles.forEach(function (t) {
        t.addEventListener('click', function () { open(visible().indexOf(t)); });
      });
      $('.lb-close', lb).addEventListener('click', close);
      $('.lb-prev', lb).addEventListener('click', function () { show(cur - 1); });
      $('.lb-next', lb).addEventListener('click', function () { show(cur + 1); });
      lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
      document.addEventListener('keydown', function (e) {
        if (!lb.classList.contains('is-open')) return;
        if (e.key === 'Escape') { close(); return; }
        if (e.key === 'ArrowLeft') { show(cur - 1); return; }
        if (e.key === 'ArrowRight') { show(cur + 1); return; }
        if (e.key === 'Tab') {
          /* Keep focus inside the dialog — it only holds three buttons. */
          var f = $$('.lb-btn', lb);
          var i = f.indexOf(document.activeElement);
          var next = e.shiftKey ? i - 1 : i + 1;
          if (i === -1) next = 0;
          e.preventDefault();
          f[(next + f.length) % f.length].focus();
        }
      });
    }
  }

  /* -------------------------------------------------- open / closed badge */
  /* Office hours: Mon-Fri 08:00-17:00, US Central (Santa Rosa Beach, FL). */
  var badge = $('#open-now');
  if (badge) {
    try {
      var parts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Chicago', weekday: 'short', hour: 'numeric', hour12: false
      }).formatToParts(new Date());
      var day = '', hour = 0;
      parts.forEach(function (p) {
        if (p.type === 'weekday') day = p.value;
        if (p.type === 'hour') hour = parseInt(p.value, 10);
      });
      var weekday = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].indexOf(day) > -1;
      var isOpen = weekday && hour >= 8 && hour < 17;
      badge.classList.toggle('is-closed', !isOpen);
      $('span', badge).textContent = isOpen ? 'Open now' : 'Closed right now';
    } catch (err) { /* leave the server-rendered default in place */ }
  }

  /* ------------------------------------------------------- estimate form */
  var form = $('#estimate-form');
  if (form) {
    var msgBox = $('#form-msg');
    var textarea = $('#message', form);
    var picks = $$('.picker input', form);
    var MARK = 'Projects I am interested in: ';

    /* Selected services get appended to the message so Steve gets one clear brief. */
    var syncPicks = function () {
      var chosen = picks.filter(function (p) { return p.checked; })
        .map(function (p) { return p.value; });
      var base = textarea.value.split(MARK)[0].replace(/\s+$/, '');
      var tail = MARK + chosen.join(', ') + '.';
      textarea.value = chosen.length ? (base ? base + '\n\n' + tail : tail) : base;
    };
    picks.forEach(function (p) { p.addEventListener('change', syncPicks); });

    var say = function (text, ok) {
      if (!msgBox) return;
      msgBox.textContent = text;
      msgBox.classList.add('is-on');
      msgBox.classList.toggle('is-ok', !!ok);
    };

    form.addEventListener('submit', function (e) {
      var action = form.getAttribute('action') || '';

      /* No form endpoint configured yet -> compose an email instead, so the
         form still works the day this site goes live. See README. */
      if (action.indexOf('REPLACE_FORM_ID') > -1) {
        e.preventDefault();
        if (!form.reportValidity()) return;
        var d = new FormData(form);
        var body = 'Name: ' + (d.get('name') || '') +
          '\nPhone: ' + (d.get('phone') || '') +
          '\nEmail: ' + (d.get('email') || '') +
          '\n\n' + (d.get('message') || '');
        window.location.href = 'mailto:steve@allaroundservicesnwfl.com' +
          '?subject=' + encodeURIComponent('Estimate request from ' + (d.get('name') || 'the website')) +
          '&body=' + encodeURIComponent(body);
        say('Opening your email app with the request filled in. If nothing happens, call (850) 896-3334.', true);
        return;
      }

      if (!window.fetch) return; /* let the browser POST normally */
      e.preventDefault();
      if (!form.reportValidity()) return;
      var btn = $('button[type="submit"]', form);
      var label = btn ? btn.textContent : '';
      if (btn) { btn.disabled = true; btn.textContent = 'Sending...'; }

      fetch(action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
        .then(function (r) {
          if (!r.ok) throw new Error('bad status');
          form.reset();
          syncPicks();
          say('Thanks — your request is on its way to Steve. You will hear back within one business day.', true);
        })
        .catch(function () {
          say('That did not send. Please call (850) 896-3334 or email steve@allaroundservicesnwfl.com.', false);
        })
        .finally(function () {
          if (btn) { btn.disabled = false; btn.textContent = label; }
        });
    });

    /* Deep link: contact.html?service=Kitchen+Remodeling pre-ticks a chip. */
    try {
      var want = new URLSearchParams(window.location.search).get('service');
      if (want) {
        var hit = picks.filter(function (p) { return p.value.toLowerCase() === want.toLowerCase(); })[0];
        if (hit) { hit.checked = true; syncPicks(); }
      }
    } catch (err) { /* no-op */ }
  }

  /* ------------------------------------------------------------- the year */
  $$('[data-year]').forEach(function (el) { el.textContent = String(new Date().getFullYear()); });
})();
