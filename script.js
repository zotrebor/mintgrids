// Animacion del logo de MintGrids
        document.addEventListener('DOMContentLoaded', () => {
            const svgElement = document.getElementById('Layer_1');
            
            // Añade la clase 'active'. Esta clase NO EXISTE en tu CSS actual, 
            // pero si la necesitas para una transición extra, agrégala al CSS.
            // Si el logo ya se anima, puedes ignorar esta parte.
            if (svgElement) {
                svgElement.classList.add('active'); 
            }
        });
 // ====== MENÚ MÓVIL ======
  const toggleButton = document.getElementById('toggle-button');
  const navLinks = document.getElementById('menu-mobile');
  if (toggleButton && navLinks) {
    toggleButton.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });
  }
  // ====== LAZY IMAGES ======
  document.addEventListener('contextmenu', event => event.preventDefault());
  const lazyImages = document.querySelectorAll('.lazy-image');
  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        const src = img.getAttribute('data-src');
        img.src = src;
        img.classList.remove('lazy-image');
        observer.unobserve(img);
      }
    });
  });
  lazyImages.forEach(image => {
    observer.observe(image);
  });

    // CLONAR el logos-slide y añadirlo dentro de logos-track
    var track = document.querySelector(".logos-track");
	var copy = document.querySelector(".logos-slide").cloneNode(true);
	track.appendChild(copy);
