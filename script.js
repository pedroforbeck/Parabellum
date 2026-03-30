
const cursor        = document.getElementById('cursor');
const trailContainer = document.getElementById('cursor-trail-container');
let lastTrail = 0;

document.addEventListener('mousemove', e => {
  cursor.style.left = e.clientX + 'px';
  cursor.style.top  = e.clientY + 'px';

  const now = Date.now();
  if (now - lastTrail > 40) {
    lastTrail = now;
    const dot = document.createElement('div');
    dot.className = 'trail-dot';
    dot.style.left   = e.clientX + 'px';
    dot.style.top    = e.clientY + 'px';
    const size = Math.random() * 5 + 3 + 'px';
    dot.style.width  = size;
    dot.style.height = size;
    trailContainer.appendChild(dot);
    setTimeout(() => dot.remove(), 420);
  }
});

/* add hover nos cards etc */
document.querySelectorAll('a, .sprite, button').forEach(el => {
  el.addEventListener('mouseenter', () => cursor.classList.add('hovering'));
  el.addEventListener('mouseleave', () => cursor.classList.remove('hovering'));
});

/* cor do cursor nos spritess @ */
document.getElementById('sprite-p1').addEventListener('mouseenter', () => cursor.style.background = 'var(--yellow)');
document.getElementById('sprite-p1').addEventListener('mouseleave', () => cursor.style.background = '');
document.getElementById('sprite-p2').addEventListener('mouseenter', () => cursor.style.background = '#2a6de8');
document.getElementById('sprite-p2').addEventListener('mouseleave', () => cursor.style.background = '');


/* vamos ver como vai ficar hero zoom */
const heroEl    = document.getElementById('hero');
const heroTitle = document.getElementById('hero-title');
const heroSub   = document.querySelector('.hero-subtitle');
const scrollHint = document.querySelector('.hero-scroll-hint');


function revealHero() {
  heroTitle.style.transition = 'opacity .9s cubic-bezier(.16,1,.3,1), transform .9s cubic-bezier(.16,1,.3,1)';
  heroTitle.style.opacity    = '1';
  heroTitle.style.transform  = 'scale(1.6)';
  setTimeout(() => { heroTitle.style.transition = 'none'; }, 950);

  heroSub.style.transition = 'opacity .6s .2s';
  heroSub.style.opacity    = '1';
  setTimeout(() => { heroSub.style.transition = 'none'; }, 850);

  scrollHint.style.transition = 'opacity .6s .6s';
  scrollHint.style.opacity    = '1';
  setTimeout(() => { scrollHint.style.transition = 'none'; }, 1300);
}


heroTitle.style.opacity   = '0';
heroTitle.style.transform = 'scale(1.6)';
heroSub.style.opacity     = '0';
scrollHint.style.opacity  = '0';
setTimeout(revealHero, 200);


/* ─────────────────────────────────────────────
   PLAYER SELECT  —  scroll zoom-IN
   Same 250vh pattern, sticky inner.
   Cards: scale 0.25 → 1.0 as you scroll through.
   P1 comes from left-bottom, P2 from right-bottom.
   VS badge pops from centre at mid-progress.
───────────────────────────────────────────── */
const playerSection = document.getElementById('player-select');
const p1Card        = document.getElementById('p1-card');
const p2Card        = document.getElementById('p2-card');
const vsBadge       = document.getElementById('vs');
const sectionLabel  = document.querySelector('.section-label');
const hpFills       = document.querySelectorAll('.hp-fill');

let hpFired = false;

function easeOutExpo(t) {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

function easeOutBack(t) {
  const c1 = 1.70158, c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}


/* ─────────────────────────────────────────────
   UNIFIED SCROLL HANDLER
───────────────────────────────────────────── */
window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  const vh      = window.innerHeight;

  /* ── HERO zoom-out ── */
  const heroTop    = heroEl.getBoundingClientRect().top + scrollY;
  const heroRange  = heroEl.offsetHeight - vh;          // 150vh
  const heroP      = Math.max(0, Math.min((scrollY - heroTop) / heroRange, 1));

  const hScale  = 1.6 - heroP * 1.35;
  const hOpacity = heroP < 0.4 ? 1 : 1 - ((heroP - 0.4) / 0.6);
  const hTY     = -heroP * 80;

  heroTitle.style.transform = `scale(${Math.max(hScale, 0.25)}) translateY(${hTY}px)`;
  heroTitle.style.opacity   = Math.max(hOpacity, 0);

  const subO = 1 - heroP * 2.5;
  heroSub.style.opacity    = Math.max(subO, 0);
  scrollHint.style.opacity = Math.max(subO, 0);

  /* ── PLAYERS zoom-in ── */
  const psTop   = playerSection.getBoundingClientRect().top + scrollY;
  const psRange = playerSection.offsetHeight - vh;      // 150vh
  const psP     = Math.max(0, Math.min((scrollY - psTop) / psRange, 1));

  /* section label: slides up and fades in early */
  const labelP  = Math.min(psP / 0.25, 1);
  const labelE  = easeOutExpo(labelP);
  sectionLabel.style.opacity   = labelE;
  sectionLabel.style.transform = `translateY(${(1 - labelE) * 20}px)`;

  /* P1 — enters from bottom-left */
  const p1P   = Math.min(Math.max((psP - 0.05) / 0.6, 0), 1);
  const p1E   = easeOutBack(p1P);
  const p1Scale = 0.25 + p1E * 0.75;
  const p1TX    = (1 - easeOutExpo(p1P)) * -60;
  const p1TY    = (1 - easeOutExpo(p1P)) * 80;
  p1Card.style.opacity   = easeOutExpo(p1P);
  p1Card.style.transform = `scale(${p1Scale}) translate(${p1TX}px, ${p1TY}px)`;

  /* P2 — enters from bottom-right (slight delay) */
  const p2P   = Math.min(Math.max((psP - 0.15) / 0.6, 0), 1);
  const p2E   = easeOutBack(p2P);
  const p2Scale = 0.25 + p2E * 0.75;
  const p2TX    = (1 - easeOutExpo(p2P)) * 60;
  const p2TY    = (1 - easeOutExpo(p2P)) * 80;
  p2Card.style.opacity   = easeOutExpo(p2P);
  p2Card.style.transform = `scale(${p2Scale}) translate(${p2TX}px, ${p2TY}px)`;

  /* VS badge — pops in at centre when both cards are mostly in */
  const vsP   = Math.min(Math.max((psP - 0.35) / 0.35, 0), 1);
  const vsE   = easeOutBack(vsP);
  vsBadge.style.opacity   = easeOutExpo(vsP);
  vsBadge.style.transform = `scale(${0.1 + vsE * 0.9}) rotate(${(1 - vsP) * -20}deg)`;

  /* fire HP bars once cards are mostly visible */
  if (psP > 0.55 && !hpFired) {
    hpFired = true;
    hpFills.forEach(fill => { fill.style.width = '100%'; });
  }

}, { passive: true });


/* ─────────────────────────────────────────────
   ABOUT  — IntersectionObserver reveal
───────────────────────────────────────────── */
const io = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: .15 });

document.querySelectorAll('.about-inner').forEach(el => io.observe(el));


/* ─────────────────────────────────────────────
   SPRITE CLICKS
───────────────────────────────────────────── */
function pixelBurst(x, y, text, color) {
  const el = document.createElement('div');
  el.className    = 'pixel-burst';
  el.textContent  = text;
  el.style.left   = x + 'px';
  el.style.top    = y + 'px';
  el.style.color  = color;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 750);
}

function handleSpriteClick(e, url, color, words) {
  const flash = document.getElementById('click-flash');

  words.forEach((word, i) => {
    setTimeout(() => {
      const dx = (Math.random() - .5) * 140;
      const dy = (Math.random() - .5) * 100 - 40;
      pixelBurst(e.clientX + dx, e.clientY + dy, word, color);
    }, i * 80);
  });

  setTimeout(() => {
    flash.classList.add('flash');
    flash.style.background = color;
    setTimeout(() => {
      flash.classList.remove('flash');
      // window.location.href = url;   ← uncomment when player pages exist
      console.log('Navigate to:', url);
    }, 300);
  }, 200);
}

document.getElementById('sprite-p1').addEventListener('click', e => {
  handleSpriteClick(e, '/player1.html', '#f5e642', ['POW!', 'YEAH!', 'GO!']);
});

document.getElementById('sprite-p2').addEventListener('click', e => {
  handleSpriteClick(e, '/player2.html', '#2a6de8', ['EPIC!', 'BOOM!', "LET'S GO!"]);
});
