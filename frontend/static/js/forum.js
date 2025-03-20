document.addEventListener('DOMContentLoaded', function() {
    // Load forum categories
    loadForumCategories();
    
    // Setup new topic button
    const newTopicBtn = document.getElementById('newTopicBtn');
    if (newTopicBtn) {
        newTopicBtn.addEventListener('click', function() {
            // Check if user is logged in
            const token = localStorage.getItem('authToken');
            if (!token) {
                alert('You need to be logged in to create a topic.');
                window.location.href = '/login';
                return;
            }
            
            // Load categories for the dropdown
            loadCategoriesForDropdown();
        });
    }
    
    // Setup create topic button
    document.getElementById('createTopicBtn').addEventListener('click', createTopic);
});

let currentCategoryId = null;

function loadForumCategories() {
    fetch(`${API_URL}/forum/categories`)
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Failed to load categories');
            }
        })
        .then(data => {
            const container = document.getElementById('forumCategories');
            container.innerHTML = '';
            
            // Add "All Categories" button
            const allButton = document.createElement('button');
            allButton.type = 'button';
            allButton.className = 'list-group-item list-group-item-action active';
            allButton.setAttribute('data-category-id', 'all');
            allButton.innerHTML = `
                All Categories
                <span class="badge bg-primary float-end">All</span>
            `;
            container.appendChild(allButton);
            
            // Add category buttons
            data.forEach(category => {
                const button = document.createElement('button');
                button.type = 'button';
                button.className = 'list-group-item list-group-item-action';
                button.setAttribute('data-category-id', category.id);
                button.innerHTML = `
                    ${category.name}
                    <span class="badge bg-secondary float-end">${category.topic_count}</span>
                `;
                container.appendChild(button);
            });
            
            // Setup category filter
            setupCategoryFilter();
            
            // Load all topics initially
            loadTopics('all');
        })
        .catch(error => {
            console.error('Error loading categories:', error);
            document.getElementById('forumCategories').innerHTML = '<p class="text-danger">Failed to load categories.</p>';
        });
}

function setupCategoryFilter() {
    document.querySelectorAll('#forumCategories .list-group-item-action').forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons
            document.querySelectorAll('#forumCategories .list-group-item-action').forEach(b => {
                b.classList.remove('active');
            });
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Get category ID and load topics
            const categoryId = this.getAttribute('data-category-id');
            currentCategoryId = categoryId;
            
            // Update category title
            document.getElementById('categoryTitle').textContent = 
                categoryId === 'all' ? 'All Categories' : this.textContent.trim().split('\n')[0];
            
            // Load topics
            loadTopics(categoryId);
        });
    });
}

function loadTopics(categoryId) {
    const url = categoryId === 'all' 
        ? `${API_URL}/forum/topics` 
        : `${API_URL}/forum/categories/${categoryId}/topics`;
    
    fetch(url)
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Failed to load topics');
            }
        })
        .then(data => {
            const container = document.getElementById('topicsContainer');
            container.innerHTML = '';
            
            if (data.length === 0) {
                container.innerHTML = '<p class="text-muted text-center py-5">No topics found in this category. Be the first to start a discussion!</p>';
                return;
            }
            
            // Create table
            const table = document.createElement('table');
            table.className = 'table table-hover';
            
            // Create table header
            const thead = document.createElement('thead');
            thead.innerHTML = `
                <tr>
                    <th>Topic</th>
                    <th>Author</th>
                    <th>Replies</th>
                    <th>Created</th>
                </tr>
            `;
            table.appendChild(thead);
            
            // Create table body
            const tbody = document.createElement('tbody');
            
            data.forEach(topic => {
                const row = document.createElement('tr');
                row.className = 'topic-row';
                row.setAttribute('data-topic-id', topic.id);
                
                row.innerHTML = `
                    <td>
                        <h6 class="mb-0">${topic.title}</h6>
                        <small class="text-muted">${topic.content.substring(0, 50)}${topic.content.length > 50 ? '...' : ''}</small>
                    </td>
                    <td>${topic.author}</td>
                    <td>${topic.post_count}</td>
                    <td>${formatDate(topic.created_at)}</td>
                `;
                
                tbody.appendChild(row);
            });
            
            table.appendChild(tbody);
            container.appendChild(table);
            
            // Setup topic row click
            document.querySelectorAll('.topic-row').forEach(row => {
                row.addEventListener('click', function() {
                    const topicId = this.getAttribute('data-topic-id');
                    window.location.href = `/forum/topic/${topicId}`;
                });
            });
        })
        .catch(error => {
            console.error('Error loading topics:', error);
            document.getElementById('topicsContainer').innerHTML = '<p class="text-danger text-center py-5">Failed to load topics. Please try again later.</p>';
        });
}

function loadCategoriesForDropdown() {
    fetch(`${API_URL}/forum/categories`)
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Failed to load categories');
            }
        })
        .then(data => {
            const select = document.getElementById('topicCategory');
            select.innerHTML = '<option value="">Select a category</option>';
            
            data.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.name;
                
                if (currentCategoryId && currentCategoryId === category.id) {
                    option.selected = true;
                }
                
                select.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error loading categories for dropdown:', error);
        });
}

function createTopic() {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
        alert('You need to be logged in to create a topic.');
        window.location.href = '/login';
        return;
    }
    
    const category = document.getElementById('topicCategory').value;
    const title = document.getElementById('topicTitle').value;
    const content = document.getElementById('topicContent').value;
    
    if (!category || !title || !content) {
        alert('Please fill in all fields.');
        return;
    }
    
    fetch(`${API_URL}/forum/topics`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            category_id: category,
            title: title,
            content: content
        })
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('Failed to create topic');
        }
    })
    .then(data => {
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('newTopicModal'));
        modal.hide();
        
        // Reset form
        document.getElementById('topicTitle').value = '';
        document.getElementById('topicContent').value = '';
        
        // Redirect to the new topic
        window.location.href = `/forum/topic/${data.id}`;
    })
    .catch(error => {
        console.error('Error creating topic:', error);
        alert('Failed to create topic. Please try again.');
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