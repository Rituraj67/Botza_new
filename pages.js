/* ============================================================
   BOTZA — pages.js
   Shared JS for Product & About pages
   ============================================================ */

'use strict';

/* ---------- Scroll Fade-Up Observer ---------- */
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
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
);
fadeEls.forEach((el) => fadeObserver.observe(el));

/* ---------- Navbar scroll ---------- */
const navbar = document.getElementById('navbar');
if (navbar) {
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 20);
    }, { passive: true });
}

/* ---------- Hamburger ---------- */
const hamburger = document.getElementById('hamburger');
const navLinksEl = document.getElementById('nav-links');
if (hamburger && navLinksEl) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('open');
        navLinksEl.classList.toggle('open');
        document.body.style.overflow = navLinksEl.classList.contains('open') ? 'hidden' : '';
    });
    navLinksEl.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('open');
            navLinksEl.classList.remove('open');
            document.body.style.overflow = '';
        });
    });
}

/* ============================================================
   PRODUCT PAGE — Module Reveal Animation
   ============================================================ */
const moduleGrid = document.getElementById('module-grid');
if (moduleGrid) {
    const tiles = moduleGrid.querySelectorAll('.module-tile');
    const dirMap = { left: [-40, 0], right: [40, 0], top: [0, -40], bottom: [0, 40] };

    tiles.forEach((tile) => {
        const dir = tile.dataset.dir || 'left';
        const [dx, dy] = dirMap[dir] || [0, 0];
        tile.style.transform = `translate(${dx}px, ${dy}px)`;
    });

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                tiles.forEach((tile, i) => {
                    setTimeout(() => {
                        tile.classList.add('revealed');
                    }, i * 150);
                });
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    revealObserver.observe(moduleGrid);
}

/* ============================================================
   ABOUT PAGE — Terminal Type-on Animation
   ============================================================ */
const terminalBody = document.getElementById('terminal-body');
if (terminalBody) {
    const lines = [
        '> MISSION: Make enterprise knowledge trustworthy and accessible',
        '> APPROACH: Domain-specific AI + compliance-first architecture',
        '> PRODUCT: BOTZA — modular, governed, intelligent',
        '> STATUS: ACTIVE — deployed across 120+ enterprises'
    ];

    let currentCycle = 0;

    function typeTerminal() {
        terminalBody.innerHTML = '';

        lines.forEach((line, i) => {
            const div = document.createElement('div');
            div.className = 'term-line';
            div.textContent = line;
            terminalBody.appendChild(div);

            setTimeout(() => {
                div.classList.add('visible');
                // Add cursor to last line
                if (i === lines.length - 1) {
                    const cursor = document.createElement('span');
                    cursor.className = 'term-cursor';
                    div.appendChild(cursor);
                }
            }, i * 600);
        });

        // Loop after 8 seconds
        setTimeout(() => {
            // Fade out
            const allLines = terminalBody.querySelectorAll('.term-line');
            allLines.forEach((l) => l.classList.remove('visible'));
            setTimeout(typeTerminal, 600);
        }, 8000);
    }

    // Start on load
    window.addEventListener('load', () => {
        setTimeout(typeTerminal, 500);
    });
}

/* ---------- CTA button hover effects (same as main) ---------- */
document.querySelectorAll('.btn-primary').forEach((btn) => {
    btn.addEventListener('mouseenter', () => {
        btn.style.boxShadow = '0 0 0 1px rgba(200,240,0,0.35)';
    });
    btn.addEventListener('mouseleave', () => {
        btn.style.boxShadow = '';
    });
});
