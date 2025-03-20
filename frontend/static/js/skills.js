document.addEventListener('DOMContentLoaded', function() {
    // Load skills data
    loadSkills();
    
    // Load skill categories for filter
    loadCategories();
    
    // Setup event listeners
    document.getElementById('skillSearch').addEventListener('input', filterSkills);
    document.getElementById('searchBtn').addEventListener('click', filterSkills);
    
    // Setup category filter
    document.getElementById('skillCategories').addEventListener('click', function(e) {
        if (e.target.classList.contains('list-group-item-action')) {
            // Remove active class from all items
            document.querySelectorAll('#skillCategories .list-group-item-action').forEach(item => {
                item.classList.remove('active');
            });
            
            // Add active class to clicked item
            e.target.classList.add('active');
            
            // Filter skills
            filterSkills();
        }
    });
    
    // Setup add skill form
    document.getElementById('saveSkillBtn').addEventListener('click', addNewSkill);
});

let allSkills = [];

function loadSkills() {
    fetch(`${API_URL}/skills`)
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Failed to load skills');
            }
        })
        .then(data => {
            allSkills = data;
            displaySkills(data);
        })
        .catch(error => {
            console.error('Error loading skills:', error);
            document.getElementById('skillsContainer').innerHTML = `
                <div class="col-12 text-center py-5">
                    <p class="text-danger">Failed to load skills. Please try again later.</p>
                </div>
            `;
        });
}

function displaySkills(skills) {
    const container = document.getElementById('skillsContainer');
    container.innerHTML = '';
    
    if (skills.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <p class="text-muted">No skills found. Try adjusting your search.</p>
            </div>
        `;
        return;
    }
    
    skills.forEach(skill => {
        const skillCard = document.createElement('div');
        skillCard.className = 'col-md-4 mb-4';
        
        skillCard.innerHTML = `
            <div class="card h-100">
                <div class="card-body">
                    <h5 class="card-title">${skill.name}</h5>
                    <h6 class="card-subtitle mb-2 text-muted">${skill.category}</h6>
                    <p class="card-text">${skill.description || 'No description available.'}</p>
                </div>
                <div class="card-footer bg-transparent d-flex justify-content-between">
                    <button class="btn btn-sm btn-outline-primary add-teaching-btn" data-skill-id="${skill.id}">
                        I can teach this
                    </button>
                    <button class="btn btn-sm btn-outline-success add-learning-btn" data-skill-id="${skill.id}">
                        I want to learn this
                    </button>
                </div>
            </div>
        `;
        
        container.appendChild(skillCard);
    });
    
    // Setup buttons
    setupSkillButtons();
}

function loadCategories() {
    fetch(`${API_URL}/skills/categories`)
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Failed to load categories');
            }
        })
        .then(data => {
            const container = document.getElementById('skillCategories');
            
            // Keep the "All Skills" button
            const allButton = container.querySelector('.list-group-item-action');
            container.innerHTML = '';
            container.appendChild(allButton);
            
            data.forEach(category => {
                const button = document.createElement('button');
                button.type = 'button';
                button.className = 'list-group-item list-group-item-action';
                button.setAttribute('data-category', category);
                button.textContent = category;
                
                container.appendChild(button);
            });
        })
        .catch(error => {
            console.error('Error loading categories:', error);
        });
}

function filterSkills() {
    const searchTerm = document.getElementById('skillSearch').value.toLowerCase();
    const selectedCategory = document.querySelector('#skillCategories .active').getAttribute('data-category');
    
    const filteredSkills = allSkills.filter(skill => {
        const nameMatch = skill.name.toLowerCase().includes(searchTerm);
        const descMatch = skill.description ? skill.description.toLowerCase().includes(searchTerm) : false;
        const categoryMatch = selectedCategory === 'all' || skill.category === selectedCategory;
        
        return (nameMatch || descMatch) && categoryMatch;
    });
    
    displaySkills(filteredSkills);
}

function addNewSkill() {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
        alert('You need to be logged in to add skills.');
        window.location.href = '/login';
        return;
    }
    
    const name = document.getElementById('skillName').value;
    const category = document.getElementById('skillCategory').value;
    const description = document.getElementById('skillDescription').value;
    
    if (!name || !category) {
        alert('Skill name and category are required.');
        return;
    }
    
    fetch(`${API_URL}/skills`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: name,
            category: category,
            description: description
        })
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('Failed to add skill');
        }
    })
    .then(data => {
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('addSkillModal'));
        modal.hide();
        
        // Reset form
        document.getElementById('skillName').value = '';
        document.getElementById('skillCategory').value = '';
        document.getElementById('skillDescription').value = '';
        
        // Reload skills
        loadSkills();
        loadCategories();
        
        // Show success message
        showAlert('Skill added successfully!', 'success');
    })
    .catch(error => {
        console.error('Error adding skill:', error);
        showAlert('Failed to add skill. Please try again.', 'danger');
    });
}

function setupSkillButtons() {
    // Teaching buttons
    document.querySelectorAll('.add-teaching-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const skillId = this.getAttribute('data-skill-id');
            addSkillToProfile(skillId, 'teaching');
        });
    });
    
    // Learning buttons
    document.querySelectorAll('.add-learning-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const skillId = this.getAttribute('data-skill-id');
            addSkillToProfile(skillId, 'learning');
        });
    });
}

function addSkillToProfile(skillId, type) {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
        alert('You need to be logged in to add skills to your profile.');
        window.location.href = '/login';
        return;
    }
    
    // Determine proficiency level
    let proficiency = 'beginner';
    if (type === 'teaching') {
        proficiency = prompt('What is your proficiency level? (beginner, intermediate, advanced)', 'intermediate');
        if (!proficiency) return; // User cancelled
    }
    
    fetch(`${API_URL}/user/skills/${type}`, {
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
        showAlert(`Skill added to your ${type} list!`, 'success');
    })
    .catch(error => {
        console.error(`Error adding ${type} skill:`, error);
        showAlert(`Failed to add skill. Please try again.`, 'danger');
    });
}

function showAlert(message, type) {
    const alertContainer = document.createElement('div');
    alertContainer.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 end-0 m-3`;
    alertContainer.setAttribute('role', 'alert');
    alertContainer.style.zIndex = '9999';
    
    alertContainer.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    document.body.appendChild(alertContainer);
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        alertContainer.remove();
    }, 5000);
} 