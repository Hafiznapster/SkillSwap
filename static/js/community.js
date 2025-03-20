// Community page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize AOS animations
    AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true
    });
    
    // Initialize interactive elements
    initializeTagInput();
    setupViewDiscussionLinks();
    setupReplyButtons();
    
    // Add event listener for the search input
    const searchInput = document.querySelector('.search-container input');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(searchDiscussions, 500));
    }
});

// Initialize tag input with auto-suggestions
function initializeTagInput() {
    const tagInput = document.getElementById('topicTags');
    if (!tagInput) return;
    
    // List of popular tags
    const popularTags = [
        'programming', 'java', 'python', 'javascript', 'html', 'css',
        'math', 'calculus', 'statistics', 'algebra', 'geometry',
        'language', 'english', 'spanish', 'french', 'german', 'chinese',
        'science', 'physics', 'chemistry', 'biology', 'engineering',
        'music', 'guitar', 'piano', 'singing', 'drums',
        'art', 'drawing', 'painting', 'design', 'photography',
        'business', 'marketing', 'finance', 'accounting', 'economics',
        'help', 'question', 'discussion', 'resource', 'tutorial'
    ];
    
    // We could enhance this with a library like tagify or select2 in a real application
    // For now, we'll just demonstrate the concept
    tagInput.setAttribute('list', 'tag-suggestions');
    
    const datalist = document.createElement('datalist');
    datalist.id = 'tag-suggestions';
    
    popularTags.forEach(tag => {
        const option = document.createElement('option');
        option.value = tag;
        datalist.appendChild(option);
    });
    
    tagInput.parentNode.appendChild(datalist);
}

// Set up click handlers for viewing discussion details
function setupViewDiscussionLinks() {
    document.querySelectorAll('.discussion-card .card-title').forEach(title => {
        title.style.cursor = 'pointer';
        title.addEventListener('click', function() {
            const discussionCard = this.closest('.discussion-card');
            viewDiscussionDetails(discussionCard);
        });
    });
}

// Set up reply buttons for comments
function setupReplyButtons() {
    document.querySelectorAll('.comment-actions a').forEach(link => {
        if (link.textContent === 'Reply') {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const commentItem = this.closest('.comment-item');
                const author = commentItem.querySelector('.comment-author').textContent;
                
                // Focus on comment textarea and add @mention
                const textarea = document.querySelector('.comment-area textarea');
                textarea.value = `@${author} `;
                textarea.focus();
            });
        }
    });
}

// View discussion details
function viewDiscussionDetails(discussionCard) {
    // In a real application, you would fetch the full discussion details
    // For now, we'll just use the data already in the card
    
    const title = discussionCard.querySelector('.card-title').textContent;
    const author = discussionCard.querySelector('.card-header h6').textContent;
    const time = discussionCard.querySelector('.discussion-meta').textContent;
    const content = discussionCard.querySelector('.card-text').innerHTML;
    const tags = Array.from(discussionCard.querySelectorAll('.skill-badge')).map(tag => tag.textContent);
    
    // If there are any pre-loaded comments, get those too
    const comments = Array.from(discussionCard.querySelectorAll('.comment-item')).map(comment => {
        return {
            author: comment.querySelector('.comment-author').textContent,
            text: comment.querySelector('.comment-text').textContent,
            time: comment.querySelector('.comment-actions span').textContent
        };
    });
    
    // Populate the discussion modal
    document.getElementById('discussionModalTitle').textContent = title;
    
    const contentHtml = `
        <div class="d-flex align-items-center mb-3">
            <div class="user-avatar me-3">
                <img src="https://via.placeholder.com/45" alt="${author}">
            </div>
            <div>
                <h6 class="mb-0">${author}</h6>
                <small class="text-muted">${time}</small>
            </div>
        </div>
        <div class="mb-4">
            ${content}
        </div>
        <div class="mb-4">
            ${tags.map(tag => `<span class="skill-badge">${tag}</span>`).join('')}
        </div>
        <hr>
        <div class="d-flex justify-content-between mb-4">
            <div>
                <button class="interaction-btn">
                    <i class="far fa-heart me-1"></i> Like
                </button>
                <button class="interaction-btn">
                    <i class="far fa-bookmark me-1"></i> Save
                </button>
            </div>
            <button class="interaction-btn">
                <i class="fas fa-share-alt me-1"></i> Share
            </button>
        </div>
        
        <h5 class="mb-3">Comments (${comments.length})</h5>
        
        ${comments.map(comment => `
            <div class="comment-item">
                <div class="user-avatar sm">
                    <img src="https://via.placeholder.com/35" alt="${comment.author}">
                </div>
                <div class="comment-content">
                    <div class="comment-author">${comment.author}</div>
                    <div class="comment-text">${comment.text}</div>
                    <div class="comment-actions">
                        <span>${comment.time}</span>
                        <a href="#">Like</a>
                        <a href="#">Reply</a>
                    </div>
                </div>
            </div>
        `).join('')}
    `;
    
    document.getElementById('discussionModalContent').innerHTML = contentHtml;
    
    // Show the modal
    const modal = new bootstrap.Modal(document.getElementById('viewDiscussionModal'));
    modal.show();
    
    // Set up event handlers for the newly created buttons
    setupReplyButtons();
    
    // Set up like buttons
    document.querySelectorAll('#viewDiscussionModal .interaction-btn').forEach(button => {
        if (button.textContent.trim().startsWith('Like')) {
            button.addEventListener('click', function() {
                toggleLike(this);
            });
        } else if (button.textContent.trim().startsWith('Save')) {
            button.addEventListener('click', function() {
                toggleSave(this);
            });
        }
    });
}

// Search discussions
function searchDiscussions(e) {
    const searchTerm = e.target.value.toLowerCase();
    
    // If search term is empty, show all discussions
    if (!searchTerm) {
        document.querySelectorAll('.discussion-card').forEach(card => {
            card.style.display = 'block';
        });
        return;
    }
    
    // Filter discussions based on search term
    document.querySelectorAll('.discussion-card').forEach(card => {
        const title = card.querySelector('.card-title').textContent.toLowerCase();
        const content = card.querySelector('.card-text').textContent.toLowerCase();
        const author = card.querySelector('.card-header h6').textContent.toLowerCase();
        const tags = Array.from(card.querySelectorAll('.skill-badge')).map(tag => tag.textContent.toLowerCase());
        
        // Check if the search term is found in any of these fields
        if (
            title.includes(searchTerm) || 
            content.includes(searchTerm) || 
            author.includes(searchTerm) || 
            tags.some(tag => tag.includes(searchTerm))
        ) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Debounce function to limit how often a function is called
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
} 