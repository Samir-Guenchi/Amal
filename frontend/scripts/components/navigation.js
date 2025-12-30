/**
 * Navigation Component
 * Handles navbar behavior and interactions
 * Implements Single Responsibility Principle
 */
class NavigationComponent {
    constructor() {
        this.navbar = null;
        this.scrollThreshold = 50;
        this.init();
    }

    /**
     * Initialize component
     */
    init() {
        this.cacheDOM();
        this.bindEvents();
        this.setupScrollBehavior();
    }

    /**
     * Cache DOM elements
     */
    cacheDOM() {
        this.navbar = document.querySelector('.navbar');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.ctaButton = document.querySelector('#getStartedBtn');
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Scroll event with throttling
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            if (scrollTimeout) return;

            scrollTimeout = setTimeout(() => {
                this.handleScroll();
                scrollTimeout = null;
            }, 100);
        });

        // Navigation link clicks
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => this.handleNavClick(e));
        });

        // CTA button click
        if (this.ctaButton) {
            this.ctaButton.addEventListener('click', () => this.handleCTAClick());
        }

        // Listen to state changes
        window.stateManager.subscribe('ui.currentPage', (page) => {
            this.updateActiveLink(page);
        });
    }

    /**
     * Setup scroll behavior
     */
    setupScrollBehavior() {
        // Initial check
        this.handleScroll();
    }

    /**
     * Handle scroll events
     */
    handleScroll() {
        const scrollY = window.scrollY;
        const isScrolled = scrollY > this.scrollThreshold;

        // Update navbar class
        if (isScrolled && !this.navbar.classList.contains('scrolled')) {
            this.navbar.classList.add('scrolled');
            window.stateManager.set('ui.isNavbarScrolled', true);
        } else if (!isScrolled && this.navbar.classList.contains('scrolled')) {
            this.navbar.classList.remove('scrolled');
            window.stateManager.set('ui.isNavbarScrolled', false);
        }
    }

    /**
     * Handle navigation link clicks
     * @param {Event} e - Click event
     */
    handleNavClick(e) {
        e.preventDefault();

        const link = e.currentTarget;
        const targetId = link.getAttribute('href').substring(1);

        // Update active state
        this.setActiveLink(link);

        // Smooth scroll to section
        this.scrollToSection(targetId);

        // Update state
        window.stateManager.set('ui.currentPage', targetId);

        // Emit event
        window.eventBus.emit('navigation:change', { page: targetId });
    }

    /**
     * Handle CTA button click
     */
    handleCTAClick() {
        window.eventBus.emit('cta:clicked', { source: 'navbar' });

        // Navigate to chat or show modal
        this.scrollToSection('home');

        // Could trigger a modal or redirect
        console.log('CTA clicked - Start journey');
    }

    /**
     * Set active link
     * @param {HTMLElement} activeLink - Link element to set as active
     */
    setActiveLink(activeLink) {
        this.navLinks.forEach(link => link.classList.remove('active'));
        activeLink.classList.add('active');
    }

    /**
     * Update active link based on page
     * @param {string} page - Page identifier
     */
    updateActiveLink(page) {
        this.navLinks.forEach(link => {
            const href = link.getAttribute('href').substring(1);
            if (href === page) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    /**
     * Scroll to section
     * @param {string} sectionId - Section ID to scroll to
     */
    scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);

        if (section) {
            const navbarHeight = this.navbar.offsetHeight;
            const sectionTop = section.offsetTop - navbarHeight;

            window.scrollTo({
                top: sectionTop,
                behavior: 'smooth'
            });
        }
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new NavigationComponent();
    });
} else {
    new NavigationComponent();
}
