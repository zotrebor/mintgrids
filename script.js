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

const projectsData = {
  "1": { title: "Aquaam Project I", desc: "A comprehensive case study showcasing responsive interface layouts." },
  "2": { title: "Aquaam Project II", desc: "Exploring the balance between aesthetic minimalism and high-performance." },
  "3": { title: "Aquaam Project III", desc: "Custom vector assets, tailored user flows, and brand identity." },
  "4": { title: "Aquaam Project IV", desc: "Optimized multi-column interactive grids and fluid layouts." }
};

document.addEventListener("DOMContentLoaded", () => {
  const slider = document.getElementById("portfolioSlider");
  const cards = document.querySelectorAll(".slide-card");
  const modal = document.getElementById("projectModal");
  const closeModal = document.getElementById("closeModal");
  
  const prevBtn = document.querySelector(".prev-btn");
  const nextBtn = document.querySelector(".next-btn");

  let animationFrameId;
  let scrollSpeed = 1; // Velocidad del deslizamiento (1 pixel por cuadro). Súbelo a 1.5 si lo quieres más rápido.
  let direction = 1;   // 1 = Derecha, -1 = Izquierda
  let isPaused = false;

  // --- DETECCIÓN DE CARD CENTRAL ---
  const observerOptions = {
    root: slider,
    rootMargin: "0px -45% 0px -45%", // Margen estricto para detectar el centro real
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        cards.forEach(c => c.classList.remove("is-active"));
        entry.target.classList.add("is-active");
      }
    });
  }, observerOptions);

  cards.forEach(card => observer.observe(card));

  // --- BUCLE DE ANIMACIÓN CONTINUA (Sin Saltos) ---
  function updateScroll() {
    if (!isPaused) {
      const maxScroll = slider.scrollWidth - slider.clientWidth;

      // Detectar extremos para cambiar de trayectoria de forma fluida
      if (slider.scrollLeft >= maxScroll - 2 && direction === 1) {
        direction = -1;
      } else if (slider.scrollLeft <= 2 && direction === -1) {
        direction = 1;
      }

      // Avanza pixel a pixel de forma milimétrica
      slider.scrollLeft += scrollSpeed * direction;
    }
    // Ejecuta en el próximo refresco de pantalla (60fps/120fps)
    animationFrameId = requestAnimationFrame(updateScroll);
  }

  function startAutoPlay() {
    if (!animationFrameId) {
      animationFrameId = requestAnimationFrame(updateScroll);
    }
  }

  function stopAutoPlay() {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }

  // --- CONTROLES DE PAUSA (Hover y Touch) ---
  slider.addEventListener("mouseenter", () => isPaused = true);
  slider.addEventListener("mouseleave", () => isPaused = false);
  
  slider.addEventListener("touchstart", () => isPaused = true, {passive: true});
  slider.addEventListener("touchend", () => {
    // Al soltar el dedo en móvil, espera 1.5s antes de reanudar el auto-desplazamiento
    setTimeout(() => { isPaused = false; }, 1500);
  });

  // --- FLECHAS DE NAVEGACIÓN ---
  nextBtn.addEventListener("click", () => {
    direction = 1;
    slider.scrollBy({ left: 300, behavior: "smooth" });
  });

  prevBtn.addEventListener("click", () => {
    direction = -1;
    slider.scrollBy({ left: -300, behavior: "smooth" });
  });

  // --- APERTURA DEL MODAL ---
  cards.forEach(card => {
    card.addEventListener("click", () => {
      if (!card.classList.contains("is-active")) {
        card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        return;
      }

      const projectId = card.getAttribute("data-project");
      const data = projectsData[projectId];

      document.getElementById("modalHero").src = `images/portfolio/aquaam-cover.webp`;
      document.getElementById("modalTitle").innerText = data.title;
      document.getElementById("modalDesc").innerText = data.desc;
      
      document.getElementById("modalImg01").src = `images/portfolio/aquaam-01.webp`;
      document.getElementById("modalImg02").src = `images/portfolio/aquaam-02.webp`;
      document.getElementById("modalImg03").src = `images/portfolio/aquaam-03.webp`;
      document.getElementById("modalImg04").src = `images/portfolio/aquaam-04.webp`;
      document.getElementById("modalImg05").src = `images/portfolio/aquaam-05.webp`;

      stopAutoPlay();
      modal.showModal();
    });
  });

  closeModal.addEventListener("click", () => {
    modal.close();
    startAutoPlay();
  });

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.close();
      startAutoPlay();
    }
  });

  // Arrancar el slider continuo
  startAutoPlay();
});