// Mobile Menu Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    hamburger.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
    });
});

// Smooth Scrolling
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

// Plans Tab Switching
const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');

tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        const tabName = button.getAttribute('data-tab');
        
        // Remove active class from all buttons and contents
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        
        // Add active class to clicked button
        button.classList.add('active');
        
        // Show corresponding content
        if (tabName === 'internet') {
            document.getElementById('internet-plans').classList.add('active');
        } else if (tabName === 'dth') {
            document.getElementById('dth-plans').classList.add('active');
        }
    });
});

// Contact Form Submission
const contactForm = document.getElementById('contactForm');

contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Get form values
    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        service: document.getElementById('service').value,
        message: document.getElementById('message').value
    };
    
    // Here you would typically send the data to a server
    // For now, we'll just show an alert
    alert('Thank you for contacting us! We will get back to you soon.');
    
    // Reset form
    contactForm.reset();
});

// Navbar scroll effect
let lastScroll = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.15)';
    } else {
        navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    }
    
    lastScroll = currentScroll;
});

// Plan button click handler
document.querySelectorAll('.plan-button').forEach(button => {
    button.addEventListener('click', () => {
        alert('Thank you for your interest! Please contact us to proceed with this plan.');
    });
});

// Intersection Observer for fade-in animations
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

// Observe all sections
document.querySelectorAll('section').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(20px)';
    section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(section);
});

// Initialize - show first section immediately
window.addEventListener('load', () => {
    const homeSection = document.querySelector('#home');
    if (homeSection) {
        homeSection.style.opacity = '1';
        homeSection.style.transform = 'translateY(0)';
    }
    
    // Load DTH plans from Firebase
    loadDTHPlans();
});

// Firebase: Load DTH Plans from Firestore
async function loadDTHPlans() {
    try {
        // Wait for Firebase to be initialized
        let retries = 0;
        while (!window.firebaseDb && retries < 50) {
            await new Promise(resolve => setTimeout(resolve, 100));
            retries++;
        }
        
        if (!window.firebaseDb) {
            console.error('Firebase not initialized');
            showError('Failed to load plans. Please refresh the page.');
            return;
        }

        const db = window.firebaseDb;
        const plansRef = db.collection('plans');
        
        // Fetch only DTH plans
        const snapshot = await plansRef.where('typeofplan', '==', 'dth').get();
        
        const plansGrid = document.getElementById('dth-plans-grid');
        if (!plansGrid) return;
        
        // Clear loading message
        plansGrid.innerHTML = '';
        
        if (snapshot.empty) {
            plansGrid.innerHTML = '<div class="no-plans-message">No DTH plans available at the moment.</div>';
            return;
        }
        
        const plans = [];
        snapshot.forEach((doc) => {
            const data = doc.data();
            plans.push({ id: doc.id, ...data });
        });
        
        if (plans.length === 0) {
            plansGrid.innerHTML = '<div class="no-plans-message">No DTH plans available at the moment.</div>';
            return;
        }
        
        // Sort plans by amount (price)
        plans.sort((a, b) => {
            const priceA = parseFloat(a.amount || 0);
            const priceB = parseFloat(b.amount || 0);
            return priceA - priceB;
        });
        
        // Render plans
        plans.forEach((plan) => {
            const planCard = createPlanCard(plan);
            plansGrid.appendChild(planCard);
        });
        
        // Re-attach event listeners for plan buttons
        attachPlanButtonListeners();
        
    } catch (error) {
        console.error('Error loading DTH plans:', error);
        const plansGrid = document.getElementById('dth-plans-grid');
        if (plansGrid) {
            plansGrid.innerHTML = '<div class="error-message">Failed to load plans. Please try again later.</div>';
        }
    }
}

// Create a plan card element
function createPlanCard(plan) {
    const card = document.createElement('div');
    
    // Check if plan has an offer to make it featured
    const hasOffer = plan.offer && plan.offer.trim() !== '';
    if (hasOffer) {
        card.classList.add('plan-card', 'featured');
    } else {
        card.classList.add('plan-card');
    }
    
    // Plan name
    const planName = plan.planname || 'Plan';
    
    // Plan price (amount)
    const amount = plan.amount || '0';
    const priceText = parseFloat(amount) || 0;
    
    // Duration
    const duration = plan.duration || 'month';
    
    // Badge text (offer)
    const badgeText = plan.offer || '';
    
    // Features - plandata contains the main feature
    let features = [];
    if (plan.plandata && plan.plandata.trim() !== '') {
        features.push(plan.plandata);
    }
    
    // Add installation info if available
    if (plan.installation && plan.installation.trim() !== '') {
        const installationText = plan.installation.toLowerCase() === 'free' 
            ? 'Free Installation' 
            : `${plan.installation} Installation`;
        features.push(installationText);
    }
    
    // Add speed if available (though DTH plans usually don't have speed)
    if (plan.speed && plan.speed.trim() !== '') {
        features.push(`${plan.speed} Speed`);
    }
    
    // Add 24/7 Support as default
    features.push('24/7 Support');
    
    // Build card HTML
    let cardHTML = '';
    
    if (badgeText && hasOffer) {
        cardHTML += `<div class="plan-badge">${badgeText}</div>`;
    }
    
    cardHTML += `
        <div class="plan-header">
            <h3>${planName}</h3>
            <div class="plan-price">₹${priceText}<span>/${duration}</span></div>
        </div>
    `;
    
    if (features.length > 0) {
        cardHTML += '<ul class="plan-features">';
        features.forEach(feature => {
            cardHTML += `<li>${feature}</li>`;
        });
        cardHTML += '</ul>';
    }
    
    cardHTML += '<button class="plan-button">Choose Plan</button>';
    
    card.innerHTML = cardHTML;
    return card;
}

// Show error message
function showError(message) {
    const plansGrid = document.getElementById('dth-plans-grid');
    if (plansGrid) {
        plansGrid.innerHTML = `<div class="error-message">${message}</div>`;
    }
}

// Attach event listeners to plan buttons
function attachPlanButtonListeners() {
    const planButtons = document.querySelectorAll('#dth-plans-grid .plan-button');
    planButtons.forEach(button => {
        button.addEventListener('click', () => {
            alert('Thank you for your interest! Please contact us to proceed with this plan.');
        });
    });
}



