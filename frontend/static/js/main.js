// Global variables
const API_URL = '/api';
let currentUser = null;

// Check if user is logged in
function checkAuthStatus() {
    const token = localStorage.getItem('authToken');
    
    if (token) {
        // Update UI for logged in user
        document.getElementById('loginBtn').classList.add('d-none');
        document.getElementById('registerBtn').classList.add('d-none');
        document.getElementById('profileBtn').classList.remove('d-none');
        document.getElementById('logoutBtn').classList.remove('d-none');
        
        // Fetch user data if we don't have it
        if (!currentUser) {
            fetchUserData();
        }
    } else {
        // Update UI for logged out user
        document.getElementById('loginBtn').classList.remove('d-none');
        document.getElementById('registerBtn').classList.remove('d-none');
        document.getElementById('profileBtn').classList.add('d-none');
        document.getElementById('logoutBtn').classList.add('d-none');
        
        // Clear current user
        currentUser = null;
    }
}

// Fetch current user data
function fetchUserData() {
    const token = localStorage.getItem('authToken');
    
    if (!token) return;
    
    fetch(`${API_URL}/user/profile`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('Failed to fetch user data');
        }
    })
    .then(data => {
        currentUser = data;
        console.log('User data loaded:', currentUser);
        
        // Display notification badge if there are unread notifications
        if (currentUser.unread_notifications > 0) {
            updateNotificationBadge(currentUser.unread_notifications);
        }
    })
    .catch(error => {
        console.error('Error fetching user data:', error);
        localStorage.removeItem('authToken'); // Clear token if it's invalid
        checkAuthStatus();
    });
}

// Handle logout
function handleLogout() {
    // Show animated logout confirmation
    showToast('Logging out...', 'info');
    
    // Show loading animation
    document.body.classList.add('loading');
    
    fetch(`${API_URL}/logout`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
    })
    .then(() => {
        localStorage.removeItem('authToken');
        checkAuthStatus();
        
        // Show success toast
        showToast('Logged out successfully!', 'success');
        
        // Remove loading animation
        document.body.classList.remove('loading');
        
        // Redirect after short delay
        setTimeout(() => {
            window.location.href = '/';
        }, 1000);
    })
    .catch(error => {
        console.error('Error logging out:', error);
        localStorage.removeItem('authToken');
        checkAuthStatus();
        document.body.classList.remove('loading');
        window.location.href = '/';
    });
}

// Helper function to format date
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Helper function to format time
function formatTime(dateString) {
    const options = { hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleTimeString(undefined, options);
}

// Show toast notifications
function showToast(message, type = 'info') {
    // Create toast container if it doesn't exist
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
        toastContainer.style.zIndex = '1060';
        document.body.appendChild(toastContainer);
    }
    
    // Create toast element
    const toastEl = document.createElement('div');
    toastEl.className = `toast bg-${type === 'info' ? 'primary' : type} text-white`;
    toastEl.setAttribute('role', 'alert');
    toastEl.setAttribute('aria-live', 'assertive');
    toastEl.setAttribute('aria-atomic', 'true');
    
    // Toast content
    toastEl.innerHTML = `
        <div class="toast-header bg-${type === 'info' ? 'primary' : type} text-white">
            <i class="fas fa-${getIconForToastType(type)} me-2"></i>
            <strong class="me-auto">Student Skill Exchange</strong>
            <small>Just now</small>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body">
            ${message}
        </div>
    `;
    
    // Add to container
    toastContainer.appendChild(toastEl);
    
    // Initialize and show toast
    const toast = new bootstrap.Toast(toastEl, {
        animation: true,
        autohide: true,
        delay: 5000
    });
    toast.show();
    
    // Remove toast after it's hidden
    toastEl.addEventListener('hidden.bs.toast', function() {
        toastEl.remove();
    });
}

function getIconForToastType(type) {
    switch(type) {
        case 'success': return 'check-circle';
        case 'danger': return 'exclamation-circle';
        case 'warning': return 'exclamation-triangle';
        case 'info':
        default: return 'info-circle';
    }
}

// Add loading animation
function createLoadingSpinner() {
    // Create loading overlay if it doesn't exist
    if (!document.querySelector('.loading-overlay')) {
        const overlay = document.createElement('div');
        overlay.className = 'loading-overlay';
        overlay.innerHTML = `
            <div class="spinner-wrapper">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .loading-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 9999;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
            }
            body.loading .loading-overlay {
                opacity: 1;
                visibility: visible;
            }
            .spinner-wrapper {
                background-color: white;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
            }
            .spinner-border {
                width: 3rem;
                height: 3rem;
            }
        `;
        document.head.appendChild(style);
    }
}

// Update notification badge
function updateNotificationBadge(count) {
    let badge = document.querySelector('#notification-badge');
    
    if (!badge) {
        // Create badge if it doesn't exist
        const profileBtn = document.getElementById('profileBtn');
        badge = document.createElement('span');
        badge.id = 'notification-badge';
        badge.className = 'position-absolute translate-middle badge rounded-pill bg-danger';
        badge.style.top = '0';
        badge.style.right = '0';
        
        profileBtn.style.position = 'relative';
        profileBtn.appendChild(badge);
    }
    
    badge.textContent = count > 9 ? '9+' : count;
}

// Add 3D hover effect to cards
function add3DCardEffect() {
    const cards = document.querySelectorAll('.card:not(.login-card)');
    
    cards.forEach(card => {
        card.addEventListener('mousemove', function(e) {
            const cardRect = card.getBoundingClientRect();
            const cardCenterX = cardRect.left + cardRect.width / 2;
            const cardCenterY = cardRect.top + cardRect.height / 2;
            
            // Calculate mouse position relative to card center
            const mouseX = e.clientX - cardCenterX;
            const mouseY = e.clientY - cardCenterY;
            
            // Calculate rotation based on mouse position
            const rotateY = (mouseX / (cardRect.width / 2)) * 5; // max 5 degrees
            const rotateX = -((mouseY / (cardRect.height / 2)) * 5); // max 5 degrees
            
            // Apply transformation
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });
        
        card.addEventListener('mouseleave', function() {
            // Reset transformation
            card.style.transform = '';
        });
    });
}

// Setup event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Create loading spinner
    createLoadingSpinner();
    
    // Check if user is logged in
    checkAuthStatus();
    
    // Setup logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            handleLogout();
        });
    }
    
    // Initialize 3D card effects
    add3DCardEffect();
    
    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    // Add smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
});

// Add page transition effects
window.addEventListener('pageshow', function() {
    document.body.classList.add('page-loaded');
});

// Add these styles to the document
(() => {
    const style = document.createElement('style');
    style.textContent = `
        body {
            opacity: 0;
            transition: opacity 0.5s ease;
        }
        
        body.page-loaded {
            opacity: 1;
        }
        
        @keyframes bounce {
            0%, 20%, 50%, 80%, 100% {transform: translateY(0);}
            40% {transform: translateY(-20px);}
            60% {transform: translateY(-10px);}
        }
        
        .bounce {
            animation: bounce 2s ease infinite;
        }
    `;
    document.head.appendChild(style);
})(); 