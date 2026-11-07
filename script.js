/* GINGA ID — interações */
(() => {
  const root = document.documentElement;
  root.classList.add('js');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(pointer: fine)').matches;

  /* ---------- Ícones ---------- */
  if (window.lucide) window.lucide.createIcons();

  /* ---------- QR codes decorativos ---------- */
  function rng(seed) { return () => (seed = (seed * 16807) % 2147483647) / 2147483647; }
  document.querySelectorAll('svg.qr').forEach(svg => {
    const n = 21, rand = rng(Number(svg.dataset.seed || 1) * 9973);
    const finder = (x, y) => {
      const inBox = (cx, cy) => x >= cx && x < cx + 7 && y >= cy && y < cy + 7;
      for (const [cx, cy] of [[0, 0], [n - 7, 0], [0, n - 7]]) {
        if (inBox(cx, cy)) {
          const dx = x - cx, dy = y - cy;
          const ring = dx === 0 || dy === 0 || dx === 6 || dy === 6;
          const core = dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4;
          return ring || core ? 1 : 0;
        }
        if (x >= cx - 1 && x <= cx + 7 && y >= cy - 1 && y <= cy + 7) return 0;
      }
      return null;
    };
    let d = '';
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      const f = finder(x, y);
      const on = f === null ? rand() > 0.52 : f === 1;
      if (on) d += `M${x} ${y}h1v1h-1z`;
    }
    svg.setAttribute('viewBox', `0 0 ${n} ${n}`);
    svg.setAttribute('shape-rendering', 'crispEdges');
    svg.innerHTML = `<path fill="currentColor" d="${d}"/>`;
  });

  /* ---------- Header / progresso / botão flutuante ---------- */
  const header = document.getElementById('header');
  const bar = document.querySelector('.scroll-progress span');
  const wa = document.querySelector('.wa-float');
  const stepsLine = document.querySelector('.steps-line span');
  const steps = document.getElementById('steps');
  let lastY = 0, ticking = false;

  function onScroll() {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    header.classList.toggle('scrolled', y > 40);
    const menuOpen = document.body.classList.contains('menu-open');
    header.classList.toggle('hide', !menuOpen && y > lastY && y > 500);
    wa.classList.toggle('show', y > innerHeight * 0.6);
    if (steps && stepsLine) {
      const r = steps.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (innerHeight * 0.75 - r.top) / (r.height * 0.9)));
      stepsLine.style.setProperty('--p', p.toFixed(3));
    }
    lastY = y;
    ticking = false;
  }
  addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(onScroll); ticking = true; } }, { passive: true });
  onScroll();

  /* ---------- Link ativo no menu ---------- */
  const navLinks = [...document.querySelectorAll('.nav a')];
  const sections = navLinks.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  const navIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach(s => navIO.observe(s));

  /* ---------- Menu mobile ---------- */
  const menuBtn = document.querySelector('.menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  function setMenu(open) {
    document.body.classList.toggle('menu-open', open);
    menuBtn.setAttribute('aria-expanded', open);
    menuBtn.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    mobileMenu.setAttribute('aria-hidden', !open);
    if (open) header.classList.remove('hide');
  }
  menuBtn.addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));
  mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

  /* ---------- Reveal on scroll (com stagger) ---------- */
  document.querySelectorAll('[data-stagger]').forEach(group => {
    [...group.querySelectorAll('[data-reveal]')].forEach((el, i) => el.style.setProperty('--rd', `${i * 0.08}s`));
  });
  const revealIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); revealIO.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('[data-reveal]').forEach(el => revealIO.observe(el));

  /* ---------- Spotlight nos cards ---------- */
  if (fine) {
    document.querySelectorAll('.spot').forEach(el => {
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        el.style.setProperty('--mx', `${e.clientX - r.left}px`);
        el.style.setProperty('--my', `${e.clientY - r.top}px`);
      });
    });
  }

  /* ---------- Tilt 3D ---------- */
  if (fine && !reduce) {
    document.querySelectorAll('[data-tilt]').forEach(el => {
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `perspective(900px) rotateY(${x * 14}deg) rotateX(${-y * 14}deg)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });

    /* Botões magnéticos */
    document.querySelectorAll('.magnetic').forEach(btn => {
      btn.addEventListener('pointermove', e => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        btn.style.transform = `translate(${x * 0.18}px, ${y * 0.3}px)`;
      });
      btn.addEventListener('pointerleave', () => { btn.style.transform = ''; });
    });
  }

  /* ---------- Cartão: virar ao tocar ---------- */
  document.querySelectorAll('.flip-scene').forEach(s => s.addEventListener('click', () => s.classList.toggle('flipped')));

  /* ---------- Demo Ginga Connect ---------- */
  const toast = document.querySelector('.cp-toast');
  let toastTimer;
  document.querySelectorAll('.cp-grid button').forEach(b => {
    b.addEventListener('click', () => {
      document.querySelectorAll('.cp-grid button').forEach(x => x.classList.remove('pressed'));
      b.classList.add('pressed');
      toast.textContent = b.dataset.msg;
      toast.classList.add('show');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => { toast.classList.remove('show'); b.classList.remove('pressed'); }, 1800);
    });
  });

  /* ---------- FAQ: filtro + accordion suave ---------- */
  const qas = [...document.querySelectorAll('.qa')];
  document.querySelectorAll('.faq-tabs button').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.faq-tabs button').forEach(t => t.classList.toggle('active', t === tab));
      const f = tab.dataset.filter;
      qas.forEach(q => q.classList.toggle('hidden', f !== 'all' && q.dataset.cat !== f));
    });
  });

  qas.forEach(qa => {
    const summary = qa.querySelector('summary');
    const body = qa.querySelector('.qa-body');
    summary.addEventListener('click', e => {
      if (reduce) return;
      e.preventDefault();
      if (qa.open) {
        const h = body.offsetHeight;
        body.animate([{ height: h + 'px', opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 350, easing: 'cubic-bezier(.22,1,.36,1)' })
          .onfinish = () => { qa.open = false; };
      } else {
        // fecha os outros
        qas.forEach(o => { if (o !== qa && o.open) o.open = false; });
        qa.open = true;
        const h = body.offsetHeight;
        body.animate([{ height: '0px', opacity: 0 }, { height: h + 'px', opacity: 1 }], { duration: 450, easing: 'cubic-bezier(.22,1,.36,1)' });
      }
    });
  });

  /* ---------- Ano ---------- */
  const yr = document.getElementById('year');
  if (yr) yr.textContent = new Date().getFullYear();
})();
