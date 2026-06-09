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
      return; 
    }

    let current   = 0;
    let autoTimer = null;

    // Build dots
    imgs.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'gig-slider__dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `Slide ${i + 1}`);
      dot.addEventListener('click', () => { goTo(i); resetAuto(); });
      dotsWrap.appendChild(dot);
    });

    function goTo(index) {
      current = (index + total) % total;
      track.style.transform = `translateX(-${current * 100}%)`;
      if (dotsWrap) {
        dotsWrap.querySelectorAll('.gig-slider__dot').forEach((d, i) => {
          d.classList.toggle('active', i === current);
        });
      }
    }

    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }

    // Control de clics con reseteo seguro de temporizador
    if (btnNext) {
      btnNext.addEventListener('click', (e) => { 
        e.stopPropagation(); 
        next(); 
        resetAuto(); 
      });
    }
    if (btnPrev) {
      btnPrev.addEventListener('click', (e) => { 
        e.stopPropagation(); 
        prev(); 
        resetAuto(); 
      });
    }

    // Auto-advance con limpieza absoluta de hilos previos
    function startAuto() {
      if (autoTimer) clearInterval(autoTimer); // Nos aseguramos de que no haya duplicados antes de crear uno nuevo
      autoTimer = setInterval(next, 3500);
    }

    function stopAuto() {
      if (autoTimer) {
        clearInterval(autoTimer);
        autoTimer = null;
      }
    }

    function resetAuto() {
      stopAuto();
      startAuto();
    }

    // Pausa garantizada al entrar al contenedor del slider
    slider.addEventListener('mouseenter', stopAuto);
    slider.addEventListener('mouseleave', startAuto);

    // Soporte táctil móvil
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

    // Arranque inicial
    startAuto();
  });
})();

// --- RIGHT CLICK PROTECTION ON IMAGES ---
document.addEventListener('contextmenu', e => {
  if (e.target.tagName === 'IMG') e.preventDefault();
});



// --- PORTAFOLIO V.2 ---

/* ═══════════════════════════════════════════
   MINT GRIDS — portfolio.js
   Focus-center slider + project modal
   ═══════════════════════════════════════════ */

'use strict';

(function () {

  /* ─── ELEMENTS ─── */
  const slider   = document.getElementById('pf-slider');
  const dotsWrap = document.getElementById('pf-dots');
  const btnPrev  = document.getElementById('pf-prev');
  const btnNext  = document.getElementById('pf-next');
  const modal    = document.getElementById('pf-modal');
  const modalClose = document.getElementById('pf-modal-close');

  if (!slider || !modal) return;

  const cards = Array.from(slider.querySelectorAll('.pf__card'));
  const total  = cards.length;
  if (!total) return;

  let current   = 0;
  let isScrolling = false;

  /* ─── BUILD DOTS ─── */
  cards.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className   = 'pf__dot' + (i === 0 ? ' is-active' : '');
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', `Project ${i + 1}`);
    dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
    dot.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(dot);
  });

  function getDots() { return Array.from(dotsWrap.querySelectorAll('.pf__dot')); }

  /* ─── ACTIVATE CARD ─── */
  function activate(index) {
    cards.forEach((c, i) => {
      c.classList.toggle('is-active', i === index);
      c.setAttribute('aria-selected', i === index ? 'true' : 'false');
    });
    getDots().forEach((d, i) => {
      d.classList.toggle('is-active', i === index);
      d.setAttribute('aria-selected', i === index ? 'true' : 'false');
    });
    current = index;
  }

  /* ─── SCROLL TO CARD ─── */
  function goTo(index) {
    const clamped = Math.max(0, Math.min(index, total - 1));
    const card    = cards[clamped];
    const sliderCenter = slider.offsetWidth / 2;
    const cardCenter   = card.offsetLeft + card.offsetWidth / 2;

    slider.scrollTo({
      left: cardCenter - sliderCenter,
      behavior: 'smooth'
    });

    activate(clamped);
  }

  /* ─── DETECT CENTER ON SCROLL ─── */
  function findCenter() {
    const sliderRect   = slider.getBoundingClientRect();
    const sliderCenter = sliderRect.left + sliderRect.width / 2;
    let closest = 0;
    let minDist = Infinity;

    cards.forEach((card, i) => {
      const rect   = card.getBoundingClientRect();
      const center = rect.left + rect.width / 2;
      const dist   = Math.abs(center - sliderCenter);
      if (dist < minDist) { minDist = dist; closest = i; }
    });

    if (closest !== current) activate(closest);
  }

  let scrollTimer = null;
  slider.addEventListener('scroll', () => {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(findCenter, 60);
  }, { passive: true });

  /* ─── ARROW BUTTONS ─── */
  btnPrev && btnPrev.addEventListener('click', () => goTo(current - 1));
  btnNext && btnNext.addEventListener('click', () => goTo(current + 1));

  /* ─── KEYBOARD ─── */
  slider.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft')  { e.preventDefault(); goTo(current - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); goTo(current + 1); }
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openModal(cards[current]);
    }
  });

  /* ─── MOUSE DRAG (desktop) ─── */
  let dragStartX  = 0;
  let dragScrollL = 0;
  let isDragging  = false;

  slider.addEventListener('mousedown', e => {
    isDragging  = true;
    dragStartX  = e.pageX - slider.offsetLeft;
    dragScrollL = slider.scrollLeft;
    slider.classList.add('is-dragging');
  });
  window.addEventListener('mouseup', () => {
    if (!isDragging) return;
    isDragging = false;
    slider.classList.remove('is-dragging');
    findCenter();
  });
  slider.addEventListener('mousemove', e => {
    if (!isDragging) return;
    e.preventDefault();
    const x    = e.pageX - slider.offsetLeft;
    const walk = (x - dragStartX) * 1.2;
    slider.scrollLeft = dragScrollL - walk;
  });
  // Prevent accidental click after drag
  slider.addEventListener('click', e => {
    if (Math.abs(slider.scrollLeft - dragScrollL) > 4) e.stopPropagation();
  }, true);

  /* ─── TOUCH SWIPE (snap handles it, but we help with snap-to-center) ─── */
  let touchStartX = 0;
  slider.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });
  slider.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 30) {
      goTo(current + (diff > 0 ? 1 : -1));
    }
  });

  /* ─── OPEN MODAL ─── */
  function openModal(card) {
    // Populate fields from data attributes
    document.getElementById('pf-modal-cover').src = card.dataset.cover || '';
    document.getElementById('pf-modal-cover').alt = card.dataset.title || '';
    document.getElementById('pf-modal-title').textContent = card.dataset.title || '';
    document.getElementById('pf-modal-desc').textContent  = card.dataset.desc  || '';
    document.getElementById('pf-modal-sm1').src  = card.dataset.sm1 || '';
    document.getElementById('pf-modal-sm2').src  = card.dataset.sm2 || '';
    document.getElementById('pf-modal-sm3').src  = card.dataset.sm3 || '';
    document.getElementById('pf-modal-sq1').src  = card.dataset.sq1 || '';
    document.getElementById('pf-modal-sq2').src  = card.dataset.sq2 || '';

    modal.showModal();
    document.body.style.overflow = 'hidden';

    // Focus close button
    setTimeout(() => modalClose.focus(), 50);
  }

  function closeModal() {
    modal.close();
    document.body.style.overflow = '';
    // Return focus to the card that opened it
    cards[current] && cards[current].focus();
  }

  /* ─── CARD CLICK → only if it IS the active card ─── */
  cards.forEach((card, i) => {
    card.setAttribute('tabindex', '0');
    card.addEventListener('click', () => {
      if (i === current) {
        openModal(card);
      } else {
        goTo(i);
      }
    });
  });

  /* ─── CLOSE MODAL ─── */
  modalClose.addEventListener('click', closeModal);

  // Click outside the inner panel
  modal.addEventListener('click', e => {
    const inner = modal.querySelector('.pf-modal__inner');
    if (!inner.contains(e.target)) closeModal();
  });

  // ESC key (native <dialog> handles it, but we clean up body overflow)
  modal.addEventListener('cancel', () => {
    document.body.style.overflow = '';
  });

  /* ─── INIT: activate first card ─── */
  // Wait one frame so layout is complete before scrolling
  requestAnimationFrame(() => {
    goTo(0);
  });

})();