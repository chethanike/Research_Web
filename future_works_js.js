// Future Works Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize particles background
    createParticles();
    
    // Initialize animations
    initializeAnimations();
    
    // Initialize interactive elements
    initializeInteractiveElements();
    
    // Initialize scroll effects
    initializeScrollEffects();
    
    // Initialize mobile menu
    initializeMobileMenu();
    
    // Initialize roadmap timeline
    initializeRoadmapTimeline();
});

// Loading Animation
window.addEventListener('load', function() {
    setTimeout(() => {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.style.opacity = '0';
            setTimeout(() => {
                loadingOverlay.style.display = 'none';
            }, 500);
        }
    }, 1000);
});

// Particle System
function createParticles() {
    const particlesContainer = document.getElementById('particles');
    if (!particlesContainer) return;
    
    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 6 + 's';
        particle.style.animationDuration = (Math.random() * 3 + 3) + 's';
        particlesContainer.appendChild(particle);
    }
}

// Mobile Menu Toggle
function initializeMobileMenu() {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const nav = document.querySelector('nav');
    
    if (mobileMenuToggle && nav) {
        mobileMenuToggle.addEventListener('click', function() {
            nav.classList.toggle('mobile-open');
            const icon = this.querySelector('i');
            if (nav.classList.contains('mobile-open')) {
                icon.className = 'fas fa-times';
            } else {
                icon.className = 'fas fa-bars';
            }
        });
    }
}

// Intersection Observer for Animations
function initializeAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                
                // Special handling for development cards
                if (entry.target.classList.contains('development-card')) {
                    const icon = entry.target.querySelector('.development-icon');
                    if (icon) {
                        setTimeout(() => {
                            icon.style.transform = 'scale(1.1) rotate(5deg)';
                            icon.style.boxShadow = '0 15px 40px var(--glow-color)';
                        }, 300);
                    }
                }
                
                // Special handling for roadmap items
                if (entry.target.classList.contains('roadmap-item')) {
                    const index = Array.from(entry.target.parentNode.children).indexOf(entry.target);
                    entry.target.style.transitionDelay = (index * 0.2) + 's';
                }
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animateElements = document.querySelectorAll(
        '.section-title, .development-card, .roadmap-item, .hero-content, .future-intro'
    );

    animateElements.forEach(el => {
        observer.observe(el);
    });
}

// Interactive Elements
function initializeInteractiveElements() {
    // Enhanced button hover effects
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px) scale(1.02)';
        });
        
        btn.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Development card interactions
    document.querySelectorAll('.development-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            const icon = this.querySelector('.development-icon');
            if (icon) {
                icon.style.transform = 'scale(1.2) rotate(10deg)';
                icon.style.filter = 'brightness(1.2)';
            }
        });
        
        card.addEventListener('mouseleave', function() {
            const icon = this.querySelector('.development-icon');
            if (icon) {
                icon.style.transform = 'scale(1) rotate(0deg)';
                icon.style.filter = 'brightness(1)';
            }
        });
    });
    
    // Progress bar animations
    const progressBars = document.querySelectorAll('.progress-fill');
    const progressObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const progressBar = entry.target;
                const targetWidth = progressBar.dataset.progress + '%';
                setTimeout(() => {
                    progressBar.style.width = targetWidth;
                }, 500);
            }
        });
    });
    
    progressBars.forEach(bar => {
        progressObserver.observe(bar);
    });
}

// Scroll Effects
function initializeScrollEffects() {
    // Smooth scrolling for anchor links
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

    // Active navigation state
    const navLinks = document.querySelectorAll('nav ul li a');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Dynamic navbar background on scroll
    let ticking = false;
    
    function updateHeaderOnScroll() {
        const header = document.querySelector('header');
        if (header) {
            if (window.scrollY > 100) {
                header.style.background = 'rgba(17, 17, 17, 0.95)';
                header.style.backdropFilter = 'blur(20px)';
            } else {
                header.style.background = 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%)';
                header.style.backdropFilter = 'blur(10px)';
            }
        }
        ticking = false;
    }
    
    window.addEventListener('scroll', function() {
        if (!ticking) {
            requestAnimationFrame(updateHeaderOnScroll);
            ticking = true;
        }
    });

    // Parallax effect for hero section
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const hero = document.querySelector('.hero');
        if (hero) {
            const rate = scrolled * -0.3;
            hero.style.transform = `translateY(${rate}px)`;
        }
    });
}

// Dynamic particle movement based on mouse
document.addEventListener('mousemove', (e) => {
    const particles = document.querySelectorAll('.particle');
    const x = e.clientX / window.innerWidth;
    const y = e.clientY / window.innerHeight;
    
    particles.forEach((particle, index) => {
        const speed = (index % 5 + 1) * 0.5;
        const xMove = (x - 0.5) * speed;
        const yMove = (y - 0.5) * speed;
        particle.style.transform = `translate(${xMove}px, ${yMove}px)`;
    });
});

// Roadmap Timeline Animation
function initializeRoadmapTimeline() {
    const roadmapItems = document.querySelectorAll('.roadmap-item');
    
    roadmapItems.forEach((item, index) => {
        // Add staggered animation delay
        item.style.animationDelay = (index * 0.3) + 's';
        
        // Add hover effects for roadmap items
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'translateX(10px) scale(1.02)';
            this.style.boxShadow = '0 20px 50px rgba(0, 212, 255, 0.3)';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'translateX(0) scale(1)';
            this.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.3)';
        });
    });
}

// Typing effect for specific elements
function initializeTypingEffect() {
    const typeElements = document.querySelectorAll('[data-type]');
    
    typeElements.forEach(element => {
        const text = element.textContent;
        const speed = parseInt(element.dataset.speed) || 100;
        element.textContent = '';
        
        let i = 0;
        const typeWriter = () => {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, speed);
            }
        };
        
        // Start typing when element comes into view
        const typingObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setTimeout(typeWriter, 1000);
                    typingObserver.unobserve(entry.target);
                }
            });
        });
        
        typingObserver.observe(element);
    });
}

// Initialize typing effects
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(initializeTypingEffect, 2000);
});

// Progress tracking for development phases
function updateProgressTracking() {
    const progressItems = [
        { id: 'hardware-progress', current: 75, target: 100 },
        { id: 'ml-progress', current: 60, target: 100 },
        { id: 'masking-progress', current: 45, target: 100 },
        { id: 'framework-progress', current: 30, target: 100 },
        { id: 'community-progress', current: 20, target: 100 }
    ];
    
    progressItems.forEach(item => {
        const element = document.getElementById(item.id);
        if (element) {
            const progressFill = element.querySelector('.progress-fill');
            if (progressFill) {
                progressFill.dataset.progress = item.current;
            }
        }
    });
}

// Call progress tracking on load
document.addEventListener('DOMContentLoaded', updateProgressTracking);

// Enhanced scroll-triggered animations for counters/statistics
function animateCounters() {
    const counters = document.querySelectorAll('[data-count]');
    
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = parseInt(counter.dataset.count);
                const duration = parseInt(counter.dataset.duration) || 2000;
                const increment = target / (duration / 16);
                let current = 0;
                
                const updateCounter = () => {
                    current += increment;
                    counter.textContent = Math.round(current);
                    
                    if (current < target) {
                        requestAnimationFrame(updateCounter);
                    } else {
                        counter.textContent = target;
                    }
                };
                
                updateCounter();
                counterObserver.unobserve(counter);
            }
        });
    });
    
    counters.forEach(counter => {
        counterObserver.observe(counter);
    });
}

// Initialize counter animations
document.addEventListener('DOMContentLoaded', animateCounters);

// Error handling for missing elements
function safeElementQuery(selector, callback) {
    const element = document.querySelector(selector);
    if (element && typeof callback === 'function') {
        callback(element);
    }
}

// Utility function for debouncing
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Optimized scroll handler
const optimizedScrollHandler = debounce(() => {
    updateHeaderOnScroll();
}, 10);

window.addEventListener('scroll', optimizedScrollHandler);