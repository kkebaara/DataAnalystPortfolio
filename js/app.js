/**
 * App bootstrap: init order, fade-in, mobile menu, smooth scroll, intersection observer.
 * Chart init runs when dashboard is in view (lazy).
 */
(function (global) {
    var dashboardObserved = false;

    function toggleMobileMenu() {
        var menu = document.getElementById('mobileMenu');
        var btn = document.querySelector('.hamburger');
        if (menu) {
            menu.classList.toggle('open');
            var open = menu.classList.contains('open');
            if (btn) {
                btn.setAttribute('aria-expanded', open ? 'true' : 'false');
                btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
            }
        }
    }

    function addInteractiveFeatures() {
        document.querySelectorAll('.fade-in').forEach(function (el, i) {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            setTimeout(function () {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }, 200 + i * 150);
        });
        document.querySelectorAll('.dashboard-tile').forEach(function (tile) {
            tile.style.transition = 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        });
    }

    function initChartsWhenVisible() {
        var dashboard = document.querySelector('.dashboard');
        if (!dashboard || dashboardObserved) return;
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting || dashboardObserved) return;
                dashboardObserved = true;
                if (global.initializePieChart) global.initializePieChart();
                if (global.initializeBarChart) global.initializeBarChart();
                if (global.renderDashboardTable) global.renderDashboardTable();
                if (global.startDataUpdates) global.startDataUpdates();
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
        observer.observe(dashboard);
    }

    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
            anchor.addEventListener('click', function (e) {
                var href = this.getAttribute('href');
                if (href === '#') return;
                e.preventDefault();
                var target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    }

    function initScrollReveal() {
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) entry.target.classList.add('fade-in');
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
        document.querySelectorAll('.skill-card, .result-card, .methodology-step').forEach(function (el) {
            observer.observe(el);
        });
    }

    function onDOMContentLoaded() {
        addInteractiveFeatures();
        initSmoothScroll();
        initScrollReveal();
        initChartsWhenVisible();
        global.toggleMobileMenu = toggleMobileMenu;
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', onDOMContentLoaded);
    } else {
        onDOMContentLoaded();
    }
})(typeof window !== 'undefined' ? window : this);
