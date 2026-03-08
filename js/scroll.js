/* =====================================================
   KANDYAN GEM & JEWELLERS — Scroll Engine
   ===================================================== */

const ScrollEngine = {
    init() {
        this.initParallax();
        this.initReveal();
        this.initNavScroll();
        this.initHorizontalDrag();
        this.initParticles();
    },

    /* ── Parallax Hero ── */
    initParallax() {
        const layers = document.querySelectorAll('.parallax-hero .layer[data-speed]');
        if (!layers.length) return;

        const onScroll = () => {
            const scrollY = window.scrollY;
            layers.forEach(layer => {
                const speed = parseFloat(layer.dataset.speed) || 0.5;
                layer.style.transform = `translateY(${scrollY * speed}px)`;
            });
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    },

    /* ── Reveal on Scroll ── */
    initReveal() {
        const targets = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale, .stagger');
        if (!targets.length) return;

        const obs = new IntersectionObserver((entries) => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    e.target.classList.add('visible');
                    obs.unobserve(e.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

        targets.forEach(t => obs.observe(t));
    },

    /* ── Navbar Scroll State ── */
    initNavScroll() {
        const nav = document.querySelector('.navbar');
        if (!nav) return;
        const toggle = () => {
            if (window.scrollY > 60) nav.classList.add('scrolled');
            else nav.classList.remove('scrolled');
        };
        window.addEventListener('scroll', toggle, { passive: true });
        toggle();
    },

    /* ── Horizontal Gallery Drag ── */
    initHorizontalDrag() {
        document.querySelectorAll('.horizontal-gallery').forEach(gallery => {
            let isDown = false, startX, scrollLeft;

            gallery.addEventListener('mousedown', e => {
                isDown = true;
                gallery.style.userSelect = 'none';
                startX = e.pageX - gallery.offsetLeft;
                scrollLeft = gallery.scrollLeft;
            });
            gallery.addEventListener('mouseleave', () => { isDown = false; });
            gallery.addEventListener('mouseup', () => { isDown = false; gallery.style.userSelect = ''; });
            gallery.addEventListener('mousemove', e => {
                if (!isDown) return;
                e.preventDefault();
                const x = e.pageX - gallery.offsetLeft;
                const walk = (x - startX) * 1.5;
                gallery.scrollLeft = scrollLeft - walk;
            });

            // Arrow button controls
            const section = gallery.closest('.gallery-section') || gallery.parentElement;
            const prevBtn = section.querySelector('.gallery-arrow-prev');
            const nextBtn = section.querySelector('.gallery-arrow-next');
            const itemWidth = 340;
            if (prevBtn) prevBtn.addEventListener('click', () => { gallery.scrollBy({ left: -itemWidth, behavior: 'smooth' }); });
            if (nextBtn) nextBtn.addEventListener('click', () => { gallery.scrollBy({ left: itemWidth, behavior: 'smooth' }); });
        });
    },

    /* ── Floating Particles ── */
    initParticles() {
        const container = document.querySelector('.hero-particles');
        if (!container) return;
        const count = 18;
        for (let i = 0; i < count; i++) {
            const p = document.createElement('div');
            p.className = 'particle';
            p.style.left = `${Math.random() * 100}%`;
            p.style.animationDuration = `${6 + Math.random() * 10}s`;
            p.style.animationDelay = `${Math.random() * 8}s`;
            p.style.width = p.style.height = `${2 + Math.random() * 4}px`;
            container.appendChild(p);
        }
    },

    /* ── Stats Counter Animation ── */
    animateCounters() {
        document.querySelectorAll('.stat-number[data-count]').forEach(el => {
            const target = parseInt(el.dataset.count);
            const duration = 2000;
            const step = target / (duration / 16);
            let current = 0;
            const timer = setInterval(() => {
                current = Math.min(current + step, target);
                el.textContent = Math.floor(current).toLocaleString() + (el.dataset.suffix || '');
                if (current >= target) clearInterval(timer);
            }, 16);
        });

        const statsSection = document.querySelector('.stats-grid');
        if (statsSection) {
            const obs = new IntersectionObserver(entries => {
                if (entries[0].isIntersecting) {
                    this.animateCounters();
                    obs.disconnect();
                }
            }, { threshold: 0.5 });
            obs.observe(statsSection);
        }
    },
};

window.ScrollEngine = ScrollEngine;
