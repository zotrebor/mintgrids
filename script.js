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



// --- PORTAFOLIO V.3 ---

/* ═══════════════════════════════════════════
   MINT GRIDS — portfolio.js (Optimizado con Lazy Loading)
   ═══════════════════════════════════════════ */

'use strict';

(function () {
  const modal      = document.getElementById('pf-modal');
  const modalClose = document.getElementById('pf-modal-close');
  const images     = document.querySelectorAll('.carrusel-elementos img');

  if (!modal || !images.length) return;

  /* ─── OPEN ─── */
  function openModal(img) {
    const coverEl = document.getElementById('pf-modal-cover');
    
    // La imagen de portada sí debe cargarse de inmediato (eager) porque es lo primero que se ve al abrir
    coverEl.src  = img.dataset.cover || '';
    coverEl.alt  = img.dataset.title || '';
    coverEl.loading = 'eager'; 
    
    document.getElementById('pf-modal-title').textContent = img.dataset.title || '';
    document.getElementById('pf-modal-desc').textContent  = img.dataset.desc  || '';

    // Helper: muestra u oculta un slot según si tiene imagen y le inyecta LAZY LOADING nativo
    function setSlot(id, src) {
      const el = document.getElementById(id);
      if (!el) return;
      const wrap = el.closest('.pf-modal__sq-wrap');
      if (src) {
        el.loading = 'lazy'; // <-- BLINDAJE: Fuerza al navegador a no descargar la imagen hasta hacer scroll en el modal
        el.src = src;
        wrap.style.display = '';
      } else {
        el.src = '';
        wrap.style.display = 'none';
      }
    }

    setSlot('pf-modal-sm1', img.dataset.sm1);
    setSlot('pf-modal-sm2', img.dataset.sm2);
    setSlot('pf-modal-sm3', img.dataset.sm3);
    setSlot('pf-modal-sq1', img.dataset.sq1);
    setSlot('pf-modal-sq2', img.dataset.sq2);

    // Oculta secciones completas si todos sus slots están vacíos
    const trio = document.querySelector('.pf-modal__trio');
    const pair = document.querySelector('.pf-modal__pair');

    const trioVisible = [img.dataset.sm1, img.dataset.sm2, img.dataset.sm3].some(Boolean);
    const pairVisible = [img.dataset.sq1, img.dataset.sq2].some(Boolean);

    if (trio) trio.style.display = trioVisible ? '' : 'none';
    if (pair) pair.style.display = pairVisible ? '' : 'none';

    modal.showModal();
    document.body.style.overflow = 'hidden';
    setTimeout(() => modalClose.focus(), 50);
  }

  /* ─── CLOSE ─── */
  function closeModal() {
    modal.close();
    document.body.style.overflow = '';
    
    // Limpieza opcional: vacía los src al cerrar para liberar memoria del navegador inmediatamente
    const modalImgs = modal.querySelectorAll('.pf-modal__inner img');
    modalImgs.forEach(img => img.src = '');
  }

  /* ─── BIND IMAGES ─── */
  images.forEach(img => {
    img.addEventListener('click', () => openModal(img));

    // Keyboard: Enter or Space on focused image
    img.setAttribute('tabindex', '0');
    img.setAttribute('role', 'button');
    img.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openModal(img);
      }
    });
  });

  /* ─── CLOSE TRIGGERS ─── */
  modalClose.addEventListener('click', closeModal);

  // Click outside the panel
  modal.addEventListener('click', e => {
    if (!modal.querySelector('.pf-modal__inner').contains(e.target)) closeModal();
  });

  // ESC (native <dialog> fires 'cancel')
  modal.addEventListener('cancel', () => {
    document.body.style.overflow = '';
  });

})();

// --- HERO TITLE TYPEWRITER ---
(function () {
  const title = document.querySelector('.hero__title');
  if (!title) return;

  const nodes = Array.from(title.childNodes);
  title.innerHTML = '';

  let totalDelay = 0;
  const speed = 50;

  nodes.forEach(node => {
    if (node.nodeType === Node.TEXT_NODE) {
      node.textContent.split('').forEach(char => {
        const span = document.createElement('span');
        span.textContent = char === ' ' ? '\u00A0' : char;
        span.style.cssText = `
          opacity: 0;
          animation: letterIn 0.3s ease forwards;
          animation-delay: ${totalDelay}ms;
          display: inline-block;
        `;
        title.appendChild(span);
        totalDelay += speed;
      });
    } else if (node.nodeName === 'BR') {
      title.appendChild(document.createElement('br'));
    } else if (node.nodeName === 'EM') {
      const em = document.createElement('em');
      node.textContent.split('').forEach(char => {
        const span = document.createElement('span');
        span.textContent = char === ' ' ? '\u00A0' : char;
        span.style.cssText = `
          opacity: 0;
          animation: letterIn 0.3s ease forwards;
          animation-delay: ${totalDelay}ms;
          display: inline-block;
        `;
        em.appendChild(span);
        totalDelay += speed;
      });
      title.appendChild(em);
    }
  });
})();