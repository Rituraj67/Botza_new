/* ============================================================
   BOTZA — main.js
   Production-grade interactions & animations
   ============================================================ */

'use strict';

/* ---------- Scroll Fade-Up Observer (Staggered) ---------- */
const fadeEls = document.querySelectorAll('.fade-up');
const fadeObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        fadeObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
);
fadeEls.forEach((el) => fadeObserver.observe(el));

/* ---------- Staggered Grid Cards ---------- */
function staggerCards(gridSelector) {
  const grids = document.querySelectorAll(gridSelector);
  grids.forEach((grid) => {
    const cards = grid.children;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            Array.from(cards).forEach((card, i) => {
              const delay = Math.min(i, 3) * 80;
              setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
              }, delay);
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    // Set initial state
    Array.from(cards).forEach((card) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(24px)';
      card.style.transition = 'opacity 400ms ease, transform 400ms cubic-bezier(0.16, 1, 0.3, 1)';
    });
    observer.observe(grid);
  });
}

staggerCards('.benefits-grid');
staggerCards('.hiw-grid');
staggerCards('.stats-grid');

/* ---------- Navbar scroll state ---------- */
const navbar = document.getElementById('navbar');
let lastScroll = 0;
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  if (y > 20) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
  lastScroll = y;
}, { passive: true });

/* ---------- Active nav link on scroll ---------- */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach((link) => {
          const href = link.getAttribute('href');
          if (href && href.includes(id)) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  },
  { threshold: 0.3 }
);
sections.forEach((s) => sectionObserver.observe(s));

/* ---------- Hamburger menu toggle ---------- */
const hamburger = document.getElementById('hamburger');
const navLinksEl = document.getElementById('nav-links');

if (hamburger && navLinksEl) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navLinksEl.classList.toggle('open');
    document.body.style.overflow = navLinksEl.classList.contains('open') ? 'hidden' : '';
  });

  // Close mobile menu when a link is clicked
  navLinksEl.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navLinksEl.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

/* ---------- Use Cases Tab Logic ---------- */
const ucTabs = document.querySelectorAll('.uc-tab');
const ucPanels = document.querySelectorAll('.uc-content');

ucTabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    const target = tab.getAttribute('data-uc');

    ucTabs.forEach((t) => t.classList.remove('active'));
    ucPanels.forEach((p) => p.classList.remove('active'));

    tab.classList.add('active');
    const panel = document.getElementById('uc-' + target);
    if (panel) {
      panel.classList.add('active');
      panel.style.opacity = '0';
      panel.style.transform = 'translateY(8px)';
      requestAnimationFrame(() => {
        panel.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
        panel.style.opacity = '1';
        panel.style.transform = 'translateY(0)';
      });
    }
  });
});

/* ---------- Newsletter / CTA form ---------- */
function handleNewsletterSubmit(e) {
  e.preventDefault();
  const emailInput = document.getElementById('newsletter-email');
  const statusEl = document.getElementById('form-status');
  const submitBtn = e.target.querySelector('button[type="submit"]') || e.target.querySelector('.btn-primary');
  const email = emailInput.value.trim();

  if (!email) return;

  // Button state
  if (submitBtn) {
    const origText = submitBtn.textContent;
    submitBtn.textContent = 'SENDING...';
    setTimeout(() => {
      submitBtn.textContent = '✓ SUBMITTED';
      submitBtn.style.color = 'var(--lime)';
      statusEl.textContent = 'WE\'LL BE IN TOUCH.';
      statusEl.style.color = 'var(--lime)';
      emailInput.value = '';
      setTimeout(() => {
        submitBtn.textContent = origText;
        submitBtn.style.color = '';
        statusEl.textContent = '';
      }, 3000);
    }, 1000);
  }
}

/* ---------- Stat counter animation (easeOutQuart) ---------- */
function easeOutQuart(t) {
  return 1 - Math.pow(1 - t, 4);
}

function animateCounter(el, end, suffix, duration) {
  const start = performance.now();

  const update = (now) => {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = easeOutQuart(progress);
    const current = Math.floor(eased * end);

    el.textContent = current + (progress >= 1 ? suffix : '');

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  };
  requestAnimationFrame(update);
}

const statCards = document.querySelectorAll('.stat-card');
const statObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const numEl = el.querySelector('.stat-num');
        if (!numEl || el.dataset.animated) return;
        el.dataset.animated = 'true';

        const id = el.id;
        if (id === 'stat-1') animateCounter(numEl, 88, '%', 1200);
        if (id === 'stat-2') animateCounter(numEl, 120, '+', 1400);
        if (id === 'stat-3') animateCounter(numEl, 68, '%', 1200);
        if (id === 'stat-4') animateCounter(numEl, 5, '+', 800);

        statObserver.unobserve(el);
      }
    });
  },
  { threshold: 0.4 }
);
statCards.forEach((card) => statObserver.observe(card));

/* ---------- Process bar step cycling ---------- */
const processSteps = document.querySelectorAll('.process-step');
if (processSteps.length > 0) {
  let activeStep = 2;

  setInterval(() => {
    processSteps[activeStep].classList.remove('active');
    const icon = processSteps[activeStep].querySelector('.process-active-icon');
    if (icon) icon.remove();

    activeStep = (activeStep + 1) % processSteps.length;
    processSteps[activeStep].classList.add('active');

    const newIcon = document.createElement('span');
    newIcon.className = 'process-active-icon';
    newIcon.textContent = '↻';
    processSteps[activeStep].appendChild(newIcon);
  }, 3200);
}

/* ---------- CTA button hover glow ---------- */
document.querySelectorAll('.btn-primary').forEach((btn) => {
  btn.addEventListener('mouseenter', () => {
    btn.style.boxShadow = '0 0 0 1px rgba(200,240,0,0.35)';
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.boxShadow = '';
  });
});

/* ---------- Reveal hero on load ---------- */
window.addEventListener('load', () => {
  const heroContent = document.querySelector('.hero-content');
  if (heroContent) {
    heroContent.classList.add('visible');
  }
});

/* ---------- Industry Tile — Mobile Tap Toggle ---------- */
document.querySelectorAll('.silo-toggle').forEach((btn) => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const silo = btn.closest('.logo-silo');
    const wasOpen = silo.classList.contains('expanded');

    document.querySelectorAll('.logo-silo.expanded').forEach((s) => {
      s.classList.remove('expanded');
    });

    if (!wasOpen) {
      silo.classList.add('expanded');
    }
  });
});
