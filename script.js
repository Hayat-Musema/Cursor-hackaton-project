// DOM Elements
const themeToggle = document.getElementById('theme-toggle');
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');
const body = document.body;

// Theme Toggle Functionality
function initThemeToggle() {
    // Check for saved theme preference or default to light theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    body.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    themeToggle.addEventListener('click', () => {
        const currentTheme = body.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });
}

function updateThemeIcon(theme) {
    const icon = themeToggle.querySelector('i');
    if (theme === 'dark') {
        icon.className = 'fas fa-sun';
    } else {
        icon.className = 'fas fa-moon';
    }
}

// Hamburger Menu Functionality
function initHamburgerMenu() {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close menu when clicking on a link
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });
}

// Active Navigation Highlighting
function initActiveNavigation() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href');
        if (linkPage === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// Sliding underline (magic line) between pages and on hover
function initMagicLineNav() {
    const navList = document.querySelector('.nav-list');
    const links = document.querySelectorAll('.nav-link');
    if (!navList || !links.length) return;

    // Create magic line if not present
    let magic = document.querySelector('.nav-magic-line');
    if (!magic) {
        magic = document.createElement('span');
        magic.className = 'nav-magic-line';
        navList.appendChild(magic);
    }

    function setFromLink(link, animate = true) {
        const rect = link.getBoundingClientRect();
        const parentRect = navList.getBoundingClientRect();
        const left = rect.left - parentRect.left + navList.scrollLeft;
        const width = rect.width;
        if (!animate) magic.style.transition = 'none';
        magic.style.left = `${left}px`;
        magic.style.width = `${width}px`;
        // force reflow to re-enable transition next time
        if (!animate) {
            void magic.offsetWidth; 
            magic.style.transition = '';
        }
    }

    // Restore last page's link position for entry animation
    const lastHref = sessionStorage.getItem('magic:lastHref');
    const active = document.querySelector('.nav-link.active') || links[0];
    const lastLink = lastHref ? Array.from(links).find(a => a.getAttribute('href') === lastHref) : null;

    if (lastLink) setFromLink(lastLink, false);
    // Animate to active after first frame
    requestAnimationFrame(() => setFromLink(active, true));

    // Hover interactions
    links.forEach(link => {
        link.addEventListener('mouseenter', () => setFromLink(link, true));
        link.addEventListener('focus', () => setFromLink(link, true));
        link.addEventListener('mouseleave', () => setFromLink(active, true));
        link.addEventListener('blur', () => setFromLink(active, true));
        link.addEventListener('click', () => {
            sessionStorage.setItem('magic:lastHref', link.getAttribute('href'));
        });
    });

    // Recalculate on resize
    window.addEventListener('resize', () => setFromLink(document.querySelector('.nav-link.active') || active, true));
}

// Smooth Scrolling for Anchor Links
function initSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Intersection Observer for Animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animatedElements = document.querySelectorAll('.feature-card, .content-card, .about-text, .content-section, .page-header');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// In-page Section Navigation (active link highlighting)
function initSectionNavigation() {
    const sectionNavLinks = document.querySelectorAll('.section-nav a[href^="#"]');
    if (!sectionNavLinks.length) return;

    const idToLinkMap = {};
    sectionNavLinks.forEach(link => {
        const id = link.getAttribute('href').slice(1);
        if (id) idToLinkMap[id] = link;
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const id = entry.target.id;
            if (!id) return;
            if (entry.isIntersecting) {
                sectionNavLinks.forEach(l => l.classList.remove('active'));
                const activeLink = idToLinkMap[id];
                if (activeLink) activeLink.classList.add('active');
            }
        });
    }, {
        root: null,
        rootMargin: '-40% 0px -50% 0px',
        threshold: 0.1
    });

    Object.keys(idToLinkMap).forEach(id => {
        const section = document.getElementById(id);
        if (section) observer.observe(section);
    });
}

// Form Validation (if forms exist)
function initFormValidation() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const formData = new FormData(form);
            const data = Object.fromEntries(formData);
            
            // Basic validation
            let isValid = true;
            const requiredFields = form.querySelectorAll('[required]');
            
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    field.style.borderColor = '#ef4444';
                } else {
                    field.style.borderColor = '';
                }
            });
            
            if (isValid) {
                // Handle form submission
                console.log('Form data:', data);
                // You can add AJAX submission here
                alert('Form submitted successfully!');
                form.reset();
            } else {
                alert('Please fill in all required fields.');
            }
        });
    });
}

// Search Functionality (if search exists)
function initSearch() {
    const searchInput = document.querySelector('.search-input');
    const searchResults = document.querySelector('.search-results');
    
    if (searchInput && searchResults) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            
            if (query.length < 2) {
                searchResults.style.display = 'none';
                return;
            }
            
            // Filter content based on query
            const contentElements = document.querySelectorAll('.content-card, .feature-card');
            const matches = [];
            
            contentElements.forEach(element => {
                const text = element.textContent.toLowerCase();
                if (text.includes(query)) {
                    matches.push(element);
                }
            });
            
            // Display results
            displaySearchResults(matches, query);
        });
    }
}

function displaySearchResults(matches, query) {
    const searchResults = document.querySelector('.search-results');
    
    if (matches.length === 0) {
        searchResults.innerHTML = '<p>No results found for "' + query + '"</p>';
    } else {
        const resultsHTML = matches.map(match => {
            const title = match.querySelector('h3')?.textContent || 'Untitled';
            return `<div class="search-result-item">
                        <h4>${title}</h4>
                        <p>${match.textContent.substring(0, 100)}...</p>
                    </div>`;
        }).join('');
        
        searchResults.innerHTML = resultsHTML;
    }
    
    searchResults.style.display = 'block';
}

// Lazy Loading for Images
function initLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// Back to Top Button
function initBackToTop() {
    const backToTopButton = document.createElement('button');
    backToTopButton.innerHTML = '<i class="fas fa-arrow-up"></i>';
    backToTopButton.className = 'back-to-top';
    backToTopButton.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: var(--primary-color);
        color: white;
        border: none;
        border-radius: 50%;
        width: 50px;
        height: 50px;
        cursor: pointer;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        z-index: 1000;
        box-shadow: 0 4px 12px var(--shadow-color);
    `;
    
    document.body.appendChild(backToTopButton);
    
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backToTopButton.style.opacity = '1';
            backToTopButton.style.visibility = 'visible';
        } else {
            backToTopButton.style.opacity = '0';
            backToTopButton.style.visibility = 'hidden';
        }
    });
    
    backToTopButton.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Keyboard Navigation
function initKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
        // Escape key to close mobile menu
        if (e.key === 'Escape') {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        }
        
        // Ctrl/Cmd + K for search (if search exists)
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            const searchInput = document.querySelector('.search-input');
            if (searchInput) {
                searchInput.focus();
            }
        }
    });
}

// Performance Monitoring
function initPerformanceMonitoring() {
    // Log page load time
    window.addEventListener('load', () => {
        const loadTime = performance.now();
        console.log(`Page loaded in ${loadTime.toFixed(2)}ms`);
    });
    
    // Monitor for layout shifts
    if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (entry.hadRecentInput) continue;
                console.log('Layout shift detected:', entry.value);
            }
        });
        observer.observe({ entryTypes: ['layout-shift'] });
    }
}

// Initialize all functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initThemeToggle();
    initHamburgerMenu();
    initActiveNavigation();
    initMagicLineNav();
    initSmoothScrolling();
    initScrollAnimations();
    initSectionNavigation();
    initFormValidation();
    initSearch();
    initLazyLoading();
    initBackToTop();
    initKeyboardNavigation();
    initPerformanceMonitoring();
    
    console.log('Ha-Tech Ethiopia website initialized successfully!');
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        document.title = 'Ha-Tech Ethiopia - Come back! 👋';
    } else {
        document.title = document.title.replace(' - Come back! 👋', '');
    }
});

// Service Worker Registration (for PWA capabilities)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
