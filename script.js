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

// --- PORTAFOLIO INTELIGENTE MULTI-SLIDER & DIALOG ---
(function () {
  const modal      = document.getElementById('pf-modal');
  const modalClose = document.getElementById('pf-modal-close');
  const sliders    = document.querySelectorAll('.carrusel-contenedor');

  if (!modal || !sliders.length) return;

  // Configuración global de velocidad de los sliders
  const scrollSpeed = 0.8; // Pixeles por frame (Ajusta si deseas más rápido o lento)

  sliders.forEach(slider => {
    const track = slider.querySelector('.carrusel-elementos');
    const images = track.querySelectorAll('img');
    
    let animationFrameId = null;
    let direction = 1; // 1 = Derecha, -1 = Izquierda
    let isPaused = false;

    // ─── 1. DETECCIÓN DE ELEMENTO CENTRAL (Intersection Observer) ───
    const observerOptions = {
      root: slider,
      rootMargin: "0px -45% 0px -45%", // Rango estricto en el centro matemático
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          images.forEach(img => img.classList.remove('is-active'));
          entry.target.classList.add('is-active');
        }
      });
    }, observerOptions);

    images.forEach(img => observer.observe(img));

    // ─── 2. MOTOR DE ANIMACIÓN LINEAL (CONTINUO) ───
    function playTicker() {
      if (!isPaused) {
        const maxScroll = slider.scrollWidth - slider.clientWidth;

        // Control de límites para rebote de trayectoria
        if (slider.scrollLeft >= maxScroll - 2 && direction === 1) {
          direction = -1;
        } else if (slider.scrollLeft <= 2 && direction === -1) {
          direction = 1;
        }

        slider.scrollLeft += scrollSpeed * direction;
      }
      animationFrameId = requestAnimationFrame(playTicker);
    }

    function startTimeline() {
      if (!animationFrameId) animationFrameId = requestAnimationFrame(playTicker);
    }

    function stopTimeline() {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }

    // Interacciones de pausa: Mouse en Desktop / Touch en Móviles
    slider.addEventListener('mouseenter', () => isPaused = true);
    slider.addEventListener('mouseleave', () => isPaused = false);
    slider.addEventListener('touchstart', () => isPaused = true, { passive: true });
    slider.addEventListener('touchend', () => {
      setTimeout(() => { isPaused = false; }, 1200); // Reanudación orgánica
    });

    // ─── 3. CONTROL DE CLICS (DESPLAZAR O ABRIR MODAL) ───
    images.forEach(img => {
      img.setAttribute('tabindex', '0');
      img.setAttribute('role', 'button');

      function handleAction() {
        // Regla de Oro: Si no está en el centro, la centra en lugar de abrir el modal
        if (!img.classList.contains('is-active')) {
          img.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
          return;
        }
        openProject(img);
      }

      img.addEventListener('click', handleAction);
      img.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleAction();
        }
      });
    });

    // Arrancar el ciclo de este slider
    startTimeline();

    // Guardar los disparadores de control en el elemento para usarlos al cerrar el modal
    slider.dataset.start = startTimeline;
    slider.dataset.stop = stopTimeline;
  });

  // ─── 4. APERTURA DINÁMICA DEL MODAL ───
  function openProject(img) {
    // Detener la marcha de todos los sliders activos de la página
    sliders.forEach(s => { if(s.dataset.stop) s.dataset.stop(); });

    // Inyección de Data Attributes nativos al Dialog
    document.getElementById('pf-modal-cover').src  = img.dataset.cover || '';
    document.getElementById('pf-modal-cover').alt  = img.dataset.title || '';
    document.getElementById('pf-modal-title').textContent = img.dataset.title || '';
    document.getElementById('pf-modal-desc').textContent  = img.dataset.desc  || '';
    document.getElementById('pf-modal-sm1').src = img.dataset.sm1 || '';
    document.getElementById('pf-modal-sm2').src = img.dataset.sm2 || '';
    document.getElementById('pf-modal-sm3').src = img.dataset.sm3 || '';
    document.getElementById('pf-modal-sq1').src = img.dataset.sq1 || '';
    document.getElementById('pf-modal-sq2').src = img.dataset.sq2 || '';

    modal.showModal();
    document.body.style.overflow = 'hidden';
    setTimeout(() => modalClose.focus(), 50);
  }

  // ─── 5. CIERRE DEL MODAL Y REANUDACIÓN ───
  function shutModal() {
    modal.close();
    document.body.style.overflow = '';
    // Despertar sliders de nuevo
    sliders.forEach(s => { if(s.dataset.start) s.dataset.start(); });
  }

  modalClose.addEventListener('click', shutModal);

  modal.addEventListener('click', e => {
    if (!modal.querySelector('.pf-modal__inner').contains(e.target)) shutModal();
  });

  modal.addEventListener('cancel', () => {
    document.body.style.overflow = '';
    sliders.forEach(s => { if(s.dataset.start) s.dataset.start(); });
  });

})();
