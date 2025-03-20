document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.href = '/login';
        return;
    }
    
    // Load matches
    loadMatches();
    
    // Setup request session modal
    document.getElementById('sendRequestBtn').addEventListener('click', requestSession);
});

function loadMatches() {
    const token = localStorage.getItem('authToken');
    
    fetch(`${API_URL}/match`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('Failed to load matches');
        }
    })
    .then(data => {
        // Filter matches by type
        const teachingMatches = data.filter(match => match.match_type === 'you_teach');
        const learningMatches = data.filter(match => match.match_type === 'you_learn');
        
        // Display teaching matches
        displayMatches(teachingMatches, 'teachingMatches', 'Teaching');
        
        // Display learning matches
        displayMatches(learningMatches, 'learningMatches', 'Learning');
    })
    .catch(error => {
        console.error('Error loading matches:', error);
        document.getElementById('teachingMatches').innerHTML = '<p class="text-danger">Failed to load matches.</p>';
        document.getElementById('learningMatches').innerHTML = '<p class="text-danger">Failed to load matches.</p>';
    });
}

function displayMatches(matches, containerId, type) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    if (matches.length === 0) {
        container.innerHTML = `<p class="text-muted">No ${type.toLowerCase()} matches found.</p>`;
        return;
    }
    
    matches.forEach(match => {
        const matchElement = document.createElement('div');
        matchElement.className = 'card mb-3';
        
        matchElement.innerHTML = `
            <div class="card-body">
                <h5 class="card-title">${match.username}</h5>
                <h6 class="card-subtitle mb-2 text-muted">${match.skill_name}</h6>
                <div class="d-flex justify-content-between align-items-center mt-3">
                    <button class="btn btn-sm btn-primary view-profile-btn" data-user-id="${match.user_id}">
                        View Profile
                    </button>
                    ${type === 'Learning' ? 
                        `<button class="btn btn-sm btn-success request-session-btn" 
                            data-teacher-id="${match.user_id}" 
                            data-skill-id="${match.skill_id}" 
                            data-skill-name="${match.skill_name}"
                            data-username="${match.username}">
                            Request Session
                        </button>` : ''}
                </div>
            </div>
        `;
        
        container.appendChild(matchElement);
    });
    
    // Setup buttons
    setupMatchButtons(type);
}

function setupMatchButtons(type) {
    // View profile buttons
    document.querySelectorAll('.view-profile-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const userId = this.getAttribute('data-user-id');
            window.location.href = `/user/${userId}`;
        });
    });
    
    // Request session buttons (only for learning matches)
    if (type === 'Learning') {
        document.querySelectorAll('.request-session-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const teacherId = this.getAttribute('data-teacher-id');
                const skillId = this.getAttribute('data-skill-id');
                const skillName = this.getAttribute('data-skill-name');
                const username = this.getAttribute('data-username');
                
                // Populate modal
                document.getElementById('teacherId').value = teacherId;
                document.getElementById('skillId').value = skillId;
                
                // Update modal title
                document.getElementById('requestSessionModalLabel').textContent = `Request Session with ${username} for ${skillName}`;
                
                // Show modal
                const modal = new bootstrap.Modal(document.getElementById('requestSessionModal'));
                modal.show();
            });
        });
    }
}

function requestSession() {
    const token = localStorage.getItem('authToken');
    
    // Get form data
    const teacherId = document.getElementById('teacherId').value;
    const skillId = document.getElementById('skillId').value;
    const sessionDate = document.getElementById('sessionDate').value;
    const startTime = document.getElementById('startTime').value;
    const endTime = document.getElementById('endTime').value;
    const location = document.getElementById('location').value;
    const notes = document.getElementById('notes').value;
    
    // Validate form
    if (!sessionDate || !startTime || !endTime) {
        alert('Please fill in all required fields.');
        return;
    }
    
    // Combine date and time
    const startDateTime = `${sessionDate}T${startTime}:00`;
    const endDateTime = `${sessionDate}T${endTime}:00`;
    
    // Send request
    fetch(`${API_URL}/sessions/request`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            teacher_id: teacherId,
            skill_id: skillId,
            start_time: startDateTime,
            end_time: endDateTime,
            location: location,
            notes: notes
        })
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('Failed to request session');
        }
    })
    .then(data => {
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('requestSessionModal'));
        modal.hide();
        
        // Reset form
        document.getElementById('requestSessionForm').reset();
        
        // Show success message
        showAlert('Session requested successfully! You will be notified when the teacher responds.', 'success');
    })
    .catch(error => {
        console.error('Error requesting session:', error);
        showAlert('Failed to request session. Please try again.', 'danger');
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