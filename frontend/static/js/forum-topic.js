document.addEventListener('DOMContentLoaded', function() {
    // Get topic ID from URL
    const topicId = window.location.pathname.split('/').pop();
    
    // Load topic data
    loadTopic(topicId);
    
    // Load posts
    loadPosts(topicId);
    
    // Setup reply form
    document.getElementById('replyForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Check if user is logged in
        const token = localStorage.getItem('authToken');
        if (!token) {
            alert('You need to be logged in to reply to topics.');
            window.location.href = '/login';
            return;
        }
        
        createReply(topicId);
    });
});

function loadTopic(topicId) {
    fetch(`${API_URL}/forum/topics/${topicId}`)
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Failed to load topic');
            }
        })
        .then(data => {
            document.getElementById('topicTitle').textContent = data.title;
            document.getElementById('topicAuthor').textContent = data.author;
            document.getElementById('topicDate').textContent = formatDate(data.created_at);
            document.getElementById('topicContent').innerHTML = formatContent(data.content);
        })
        .catch(error => {
            console.error('Error loading topic:', error);
            document.getElementById('topicContent').innerHTML = '<p class="text-danger">Failed to load topic. Please try again later.</p>';
        });
}

function loadPosts(topicId) {
    fetch(`${API_URL}/forum/topics/${topicId}/posts`)
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Failed to load posts');
            }
        })
        .then(data => {
            const container = document.getElementById('postsContainer');
            
            if (data.length === 0) {
                container.innerHTML = '<p class="text-muted text-center py-3">No replies yet. Be the first to reply!</p>';
                return;
            }
            
            container.innerHTML = '';
            
            data.forEach((post, index) => {
                const postElement = document.createElement('div');
                postElement.className = 'mb-4 pb-4 border-bottom';
                
                postElement.innerHTML = `
                    <div class="d-flex">
                        <div class="flex-shrink-0 me-3">
                            <img src="/static/images/default-profile.png" class="rounded-circle" width="50" height="50" alt="${post.author}">
                        </div>
                        <div class="flex-grow-1">
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <h5 class="mb-0">${post.author}</h5>
                                <small class="text-muted">${formatDate(post.created_at)}</small>
                            </div>
                            <div class="post-content">
                                ${formatContent(post.content)}
                            </div>
                        </div>
                    </div>
                `;
                
                container.appendChild(postElement);
            });
        })
        .catch(error => {
            console.error('Error loading posts:', error);
            document.getElementById('postsContainer').innerHTML = '<p class="text-danger">Failed to load replies. Please try again later.</p>';
        });
}

function createReply(topicId) {
    const token = localStorage.getItem('authToken');
    const content = document.getElementById('replyContent').value;
    
    if (!content.trim()) {
        alert('Please enter your reply.');
        return;
    }
    
    fetch(`${API_URL}/forum/posts`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            topic_id: topicId,
            content: content
        })
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('Failed to create reply');
        }
    })
    .then(data => {
        // Reset form
        document.getElementById('replyContent').value = '';
        
        // Reload posts
        loadPosts(topicId);
        
        // Show success message
        showAlert('Reply posted successfully!', 'success');
    })
    .catch(error => {
        console.error('Error creating reply:', error);
        showAlert('Failed to post reply. Please try again.', 'danger');
    });
}

function formatContent(content) {
    // Simple formatting: replace new lines with <br> tags
    return content.replace(/\n/g, '<br>');
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