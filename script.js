/* =============================================
   MINT GRIDS — script.js v2
   ============================================= */

// --- NAV: scroll state + burger menu ---
(function () {
  const nav     = document.getElementById('nav');
  const burger  = document.getElementById('burger');
  const links   = document.getElementById('nav-links');

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  burger.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    burger.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open);
  });

  // Cerrar menú al hacer click en un enlace
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
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  items.forEach(el => observer.observe(el));
})();

// --- HERO REVEAL (sin esperar scroll) ---
(function () {
  const reveals = document.querySelectorAll('.hero .reveal');
  // Pequeño delay para que el CSS de transición tenga tiempo de registrarse
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

// --- MARQUEE: clonar slide para loop continuo ---
(function () {
  const track = document.querySelector('.marquee-track');
  if (!track) return;
  const slide = track.querySelector('.marquee-slide');
  if (!slide) return;
  const clone = slide.cloneNode(true);
  track.appendChild(clone);
})();

// --- PROTECCIÓN CLIC DERECHO EN IMÁGENES ---
document.addEventListener('contextmenu', e => {
  if (e.target.tagName === 'IMG') e.preventDefault();
});
