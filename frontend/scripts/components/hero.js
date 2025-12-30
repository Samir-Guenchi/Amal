/**
 * Hero Component
 * Handles hero section interactions and animations
 * Implements Single Responsibility Principle
 */
class HeroComponent {
    constructor() {
        this.init();
    }

    /**
     * Initialize component
     */
    init() {
        this.cacheDOM();
        this.bindEvents();
        this.setupAnimations();
    }

    /**
     * Cache DOM elements
     */
    cacheDOM() {
        this.startJourneyBtn = document.querySelector('#startJourneyBtn');
        this.learnMoreBtn = document.querySelector('#learnMoreBtn');
        this.ctaStartBtn = document.querySelector('#ctaStartBtn');
        this.heroSection = document.querySelector('.hero');
        this.orbs = document.querySelectorAll('.gradient-orb');
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Start journey button
        if (this.startJourneyBtn) {
            this.startJourneyBtn.addEventListener('click', () => {
                this.handleStartJourney();
            });
        }

        // Learn more button
        if (this.learnMoreBtn) {
            this.learnMoreBtn.addEventListener('click', () => {
                this.handleLearnMore();
            });
        }

        // CTA section button
        if (this.ctaStartBtn) {
            this.ctaStartBtn.addEventListener('click', () => {
                this.handleStartJourney();
            });
        }

        // Parallax effect on mouse move
        if (this.heroSection) {
            this.heroSection.addEventListener('mousemove', (e) => {
                this.handleParallax(e);
            });
        }
    }

    /**
     * Setup entrance animations
     */
    setupAnimations() {
        // Observe hero section for intersection
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.animateHeroContent();
                    }
                });
            },
            { threshold: 0.1 }
        );

        if (this.heroSection) {
            observer.observe(this.heroSection);
        }
    }

    /**
     * Animate hero content on view
     */
    animateHeroContent() {
        // This could trigger additional animations if needed
        window.eventBus.emit('hero:visible', {});
    }

    /**
     * Handle start journey button click
     */
    handleStartJourney() {
        // Emit event
        window.eventBus.emit('journey:start', { source: 'hero' });

        // Track analytics (placeholder)
        this.trackEvent('journey_started', { source: 'hero_cta' });

        // Show modal or redirect to chat
        this.showChatInterface();
    }

    /**
     * Handle learn more button click
     */
    handleLearnMore() {
        // Emit event
        window.eventBus.emit('learn:more', {});

        // Scroll to features section
        const featuresSection = document.querySelector('.features');
        if (featuresSection) {
            const navbarHeight = 80; // var(--navbar-height)
            const sectionTop = featuresSection.offsetTop - navbarHeight;

            window.scrollTo({
                top: sectionTop,
                behavior: 'smooth'
            });
        }
    }

    /**
     * Handle parallax effect
     * @param {MouseEvent} e - Mouse event
     */
    handleParallax(e) {
        if (!this.orbs.length) return;

        const { clientX, clientY } = e;
        const { innerWidth, innerHeight } = window;

        // Calculate movement based on mouse position
        const moveX = (clientX / innerWidth - 0.5) * 30;
        const moveY = (clientY / innerHeight - 0.5) * 30;

        // Apply to orbs with different intensities
        this.orbs.forEach((orb, index) => {
            const intensity = (index + 1) * 0.3;
            orb.style.transform = `translate(${moveX * intensity}px, ${moveY * intensity}px)`;
        });
    }

    /**
     * Show chat interface (placeholder)
     */
    showChatInterface() {
        // This would show a modal or navigate to chat page
        console.log('Opening chat interface...');

        // For now, just show an alert
        alert('مرحباً! نحن سعداء ببدء رحلتك معنا. منصة الدردشة قيد التطوير.');

        // In a real implementation, this would:
        // - Open a modal with chat interface
        // - Or navigate to a dedicated chat page
        // - Initialize the RAG/LLM connection
    }

    /**
     * Track analytics event (placeholder)
     * @param {string} eventName - Event name
     * @param {Object} data - Event data
     */
    trackEvent(eventName, data) {
        // Placeholder for analytics tracking
        console.log('Analytics:', eventName, data);

        // In production, this would integrate with:
        // - Google Analytics
        // - Mixpanel
        // - Custom analytics service
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new HeroComponent();
    });
} else {
    new HeroComponent();
}
