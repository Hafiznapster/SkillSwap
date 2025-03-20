document.addEventListener('DOMContentLoaded', function() {
    // Load skills for filter
    loadSkills();
    
    // Load resources
    loadResources();
    
    // Setup search
    document.getElementById('searchResourceBtn').addEventListener('click', filterResources);
    document.getElementById('resourceSearch').addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            filterResources();
        }
    });
    
    // Setup skill filter
    document.getElementById('skillFilter').addEventListener('click', function(e) {
        if (e.target.classList.contains('list-group-item-action')) {
            // Remove active class from all items
            document.querySelectorAll('#skillFilter .list-group-item-action').forEach(item => {
                item.classList.remove('active');
            });
            
            // Add active class to clicked item
            e.target.classList.add('active');
            
            // Filter resources
            filterResources();
        }
    });
    
    // Setup resource type filters
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', filterResources);
    });
    
    // Setup upload resource button
    document.getElementById('uploadResourceBtn').addEventListener('click', uploadResource);
});

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
            // Populate skill filter
            const container = document.getElementById('skillFilter');
            
            // Keep the "All Skills" button
            const allButton = container.querySelector('.list-group-item-action');
            container.innerHTML = '';
            container.appendChild(allButton);
            
            // Group skills by category
            const categories = {};
            data.forEach(skill => {
                if (!categories[skill.category]) {
                    categories[skill.category] = [];
                }
                categories[skill.category].push(skill);
            });
            
            // Add skills by category
            Object.keys(categories).sort().forEach(category => {
                const categoryHeader = document.createElement('div');
                categoryHeader.className = 'list-group-item list-group-item-secondary';
                categoryHeader.textContent = category;
                container.appendChild(categoryHeader);
                
                categories[category].forEach(skill => {
                    const button = document.createElement('button');
                    button.type = 'button';
                    button.className = 'list-group-item list-group-item-action';
                    button.setAttribute('data-skill-id', skill.id);
                    button.textContent = skill.name;
                    container.appendChild(button);
                });
            });
            
            // Populate resource upload dropdown
            const resourceSkillSelect = document.getElementById('resourceSkill');
            resourceSkillSelect.innerHTML = '<option value="">Select a skill</option>';
            
            Object.keys(categories).sort().forEach(category => {
                const optgroup = document.createElement('optgroup');
                optgroup.label = category;
                
                categories[category].forEach(skill => {
                    const option = document.createElement('option');
                    option.value = skill.id;
                    option.textContent = skill.name;
                    optgroup.appendChild(option);
                });
                
                resourceSkillSelect.appendChild(optgroup);
            });
        })
        .catch(error => {
            console.error('Error loading skills:', error);
        });
}

let allResources = [];

function loadResources() {
    fetch(`${API_URL}/resources`)
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Failed to load resources');
            }
        })
        .then(data => {
            allResources = data;
            displayResources(data);
        })
        .catch(error => {
            console.error('Error loading resources:', error);
            document.getElementById('resourcesContainer').innerHTML = `
                <div class="alert alert-danger">
                    Failed to load resources. Please try again later.
                </div>
            `;
        });
}

function displayResources(resources) {
    const container = document.getElementById('resourcesContainer');
    container.innerHTML = '';
    
    if (resources.length === 0) {
        container.innerHTML = `
            <div class="alert alert-info">
                No resources found. Try adjusting your search criteria or upload some resources!
            </div>
        `;
        return;
    }
    
    // Create resource cards
    const row = document.createElement('div');
    row.className = 'row';
    
    resources.forEach(resource => {
        const card = document.createElement('div');
        card.className = 'col-md-4 mb-4';
        
        let resourceIcon;
        switch(resource.resource_type) {
            case 'document': resourceIcon = 'bi-file-earmark-text'; break;
            case 'video': resourceIcon = 'bi-file-earmark-play'; break;
            case 'link': resourceIcon = 'bi-link-45deg'; break;
            default: resourceIcon = 'bi-file-earmark';
        }
        
        card.innerHTML = `
            <div class="card h-100">
                <div class="card-header d-flex align-items-center">
                    <i class="bi ${resourceIcon} me-2"></i>
                    <span>${resource.resource_type.charAt(0).toUpperCase() + resource.resource_type.slice(1)}</span>
                </div>
                <div class="card-body">
                    <h5 class="card-title">${resource.title}</h5>
                    <h6 class="card-subtitle mb-2 text-muted">${resource.skill}</h6>
                    <p class="card-text">${resource.description || 'No description available.'}</p>
                </div>
                <div class="card-footer bg-transparent">
                    <div class="d-flex justify-content-between align-items-center">
                        <small class="text-muted">Shared by ${resource.author}</small>
                        <a href="${resource.file_path}" class="btn btn-sm btn-primary" target="_blank">
                            <i class="bi bi-download"></i> Download
                        </a>
                    </div>
                </div>
            </div>
        `;
        
        row.appendChild(card);
    });
    
    container.appendChild(row);
}

function filterResources() {
    const searchTerm = document.getElementById('resourceSearch').value.toLowerCase();
    const selectedSkillElement = document.querySelector('#skillFilter .active');
    const selectedSkillId = selectedSkillElement ? selectedSkillElement.getAttribute('data-skill-id') : 'all';
    
    // Get checked resource types
    const checkedTypes = [];
    document.querySelectorAll('input[type="checkbox"]:checked').forEach(checkbox => {
        checkedTypes.push(checkbox.value);
    });
    
    const filteredResources = allResources.filter(resource => {
        // Search term filter
        const titleMatch = resource.title.toLowerCase().includes(searchTerm);
        const descMatch = resource.description ? resource.description.toLowerCase().includes(searchTerm) : false;
        const authorMatch = resource.author.toLowerCase().includes(searchTerm);
        const searchMatch = titleMatch || descMatch || authorMatch;
        
        // Skill filter
        const skillMatch = selectedSkillId === 'all' || resource.skill_id === parseInt(selectedSkillId);
        
        // Type filter
        const typeMatch = checkedTypes.includes(resource.resource_type);
        
        return searchMatch && skillMatch && typeMatch;
    });
    
    displayResources(filteredResources);
}

function uploadResource() {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
        alert('You need to be logged in to upload resources.');
        window.location.href = '/login';
        return;
    }
    
    const title = document.getElementById('resourceTitle').value;
    const skillId = document.getElementById('resourceSkill').value;
    const resourceType = document.getElementById('resourceType').value;
    const description = document.getElementById('resourceDescription').value;
    const fileInput = document.getElementById('resourceFile');
    
    if (!title || !skillId || !resourceType || !fileInput.files[0]) {
        alert('Please fill in all required fields and select a file.');
        return;
    }
    
    const formData = new FormData();
    formData.append('title', title);
    formData.append('skill_id', skillId);
    formData.append('resource_type', resourceType);
    formData.append('description', description);
    formData.append('file', fileInput.files[0]);
    
    fetch(`${API_URL}/resources`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: formData
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('Failed to upload resource');
        }
    })
    .then(data => {
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('uploadResourceModal'));
        modal.hide();
        
        // Reset form
        document.getElementById('uploadResourceForm').reset();
        
        // Reload resources
        loadResources();
        
        // Show success message
        showAlert('Resource uploaded successfully!', 'success');
    })
    .catch(error => {
        console.error('Error uploading resource:', error);
        showAlert('Failed to upload resource. Please try again.', 'danger');
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