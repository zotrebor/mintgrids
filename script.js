/* ═══════════════════════════════════════════
   MINT GRIDS — script.js v3
   ═══════════════════════════════════════════ */

'use strict';

/* ─── NAV ─── */
(function () {
  const nav    = document.getElementById('nav');
  const burger = document.getElementById('burger');
  const links  = document.getElementById('nav-links');
  if (!nav || !burger || !links) return;

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  burger.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    burger.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
  });

  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      links.classList.remove('open');
      burger.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
    });
  });
})();

/* ─── HERO REVEAL (immediate) ─── */
(function () {
  requestAnimationFrame(() => {
    setTimeout(() => {
      document.querySelectorAll('.hero .reveal').forEach(el => el.classList.add('visible'));
    }, 60);
  });
})();

/* ─── SCROLL REVEAL ─── */
(function () {
  const items = document.querySelectorAll('.scroll-reveal');
  if (!items.length) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -36px 0px' });

  items.forEach(el => io.observe(el));
})();

/* ─── HERO: floating icons subtle parallax on scroll (fallback for non-scroll-timeline browsers) ─── */
(function () {
  // Only activate if CSS scroll-driven is NOT supported
  if (CSS.supports('animation-timeline', 'scroll()')) return;

  const canvas  = document.getElementById('hero-canvas');
  const content = document.getElementById('hero-content');
  if (!canvas || !content) return;

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    requestAnimationFrame(() => {
      const progress = Math.min(window.scrollY / (window.innerHeight * 0.55), 1);
      canvas.style.opacity  = String(1 - progress);
      canvas.style.transform = `scale(${1 - progress * 0.08})`;
      content.style.opacity  = String(1 - progress * (1/0.45 * progress > 1 ? 1 : progress / 0.45));
      content.style.transform = `translateY(${-progress * 24}px)`;
      ticking = false;
    });
    ticking = true;
  }, { passive: true });
})();

/* ─── GIG SLIDERS ─── */
(function () {
  document.querySelectorAll('.gig-slider').forEach(slider => {
    const track    = slider.querySelector('.gig-slider__track');
    const imgs     = slider.querySelectorAll('.gig-slider__img');
    const dotsWrap = slider.querySelector('.gig-slider__dots');
    const btnPrev  = slider.querySelector('.gig-slider__btn--prev');
    const btnNext  = slider.querySelector('.gig-slider__btn--next');
    const total    = imgs.length;

    if (!total) return;

    if (total === 1) {
      if (btnPrev) btnPrev.style.display = 'none';
      if (btnNext) btnNext.style.display = 'none';
      if (dotsWrap) dotsWrap.style.display = 'none';
      return;
    }

    let current = 0;
    let timer   = null;

    // Build dots
    imgs.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'gig-slider__dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `Slide ${i + 1}`);
      dot.addEventListener('click', () => { goTo(i); resetTimer(); });
      dotsWrap.appendChild(dot);
    });

    function goTo(i) {
      current = ((i % total) + total) % total;
      track.style.transform = `translateX(-${current * 100}%)`;
      dotsWrap.querySelectorAll('.gig-slider__dot').forEach((d, j) => {
        d.classList.toggle('active', j === current);
      });
    }

    function startTimer() {
      clearInterval(timer);
      timer = setInterval(() => goTo(current + 1), 3500);
    }
    function resetTimer() { startTimer(); }

    btnPrev && btnPrev.addEventListener('click', e => { e.stopPropagation(); goTo(current - 1); resetTimer(); });
    btnNext && btnNext.addEventListener('click', e => { e.stopPropagation(); goTo(current + 1); resetTimer(); });

    slider.addEventListener('mouseenter', () => clearInterval(timer));
    slider.addEventListener('mouseleave', startTimer);

    // Touch swipe
    let touchX = 0;
    slider.addEventListener('touchstart', e => { touchX = e.changedTouches[0].clientX; }, { passive: true });
    slider.addEventListener('touchend', e => {
      const diff = touchX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) { goTo(current + (diff > 0 ? 1 : -1)); resetTimer(); }
    });

    startTimer();
  });
})();

/* ─── REVIEWS SLIDER ─── */
(function () {
  const track   = document.getElementById('reviews-track');
  const dotsWrap= document.getElementById('rev-dots');
  const btnPrev = document.getElementById('rev-prev');
  const btnNext = document.getElementById('rev-next');
  if (!track) return;

  const cards = track.querySelectorAll('.review-card');
  const total  = cards.length;
  if (!total) return;

  let current = 0;
  let timer   = null;

  // Build dots
  cards.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'rev-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Review ${i + 1}`);
    dot.addEventListener('click', () => { goTo(i); resetTimer(); });
    dotsWrap.appendChild(dot);
  });

  function goTo(i) {
    current = ((i % total) + total) % total;
    track.style.transform = `translateX(-${current * 100}%)`;
    dotsWrap.querySelectorAll('.rev-dot').forEach((d, j) => {
      d.classList.toggle('active', j === current);
    });
  }

  function startTimer() {
    clearInterval(timer);
    timer = setInterval(() => goTo(current + 1), 5000);
  }
  function resetTimer() { startTimer(); }

  btnPrev && btnPrev.addEventListener('click', () => { goTo(current - 1); resetTimer(); });
  btnNext && btnNext.addEventListener('click', () => { goTo(current + 1); resetTimer(); });

  const sliderEl = document.getElementById('reviews-slider');
  sliderEl && sliderEl.addEventListener('mouseenter', () => clearInterval(timer));
  sliderEl && sliderEl.addEventListener('mouseleave', startTimer);

  // Touch swipe
  let touchX = 0;
  track.addEventListener('touchstart', e => { touchX = e.changedTouches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = touchX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) { goTo(current + (diff > 0 ? 1 : -1)); resetTimer(); }
  });

  startTimer();
})();

/* ─── LAZY IMAGES ─── */
(function () {
  const imgs = document.querySelectorAll('img[loading="lazy"]');
  if (!imgs.length || !('IntersectionObserver' in window)) return;

  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const img = e.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
        }
        obs.unobserve(img);
      }
    });
  }, { rootMargin: '300px' });

  imgs.forEach(img => io.observe(img));
})();

/* ─── RIGHT-CLICK PROTECTION ─── */
document.addEventListener('contextmenu', e => {
  if (e.target.tagName === 'IMG') e.preventDefault();
});
