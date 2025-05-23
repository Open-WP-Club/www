    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });

    // Add active state to navigation links
    window.addEventListener('scroll', () => {
      const sections = document.querySelectorAll('section[id]');
      const navLinks = document.querySelectorAll('nav a[href^="#"]');

      let current = '';
      sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        if (scrollY >= sectionTop) {
          current = section.getAttribute('id');
        }
      });

      navLinks.forEach(link => {
        link.classList.remove('text-blue-600');
        if (link.getAttribute('href') === `#${current}`) {
          link.classList.add('text-blue-600');
        }
      });
    });

    // Mobile menu toggle (if needed later)
    function toggleMobileMenu() {
      const mobileMenu = document.getElementById('mobile-menu');
      mobileMenu.classList.toggle('hidden');
    }