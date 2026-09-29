(function () {
  if (typeof gsap === 'undefined') return;

  const mm = gsap.matchMedia();
  let reduce = false;
  mm.add('(prefers-reduced-motion: reduce)', () => { reduce = true; return () => { reduce = false; }; });

  const EASE = 'expo.out';

  if (typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
    const bar = document.querySelector('.bar');
    if (bar) ScrollTrigger.create({ start: 60, end: 'max', onToggle: self => bar.classList.toggle('compact', self.isActive) });
  }
  let lastColors = null;
  let lastKey = null;
  let lastMeta = null;

  window.animateRender = function (key, meta) {
    const out = document.getElementById('out');
    if (!out) return;
    const pk = k => k.split('|').slice(0, 2).join('|');
    const sameProg = lastKey && pk(lastKey) === pk(key);
    const from = sameProg && lastMeta != null ? lastMeta : null;
    lastKey = key;
    lastMeta = meta;

    const num = out.querySelector('.meta-n');
    if (num && meta != null && from != null && from !== meta) {
      const o = { v: from };
      gsap.to(o, {
        v: meta,
        duration: reduce ? 0 : 0.6,
        ease: EASE,
        snap: { v: 1 },
        onUpdate: () => { num.textContent = o.v; },
        onComplete: () => { num.textContent = meta; }
      });
    }

    const hb = out.querySelector('.hero-body');
    const banner0 = out.querySelector('.cond-banner');
    const cur = num ? {
      c: getComputedStyle(num).color,
      b: hb ? getComputedStyle(hb).borderTopColor : null,
      bg: banner0 ? getComputedStyle(banner0).backgroundColor : null
    } : null;
    if (cur && lastColors && !reduce) {
      if (lastColors.c !== cur.c) gsap.fromTo(num, { color: lastColors.c }, { color: cur.c, duration: 0.5, ease: EASE });
      if (hb && lastColors.b !== cur.b) gsap.fromTo(hb, { borderTopColor: lastColors.b }, { borderTopColor: cur.b, duration: 0.5, ease: EASE });
      if (banner0 && lastColors.bg !== cur.bg) gsap.fromTo(banner0, { backgroundColor: lastColors.bg }, { backgroundColor: cur.bg, duration: 0.5, ease: EASE });
    }
    lastColors = cur;

    if (reduce) return;

    const bars = out.querySelectorAll('.bars .br');
    if (bars.length) {
      gsap.from(bars, { scaleY: 0, duration: 0.55, ease: EASE, stagger: 0.035, clearProps: 'transform' });
      gsap.from(out.querySelectorAll('.bars .bv'), { autoAlpha: 0, duration: 0.3, delay: 0.25, stagger: 0.035, clearProps: 'visibility,opacity' });
    }
    const fills = out.querySelectorAll('.ind-fill-udes');
    if (fills.length) gsap.from(fills, { scaleX: 0, duration: 0.6, ease: EASE, stagger: 0.08, clearProps: 'transform' });

    const banner = out.querySelector('.cond-banner');
    if (banner) gsap.from(banner, { autoAlpha: 0, y: 6, duration: 0.35, ease: EASE, clearProps: 'opacity,visibility,transform' });
    const cmp = out.querySelector('.cmp');
    if (cmp) gsap.from(cmp.children, { autoAlpha: 0, y: 8, duration: 0.4, delay: 0.1, stagger: 0.07, ease: EASE, clearProps: 'opacity,visibility,transform' });
  };

  const orig = window.toggleCompList;
  window.toggleCompList = function (id) {
    const el = document.getElementById(id);
    if (!el) return;
    const opening = el.style.display === 'none';
    if (typeof orig === 'function') orig(id);
    if (opening && !reduce) gsap.from(el, { autoAlpha: 0, y: -6, duration: 0.3, ease: EASE, clearProps: 'opacity,visibility,transform' });
  };
})();
