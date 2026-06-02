/* =============================================
   MINT GRIDS — script.js v3
   ============================================= */

// --- NAV: scroll state + burger menu ---
(function () {
  const nav    = document.getElementById('nav');
  const burger = document.getElementById('burger');
  const links  = document.getElementById('nav-links');

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  burger.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    burger.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open);
  });

  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      links.classList.remove('open');
      burger.classList.remove('open');
      burger.setAttribute('aria-expanded', false);
    });
  });
})();

// --- SCROLL REVEAL ---
(function () {
  const items = document.querySelectorAll('.scroll-reveal');
  if (!items.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  items.forEach(el => observer.observe(el));
})();

// --- HERO REVEAL ---
(function () {
  const reveals = document.querySelectorAll('.hero .reveal');
  requestAnimationFrame(() => {
    setTimeout(() => {
      reveals.forEach(el => el.classList.add('visible'));
    }, 80);
  });
})();

// --- LAZY IMAGES ---
(function () {
  const images = document.querySelectorAll('.lazy-image[data-src]');
  if (!images.length) return;

  const imgObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        img.classList.remove('lazy-image');
        obs.unobserve(img);
      }
    });
  }, { rootMargin: '200px' });

  images.forEach(img => imgObserver.observe(img));
})();

// --- GIG SLIDERS ---
(function () {
  document.querySelectorAll('.gig-slider').forEach(slider => {
    const track  = slider.querySelector('.gig-slider__track');
    const imgs   = slider.querySelectorAll('.gig-slider__img');
    const dotsWrap = slider.querySelector('.gig-slider__dots');
    const btnPrev  = slider.querySelector('.gig-slider__btn--prev');
    const btnNext  = slider.querySelector('.gig-slider__btn--next');
    const total    = imgs.length;

    if (!total) return;

    // SI SOLO HAY 1 IMAGEN: Oculta controles y cancela el slider automático
    if (total === 1) {
      if (btnPrev) btnPrev.style.display = 'none';
      if (btnNext) btnNext.style.display = 'none';
      if (dotsWrap) dotsWrap.style.display = 'none';
      return; // Detiene la ejecución para este slider específico
    }

    // Estas variables se declaran una sola vez aquí
    let current   = 0;
    let autoTimer = null;

    // Build dots
    imgs.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'gig-slider__dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `Slide ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
    });

    function goTo(index) {
      current = (index + total) % total;
      track.style.transform = `translateX(-${current * 100}%)`;
      dotsWrap.querySelectorAll('.gig-slider__dot').forEach((d, i) => {
        d.classList.toggle('active', i === current);
      });
    }

    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }

    btnNext.addEventListener('click', (e) => { e.stopPropagation(); next(); resetAuto(); });
    btnPrev.addEventListener('click', (e) => { e.stopPropagation(); prev(); resetAuto(); });

    // Auto-advance every 3.5s
    function startAuto() {
      autoTimer = setInterval(next, 3500);
    }
    function resetAuto() {
      clearInterval(autoTimer);
      startAuto();
    }

    // Pause on hover
    slider.addEventListener('mouseenter', () => clearInterval(autoTimer));
    slider.addEventListener('mouseleave', startAuto);

    // Touch/swipe support
    let touchStartX = 0;
    slider.addEventListener('touchstart', e => {
      touchStartX = e.changedTouches[0].clientX;
    }, { passive: true });
    slider.addEventListener('touchend', e => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) {
        diff > 0 ? next() : prev();
        resetAuto();
      }
    });

    startAuto();
  });
})();

// --- RIGHT CLICK PROTECTION ON IMAGES ---
document.addEventListener('contextmenu', e => {
  if (e.target.tagName === 'IMG') e.preventDefault();
});