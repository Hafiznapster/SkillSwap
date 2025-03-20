document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.href = '/login';
        return;
    }
    
    // Load user profile data
    loadUserProfile();
    
    // Load teaching and learning skills
    loadTeachingSkills();
    loadLearningSkills();
    
    // Load time bank balance
    loadTimeBankBalance();
    
    // Load recent activity
    loadRecentActivity();
    
    // Setup event listeners for modals
    setupProfileEditModal();
    setupSkillsModals();
});

function loadUserProfile() {
    const token = localStorage.getItem('authToken');
    
    fetch(`${API_URL}/user/profile`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('Failed to load profile');
        }
    })
    .then(data => {
        // Update profile information
        document.getElementById('profileUsername').textContent = data.username;
        document.getElementById('profileEmail').textContent = data.email;
        
        // Set profile picture
        if (data.profile_picture) {
            document.getElementById('profilePicture').src = data.profile_picture;
        }
        
        // Populate edit form
        document.getElementById('editUsername').value = data.username;
        document.getElementById('editBio').value = data.bio || '';
    })
    .catch(error => {
        console.error('Error loading profile:', error);
        showAlert('Failed to load profile data.', 'danger');
    });
}

function loadTeachingSkills() {
    const token = localStorage.getItem('authToken');
    
    fetch(`${API_URL}/user/skills/teaching`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('Failed to load teaching skills');
        }
    })
    .then(data => {
        const container = document.getElementById('teachingSkills');
        container.innerHTML = '';
        
        if (data.length === 0) {
            container.innerHTML = '<p class="text-muted">You haven\'t added any teaching skills yet.</p>';
            return;
        }
        
        data.forEach(skill => {
            const skillElement = document.createElement('div');
            skillElement.className = 'card mb-2';
            
            skillElement.innerHTML = `
                <div class="card-body d-flex justify-content-between align-items-center">
                    <div>
                        <h6 class="mb-0">${skill.name}</h6>
                        <span class="badge bg-${getProficiencyColor(skill.proficiency_level)}">${skill.proficiency_level}</span>
                    </div>
                    <button class="btn btn-sm btn-outline-danger remove-skill-btn" data-skill-id="${skill.id}" data-skill-type="teaching">
                        <i class="bi bi-x-circle"></i>
                    </button>
                </div>
            `;
            
            container.appendChild(skillElement);
        });
        
        // Setup remove buttons
        document.querySelectorAll('.remove-skill-btn[data-skill-type="teaching"]').forEach(btn => {
            btn.addEventListener('click', function() {
                removeSkill(this.dataset.skillId, 'teaching');
            });
        });
    })
    .catch(error => {
        console.error('Error loading teaching skills:', error);
        document.getElementById('teachingSkills').innerHTML = '<p class="text-danger">Failed to load skills. Please try again later.</p>';
    });
}

function loadLearningSkills() {
    const token = localStorage.getItem('authToken');
    
    fetch(`${API_URL}/user/skills/learning`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('Failed to load learning skills');
        }
    })
    .then(data => {
        const container = document.getElementById('learningSkills');
        container.innerHTML = '';
        
        if (data.length === 0) {
            container.innerHTML = '<p class="text-muted">You haven\'t added any learning skills yet.</p>';
            return;
        }
        
        data.forEach(skill => {
            const skillElement = document.createElement('div');
            skillElement.className = 'card mb-2';
            
            skillElement.innerHTML = `
                <div class="card-body d-flex justify-content-between align-items-center">
                    <div>
                        <h6 class="mb-0">${skill.name}</h6>
                        <span class="badge bg-${getProficiencyColor(skill.proficiency_level)}">${skill.proficiency_level}</span>
                    </div>
                    <button class="btn btn-sm btn-outline-danger remove-skill-btn" data-skill-id="${skill.id}" data-skill-type="learning">
                        <i class="bi bi-x-circle"></i>
                    </button>
                </div>
            `;
            
            container.appendChild(skillElement);
        });
        
        // Setup remove buttons
        document.querySelectorAll('.remove-skill-btn[data-skill-type="learning"]').forEach(btn => {
            btn.addEventListener('click', function() {
                removeSkill(this.dataset.skillId, 'learning');
            });
        });
    })
    .catch(error => {
        console.error('Error loading learning skills:', error);
        document.getElementById('learningSkills').innerHTML = '<p class="text-danger">Failed to load skills. Please try again later.</p>';
    });
}

function loadTimeBankBalance() {
    const token = localStorage.getItem('authToken');
    
    fetch(`${API_URL}/timebank/balance`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('Failed to load time bank data');
        }
    })
    .then(data => {
        document.getElementById('timeBankBalance').textContent = data.balance.toFixed(1);
        
        // Load recent transactions
        if (data.recent_transactions && data.recent_transactions.length > 0) {
            const transactionsContainer = document.getElementById('recentTransactions');
            transactionsContainer.innerHTML = '';
            
            data.recent_transactions.slice(0, 3).forEach(transaction => {
                const transactionElement = document.createElement('div');
                transactionElement.className = 'mb-2 border-bottom pb-2';
                
                transactionElement.innerHTML = `
                    <div class="d-flex justify-content-between">
                        <span>${transaction.description}</span>
                        <span class="text-${transaction.hours > 0 ? 'success' : 'danger'}">${transaction.hours > 0 ? '+' : ''}${transaction.hours.toFixed(1)}</span>
                    </div>
                    <small class="text-muted">${formatDate(transaction.created_at)}</small>
                `;
                
                transactionsContainer.appendChild(transactionElement);
            });
        } else {
            document.getElementById('recentTransactions').innerHTML = '<p class="text-muted">No recent transactions</p>';
        }
    })
    .catch(error => {
        console.error('Error loading time bank data:', error);
        document.getElementById('timeBankBalance').textContent = '0.0';
        document.getElementById('recentTransactions').innerHTML = '<p class="text-danger">Failed to load time bank data.</p>';
    });
}

function loadRecentActivity() {
    const token = localStorage.getItem('authToken');
    
    fetch(`${API_URL}/user/activity`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('Failed to load activity data');
        }
    })
    .then(data => {
        const activityContainer = document.getElementById('recentActivity');
        activityContainer.innerHTML = '';
        
        if (!data.activities || data.activities.length === 0) {
            activityContainer.innerHTML = '<p class="text-muted">No recent activity</p>';
            return;
        }
        
        data.activities.forEach(activity => {
            const activityElement = document.createElement('div');
            activityElement.className = 'mb-3 pb-3 border-bottom';
            
            activityElement.innerHTML = `
                <div class="d-flex">
                    <div class="activity-icon me-3">
                        <i class="bi ${getActivityIcon(activity.type)} fs-4"></i>
                    </div>
                    <div>
                        <p class="mb-1">${activity.message}</p>
                        <small class="text-muted">${formatDate(activity.created_at)}</small>
                    </div>
                </div>
            `;
            
            activityContainer.appendChild(activityElement);
        });
    })
    .catch(error => {
        console.error('Error loading activity data:', error);
        document.getElementById('recentActivity').innerHTML = '<p class="text-danger">Failed to load activity data.</p>';
    });
}

function setupProfileEditModal() {
    const saveBtn = document.getElementById('saveProfileBtn');
    
    if (saveBtn) {
        saveBtn.addEventListener('click', function() {
            const token = localStorage.getItem('authToken');
            const username = document.getElementById('editUsername').value;
            const bio = document.getElementById('editBio').value;
            
            // Create form data to handle file upload
            const formData = new FormData();
            formData.append('username', username);
            formData.append('bio', bio);
            
            const profilePicInput = document.getElementById('profilePictureUpload');
            if (profilePicInput.files.length > 0) {
                formData.append('profile_picture', profilePicInput.files[0]);
            }
            
            fetch(`${API_URL}/user/profile`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            })
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error('Failed to update profile');
                }
            })
            .then(data => {
                // Close modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('editProfileModal'));
                modal.hide();
                
                // Reload profile data
                loadUserProfile();
                
                showAlert('Profile updated successfully!', 'success');
            })
            .catch(error => {
                console.error('Error updating profile:', error);
                showAlert('Failed to update profile. Please try again.', 'danger');
            });
        });
    }
}

function setupSkillsModals() {
    // Load skills for dropdowns
    loadSkillsForDropdowns();
    
    // Teaching skill form submission
    const saveTeachingBtn = document.getElementById('saveTeachingSkillBtn');
    if (saveTeachingBtn) {
        saveTeachingBtn.addEventListener('click', function() {
            const skillId = document.getElementById('teachingSkill').value;
            const proficiency = document.getElementById('teachingProficiency').value;
            
            addSkill(skillId, proficiency, 'teaching');
        });
    }
    
    // Learning skill form submission
    const saveLearningBtn = document.getElementById('saveLearningSkillBtn');
    if (saveLearningBtn) {
        saveLearningBtn.addEventListener('click', function() {
            const skillId = document.getElementById('learningSkill').value;
            const proficiency = document.getElementById('learningProficiency').value;
            
            addSkill(skillId, proficiency, 'learning');
        });
    }
}

function loadSkillsForDropdowns() {
    fetch(`${API_URL}/skills`)
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Failed to load skills');
            }
        })
        .then(data => {
            const teachingSelect = document.getElementById('teachingSkill');
            const learningSelect = document.getElementById('learningSkill');
            
            teachingSelect.innerHTML = '<option value="">Select a skill</option>';
            learningSelect.innerHTML = '<option value="">Select a skill</option>';
            
            data.forEach(skill => {
                const option1 = document.createElement('option');
                option1.value = skill.id;
                option1.textContent = `${skill.name} (${skill.category})`;
                
                const option2 = document.createElement('option');
                option2.value = skill.id;
                option2.textContent = `${skill.name} (${skill.category})`;
                
                teachingSelect.appendChild(option1);
                learningSelect.appendChild(option2);
            });
        })
        .catch(error => {
            console.error('Error loading skills:', error);
        });
}

function addSkill(skillId, proficiency, type) {
    const token = localStorage.getItem('authToken');
    let url = `${API_URL}/user/skills/${type}`;
    
    fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            skill_id: skillId,
            proficiency_level: proficiency
        })
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error(`Failed to add ${type} skill`);
        }
    })
    .then(data => {
        // Close modal
        const modalId = type === 'teaching' ? 'addTeachingSkillModal' : 'addLearningSkillModal';
        const modal = bootstrap.Modal.getInstance(document.getElementById(modalId));
        modal.hide();
        
        // Reload skills
        if (type === 'teaching') {
            loadTeachingSkills();
        } else {
            loadLearningSkills();
        }
        
        showAlert(`Skill added to your ${type} list!`, 'success');
    })
    .catch(error => {
        console.error(`Error adding ${type} skill:`, error);
        showAlert(`Failed to add skill. Please try again.`, 'danger');
    });
}

function removeSkill(skillId, type) {
    if (!confirm(`Are you sure you want to remove this ${type} skill?`)) {
        return;
    }
    
    const token = localStorage.getItem('authToken');
    
    fetch(`${API_URL}/user/skills/${type}/${skillId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (response.ok) {
            // Reload skills
            if (type === 'teaching') {
                loadTeachingSkills();
            } else {
                loadLearningSkills();
            }
            
            showAlert('Skill removed successfully!', 'success');
        } else {
            throw new Error('Failed to remove skill');
        }
    })
    .catch(error => {
        console.error('Error removing skill:', error);
        showAlert('Failed to remove skill. Please try again.', 'danger');
    });
}

// Helper functions
function getProficiencyColor(level) {
    switch(level) {
        case 'beginner': return 'info';
        case 'intermediate': return 'primary';
        case 'advanced': return 'success';
        default: return 'secondary';
    }
}

function getActivityIcon(type) {
    switch(type) {
        case 'session': return 'bi-calendar-check';
        case 'skill': return 'bi-award';
        case 'rating': return 'bi-star-fill';
        case 'timebank': return 'bi-clock-history';
        default: return 'bi-bell';
    }
}

function getActivityTitle(type) {
    switch(type) {
        case 'session': return 'Session Activity';
        case 'skill': return 'Skill Update';
        case 'rating': return 'New Rating';
        case 'timebank': return 'Time Bank Transaction';
        default: return 'Notification';
    }
}

function getSkillIconClass(category) {
    // Map skill categories to appropriate Font Awesome icons
    category = (category || '').toLowerCase();
    
    const iconMap = {
        'programming': 'fas fa-code',
        'design': 'fas fa-paint-brush',
        'music': 'fas fa-music',
        'art': 'fas fa-palette',
        'languages': 'fas fa-language',
        'mathematics': 'fas fa-calculator',
        'science': 'fas fa-flask',
        'business': 'fas fa-briefcase',
        'cooking': 'fas fa-utensils',
        'sports': 'fas fa-running',
        'photography': 'fas fa-camera',
        'writing': 'fas fa-pen-fancy',
        'technology': 'fas fa-laptop-code',
        'academic': 'fas fa-graduation-cap'
    };
    
    // Return the mapped icon or a default icon
    return iconMap[category] || 'fas fa-lightbulb';
}

function animateTextChange(elementId, newText) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    // Fade out
    element.style.transition = 'opacity 0.3s ease';
    element.style.opacity = 0;
    
    // Change text and fade in
    setTimeout(() => {
        element.textContent = newText;
        element.style.opacity = 1;
    }, 300);
}

function animateCounter(elementId, targetValue) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const startValue = parseFloat(element.textContent) || 0;
    const duration = 1500;
    const frameRate = 60;
    const totalFrames = duration / (1000 / frameRate);
    const increment = (targetValue - startValue) / totalFrames;
    
    let currentValue = startValue;
    let frame = 0;
    
    const animation = setInterval(() => {
        frame++;
        currentValue += increment;
        
        // Round to 1 decimal place
        const displayValue = Math.round(currentValue * 10) / 10;
        
        // Update the element
        element.textContent = displayValue.toFixed(1);
        
        // Stop the animation when done
        if (frame >= totalFrames) {
            clearInterval(animation);
            element.textContent = targetValue.toFixed(1);
        }
    }, 1000 / frameRate);
}

function showConfirmDialog(title, message, onConfirm) {
    // Create modal element
    const modalId = 'dynamicConfirmModal';
    let modalElement = document.getElementById(modalId);
    
    if (modalElement) {
        // If it already exists, remove it first
        modalElement.remove();
    }
    
    // Create new modal
    modalElement = document.createElement('div');
    modalElement.className = 'modal fade';
    modalElement.id = modalId;
    modalElement.tabIndex = '-1';
    modalElement.setAttribute('aria-labelledby', `${modalId}Label`);
    modalElement.setAttribute('aria-hidden', 'true');
    
    modalElement.innerHTML = `
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header bg-danger text-white">
                    <h5 class="modal-title" id="${modalId}Label">
                        <i class="fas fa-exclamation-triangle me-2"></i> ${title}
                    </h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <p>${message}</p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-danger" id="${modalId}ConfirmBtn">
                        <i class="fas fa-trash-alt me-2"></i> Remove
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Add to document
    document.body.appendChild(modalElement);
    
    // Initialize modal
    const modal = new bootstrap.Modal(modalElement);
    
    // Setup confirm button
    document.getElementById(`${modalId}ConfirmBtn`).addEventListener('click', function() {
        modal.hide();
        onConfirm();
    });
    
    // Show modal
    modal.show();
    
    // Remove from DOM when hidden
    modalElement.addEventListener('hidden.bs.modal', function() {
        modalElement.remove();
    });
}

function showAlert(message, type) {
    // Create toast container if it doesn't exist
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
        toastContainer.style.zIndex = '9999';
        document.body.appendChild(toastContainer);
    }
    
    // Create toast element
    const toastEl = document.createElement('div');
    toastEl.className = `toast align-items-center text-white bg-${type} border-0`;
    toastEl.setAttribute('role', 'alert');
    toastEl.setAttribute('aria-live', 'assertive');
    toastEl.setAttribute('aria-atomic', 'true');
    
    // Toast content
    toastEl.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                <i class="fas ${getAlertIcon(type)} me-2"></i> ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
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
        this.remove();
    });
}

function getAlertIcon(type) {
    switch(type) {
        case 'success': return 'fa-check-circle';
        case 'danger': return 'fa-exclamation-circle';
        case 'warning': return 'fa-exclamation-triangle';
        case 'info': return 'fa-info-circle';
        default: return 'fa-bell';
    }
} 