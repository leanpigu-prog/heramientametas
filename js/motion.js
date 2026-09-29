(function () {
  if (typeof gsap === 'undefined') return;

  const mm = gsap.matchMedia();
  let reduce = false;
  mm.add('(prefers-reduced-motion: reduce)', () => { reduce = true; return () => { reduce = false; }; });

  const EASE = 'expo.out';
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

    if (reduce) return;

    const bars = out.querySelectorAll('.bars .br');
    if (bars.length) {
      gsap.from(bars, { scaleY: 0, duration: 0.55, ease: EASE, stagger: 0.035, clearProps: 'transform' });
      gsap.from(out.querySelectorAll('.bars .bv'), { autoAlpha: 0, duration: 0.3, delay: 0.25, stagger: 0.035, clearProps: 'visibility,opacity' });
    }
    const fills = out.querySelectorAll('.ind-fill-udes');
    if (fills.length) gsap.from(fills, { scaleX: 0, duration: 0.6, ease: EASE, stagger: 0.08, clearProps: 'transform' });

    const banner = out.querySelector('.cond-banner');
    if (banner) gsap.from(banner, { autoAlpha: 0, y: 6, duration: 0.35, ease: EASE, clearProps: 'all' });
    const cmp = out.querySelector('.cmp');
    if (cmp) gsap.from(cmp.children, { autoAlpha: 0, y: 8, duration: 0.4, delay: 0.1, stagger: 0.07, ease: EASE, clearProps: 'all' });
  };

  const orig = window.toggleCompList;
  window.toggleCompList = function (id) {
    const el = document.getElementById(id);
    if (!el) return;
    const opening = el.style.display === 'none';
    if (typeof orig === 'function') orig(id);
    if (opening && !reduce) gsap.from(el, { autoAlpha: 0, y: -6, duration: 0.3, ease: EASE, clearProps: 'all' });
  };
})();
