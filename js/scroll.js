/* =====================================================
   KANDYAN GEM & JEWELLERS — Scroll Engine
   ===================================================== */

const ScrollEngine = {
    init() {
        // Read saved animation settings
        let animSettings = {};
        try { animSettings = (window.KGJ && KGJ.getSettings()) || {}; } catch (e) { }

        if (animSettings.animParallax !== false) this.initParallax();
        this.initReveal(animSettings.animReveal !== false);
        this.initNavScroll();
        this.initHorizontalDrag();
        if (animSettings.animParticles !== false) this.initParticles();
    },


    /* ── Parallax Hero ── */
    initParallax() {
        const layers = document.querySelectorAll('.parallax-hero .layer[data-speed]');
        if (!layers.length) return;

        const onScroll = () => {
            const scrollY = window.scrollY;
            layers.forEach(layer => {
                const speed = parseFloat(layer.dataset.speed) || 0.5;
                layer.style.setProperty('--parallax-offset', `${scrollY * speed}px`);
            });
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    },


    /* ── Reveal on Scroll ── */
    initReveal(enabled = true) {
        const targets = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale, .stagger');
        if (!targets.length) return;

        // If animations disabled — make everything visible immediately
        if (!enabled) {
            targets.forEach(t => t.classList.add('visible'));
            return;
        }

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

    /* ── Floating Particles (Canvas-based, smooth 60fps) ── */
    initParticles() {
        const container = document.querySelector('.hero-particles');
        if (!container) return;

        // Create canvas inside the hero-particles div
        const canvas = document.createElement('canvas');
        canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;';
        container.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        let W, H, particles = [], rafId;

        // Read particle count from saved settings (default 40)
        const getCount = () => {
            try {
                const s = JSON.parse(localStorage.getItem('kgj_settings') || '{}');
                return Math.max(10, Math.min(120, parseInt(s.particleCount) || 40));
            } catch { return 40; }
        };

        // Resize handler — keeps canvas pixel-perfect
        const resize = () => {
            const rect = container.getBoundingClientRect();
            W = canvas.width = rect.width || window.innerWidth;
            H = canvas.height = rect.height || window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize, { passive: true });

        // Particle factory
        const createParticle = (randomY = false) => {
            const size = 1 + Math.random() * 3;
            return {
                x: Math.random() * W,
                y: randomY ? Math.random() * H : H + size * 2,
                size,
                speedY: 0.25 + Math.random() * 0.55,  // slow upward drift
                speedX: (Math.random() - 0.5) * 0.35, // gentle side drift
                phase: Math.random() * Math.PI * 2,    // sine wave offset
                amplitude: 10 + Math.random() * 20,   // horizontal sway amount
                alpha: 0,
                targetAlpha: 0.35 + Math.random() * 0.55,
                fadeSpeed: 0.008 + Math.random() * 0.012,
                // colour: gold spectrum
                hue: 38 + Math.random() * 18,
                saturation: 80 + Math.random() * 20,
                lightness: 55 + Math.random() * 20,
            };
        };

        // Spawn initial particles spread across full height
        const count = getCount();
        for (let i = 0; i < count; i++) particles.push(createParticle(true));

        // Main animation loop
        let tick = 0;
        const animate = () => {
            ctx.clearRect(0, 0, W, H);
            tick++;

            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];

                // Fade in
                if (p.alpha < p.targetAlpha) p.alpha = Math.min(p.alpha + p.fadeSpeed, p.targetAlpha);

                // Smooth sine-wave X sway
                p.x += p.speedX + Math.sin(tick * 0.012 + p.phase) * 0.4;
                p.y -= p.speedY;

                // Recycle particle when it leaves the top
                if (p.y < -p.size * 4) {
                    particles[i] = createParticle(false);
                    continue;
                }

                // Fade out near top
                if (p.y < H * 0.12) {
                    p.alpha = Math.max(0, p.alpha - 0.02);
                }

                // Draw glowing circle
                ctx.save();
                ctx.globalAlpha = p.alpha;

                // Outer glow
                const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
                grd.addColorStop(0, `hsla(${p.hue}, ${p.saturation}%, ${p.lightness}%, 0.9)`);
                grd.addColorStop(0.4, `hsla(${p.hue}, ${p.saturation}%, ${p.lightness}%, 0.4)`);
                grd.addColorStop(1, `hsla(${p.hue}, ${p.saturation}%, ${p.lightness}%, 0)`);

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
                ctx.fillStyle = grd;
                ctx.fill();

                // Bright core
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size * 0.8, 0, Math.PI * 2);
                ctx.fillStyle = `hsla(${p.hue}, 100%, 90%, 1)`;
                ctx.fill();

                ctx.restore();
            }

            rafId = requestAnimationFrame(animate);
        };

        // Only run animation if parallax hero is visible
        const heroSection = document.querySelector('.parallax-hero');
        if (heroSection) {
            const obs = new IntersectionObserver(entries => {
                if (entries[0].isIntersecting) {
                    if (!rafId) animate();
                } else {
                    cancelAnimationFrame(rafId);
                    rafId = null;
                }
            }, { threshold: 0 });
            obs.observe(heroSection);
        }
        animate();
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
