document.addEventListener('DOMContentLoaded', function() {
    // Initialize session-related functionality
    initializeSessionPage();
    
    // Event listener for creating a new session
    document.getElementById('saveSessionBtn').addEventListener('click', createNewSession);
    
    // Event listener for submitting a rating
    document.getElementById('submitRatingBtn').addEventListener('click', submitSessionRating);
    
    // Toggle session type in the create session form
    document.getElementById('sessionType').addEventListener('change', function() {
        const studentSelectContainer = document.getElementById('studentSelectContainer');
        if (this.value === 'teaching') {
            studentSelectContainer.style.display = 'block';
            loadPotentialStudents();
        } else {
            studentSelectContainer.style.display = 'none';
        }
    });
});

// Initialize the sessions page with data and event handlers
function initializeSessionPage() {
    // Check authentication
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
        window.location.href = '/login?redirect=/sessions';
        return;
    }
    
    // Load available skills for the create session form
    loadUserSkills();
    
    // Load sessions for both calendar and list views
    loadUserSessions();
}

// Load skills for session creation
function loadUserSkills() {
    const skillSelect = document.getElementById('skillSelect');
    
    // Placeholder for API call
    // In production, replace with actual API call to fetch user's teaching/learning skills
    fetch('/api/user/skills', {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
    })
    .then(response => {
        if (!response.ok) throw new Error('Failed to load skills');
        return response.json();
    })
    .then(data => {
        // Clear existing options except the first one
        skillSelect.innerHTML = '<option value="">Select a Skill</option>';
        
        // Add teaching skills
        if (data.teaching && data.teaching.length > 0) {
            const teachingGroup = document.createElement('optgroup');
            teachingGroup.label = 'Skills You Teach';
            
            data.teaching.forEach(skill => {
                const option = document.createElement('option');
                option.value = `teaching-${skill.id}`;
                option.textContent = skill.name;
                teachingGroup.appendChild(option);
            });
            
            skillSelect.appendChild(teachingGroup);
        }
        
        // Add learning skills
        if (data.learning && data.learning.length > 0) {
            const learningGroup = document.createElement('optgroup');
            learningGroup.label = 'Skills You Want to Learn';
            
            data.learning.forEach(skill => {
                const option = document.createElement('option');
                option.value = `learning-${skill.id}`;
                option.textContent = skill.name;
                learningGroup.appendChild(option);
            });
            
            skillSelect.appendChild(learningGroup);
        }
    })
    .catch(error => {
        console.error('Error loading skills:', error);
        showAlert('Failed to load skills. Please try again.', 'danger');
    });
}

// Load potential students for teaching sessions
function loadPotentialStudents() {
    const studentSelect = document.getElementById('studentSelect');
    
    // Placeholder for API call
    // In production, replace with actual API call to fetch potential students
    fetch('/api/users/learners', {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
    })
    .then(response => {
        if (!response.ok) throw new Error('Failed to load potential students');
        return response.json();
    })
    .then(data => {
        // Clear existing options except the first one
        studentSelect.innerHTML = '<option value="">Select a Student</option>';
        
        // Add students
        data.forEach(student => {
            const option = document.createElement('option');
            option.value = student.id;
            option.textContent = student.name;
            studentSelect.appendChild(option);
        });
    })
    .catch(error => {
        console.error('Error loading potential students:', error);
        showAlert('Failed to load students. Please try again.', 'danger');
    });
}

// Load user's sessions
function loadUserSessions() {
    // In production, replace with actual API call to fetch user's sessions
    fetch('/api/sessions', {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
    })
    .then(response => {
        if (!response.ok) throw new Error('Failed to load sessions');
        return response.json();
    })
    .then(data => {
        // Update calendar with session data
        updateCalendarEvents(data);
        
        // Update list views
        updateSessionLists(data);
    })
    .catch(error => {
        console.error('Error loading sessions:', error);
        showAlert('Failed to load your sessions. Please try again.', 'danger');
    });
}

// Update calendar with session events
function updateCalendarEvents(sessions) {
    // This function is simplified and should be replaced with actual FullCalendar event source
    const calendarEvents = sessions.map(session => {
        let backgroundColor = '#5e72e4'; // Default color
        
        // Set color based on status
        switch(session.status) {
            case 'upcoming':
                backgroundColor = '#5e72e4'; // Blue for upcoming
                break;
            case 'pending':
                backgroundColor = '#fb6340'; // Orange for pending
                break;
            case 'completed':
                backgroundColor = '#2dce89'; // Green for completed
                break;
            case 'cancelled':
                backgroundColor = '#f5365c'; // Red for cancelled
                break;
        }
        
        return {
            id: session.id,
            title: session.skill_name,
            start: session.start_time,
            end: session.end_time,
            backgroundColor: backgroundColor,
            borderColor: backgroundColor,
            extendedProps: {
                sessionId: session.id,
                status: session.status,
                type: session.type // 'teaching' or 'learning'
            }
        };
    });
    
    // In real implementation, update the FullCalendar instance with these events
    // calendar.getEventSources()[0].remove();
    // calendar.addEventSource(calendarEvents);
}

// Update list views with session data
function updateSessionLists(sessions) {
    // Filter sessions by status
    const upcoming = sessions.filter(s => s.status === 'upcoming');
    const pending = sessions.filter(s => s.status === 'pending');
    const past = sessions.filter(s => ['completed', 'cancelled'].includes(s.status));
    
    // Update each list
    renderSessionList('upcomingSessions', upcoming);
    renderSessionList('pendingSessions', pending);
    renderSessionList('pastSessions', past);
}

// Render a list of sessions
function renderSessionList(containerId, sessions) {
    const container = document.getElementById(containerId);
    
    // Clear loading indicator
    container.innerHTML = '';
    
    if (sessions.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-calendar-alt"></i>
                <h4>No sessions found</h4>
                <p>You don't have any sessions in this category right now.</p>
                <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#createSessionModal">
                    <i class="fas fa-plus-circle me-2"></i> Create New Session
                </button>
            </div>
        `;
        return;
    }
    
    // Add sessions in a row layout
    const row = document.createElement('div');
    row.className = 'row';
    
    sessions.forEach(session => {
        const col = document.createElement('div');
        col.className = 'col-md-4 mb-4';
        
        let statusClass = '';
        switch(session.status) {
            case 'upcoming':
                statusClass = 'status-upcoming';
                break;
            case 'pending':
                statusClass = 'status-pending';
                break;
            case 'completed':
                statusClass = 'status-completed';
                break;
            case 'cancelled':
                statusClass = 'status-cancelled';
                break;
        }
        
        const startDate = new Date(session.start_time);
        const endDate = new Date(session.end_time);
        
        const sessionCard = `
            <div class="session-card" data-session-id="${session.id}">
                <div class="card-body">
                    <span class="session-status ${statusClass}">${session.status.charAt(0).toUpperCase() + session.status.slice(1)}</span>
                    <h5 class="card-title">${session.skill_name}</h5>
                    <div class="d-flex align-items-center mb-3">
                        <div class="user-avatar me-2">
                            <img src="${session.partner_avatar || 'https://via.placeholder.com/40'}" alt="User">
                        </div>
                        <div>
                            <p class="mb-0 fw-medium">With: ${session.partner_name}</p>
                            <small class="text-muted">${session.type.charAt(0).toUpperCase() + session.type.slice(1)} Session</small>
                        </div>
                    </div>
                    <hr class="session-info-divider">
                    <div class="d-flex align-items-center mb-2">
                        <i class="far fa-calendar-alt me-2 text-primary"></i>
                        <span>${formatDate(startDate)}</span>
                    </div>
                    <div class="d-flex align-items-center mb-2">
                        <i class="far fa-clock me-2 text-primary"></i>
                        <span>${formatTime(startDate)} - ${formatTime(endDate)}</span>
                    </div>
                    <div class="d-flex align-items-center">
                        <i class="fas fa-map-marker-alt me-2 text-primary"></i>
                        <span>${session.location}</span>
                    </div>
                    <div class="d-grid gap-2 mt-3">
                        <button class="btn btn-primary btn-sm view-session-details" data-session-id="${session.id}">
                            View Details
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        col.innerHTML = sessionCard;
        row.appendChild(col);
    });
    
    container.appendChild(row);
    
    // Add event listeners to view detail buttons
    container.querySelectorAll('.view-session-details').forEach(btn => {
        btn.addEventListener('click', function() {
            const sessionId = this.getAttribute('data-session-id');
            showSessionDetails(sessionId);
        });
    });
}

// Show session details in modal
function showSessionDetails(sessionId) {
    // Fetch session details
    fetch(`/api/sessions/${sessionId}`, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
    })
    .then(response => {
        if (!response.ok) throw new Error('Failed to load session details');
        return response.json();
    })
    .then(session => {
        // Update modal with session details
        document.getElementById('sessionDetailsTitle').textContent = session.skill_name;
        document.getElementById('sessionUserAvatar').src = session.partner_avatar || 'https://via.placeholder.com/60';
        document.getElementById('sessionWithName').textContent = session.partner_name;
        
        // Update status badge
        const statusBadge = document.getElementById('sessionStatusBadge');
        statusBadge.textContent = session.status.charAt(0).toUpperCase() + session.status.slice(1);
        statusBadge.className = 'session-status';
        
        switch(session.status) {
            case 'upcoming':
                statusBadge.classList.add('status-upcoming');
                break;
            case 'pending':
                statusBadge.classList.add('status-pending');
                break;
            case 'completed':
                statusBadge.classList.add('status-completed');
                break;
            case 'cancelled':
                statusBadge.classList.add('status-cancelled');
                break;
        }
        
        document.getElementById('sessionSkillName').textContent = session.skill_name;
        
        const startDate = new Date(session.start_time);
        const endDate = new Date(session.end_time);
        
        document.getElementById('sessionDateDetail').textContent = formatDate(startDate);
        document.getElementById('sessionTimeDetail').textContent = `${formatTime(startDate)} - ${formatTime(endDate)}`;
        document.getElementById('sessionLocationDetail').textContent = session.location;
        document.getElementById('sessionNotesDetail').textContent = session.notes || 'No additional notes provided.';
        
        // Update action buttons based on session status
        updateSessionActionButtons(session);
        
        // Show the modal
        const modal = new bootstrap.Modal(document.getElementById('sessionDetailsModal'));
        modal.show();
    })
    .catch(error => {
        console.error('Error loading session details:', error);
        showAlert('Failed to load session details. Please try again.', 'danger');
    });
}

// Update action buttons based on session status
function updateSessionActionButtons(session) {
    const actionsContainer = document.getElementById('sessionActionButtons');
    actionsContainer.innerHTML = '';
    
    switch(session.status) {
        case 'upcoming':
            actionsContainer.innerHTML = `
                <button class="btn btn-primary" onclick="startSession('${session.id}')">
                    <i class="fas fa-play-circle me-2"></i> Start Session
                </button>
                <button class="btn btn-outline-danger mt-2" onclick="cancelSession('${session.id}')">
                    <i class="fas fa-times-circle me-2"></i> Cancel Session
                </button>
            `;
            break;
        case 'pending':
            actionsContainer.innerHTML = `
                <button class="btn btn-success" onclick="acceptSession('${session.id}')">
                    <i class="fas fa-check-circle me-2"></i> Accept Request
                </button>
                <button class="btn btn-danger mt-2" onclick="declineSession('${session.id}')">
                    <i class="fas fa-times-circle me-2"></i> Decline Request
                </button>
            `;
            break;
        case 'completed':
            if (!session.rated) {
                actionsContainer.innerHTML = `
                    <button class="btn btn-primary" onclick="rateSession('${session.id}')">
                        <i class="fas fa-star me-2"></i> Rate This Session
                    </button>
                `;
            } else {
                actionsContainer.innerHTML = `
                    <div class="alert alert-success mb-0">
                        <i class="fas fa-check-circle me-2"></i> You've already rated this session
                    </div>
                `;
            }
            break;
        case 'cancelled':
            actionsContainer.innerHTML = `
                <div class="alert alert-secondary mb-0">
                    <i class="fas fa-info-circle me-2"></i> This session was cancelled
                </div>
            `;
            break;
    }
}

// Create a new session
function createNewSession() {
    const form = document.getElementById('createSessionForm');
    
    const sessionType = document.getElementById('sessionType').value;
    const skillSelectValue = document.getElementById('skillSelect').value;
    const studentId = sessionType === 'teaching' ? document.getElementById('studentSelect').value : null;
    
    const sessionDate = document.getElementById('sessionDate').value;
    const sessionTime = document.getElementById('sessionTime').value;
    const duration = document.getElementById('sessionDuration').value;
    const location = document.getElementById('sessionLocation').value;
    const notes = document.getElementById('sessionNotes').value;
    
    // Basic form validation
    if (!sessionType || !skillSelectValue || !sessionDate || !sessionTime || !duration || !location) {
        showAlert('Please fill out all required fields.', 'warning');
        return;
    }
    
    // Extract skill information
    const [type, skillId] = skillSelectValue.split('-');
    
    // Create start and end times
    const startDateTime = new Date(`${sessionDate}T${sessionTime}`);
    const endDateTime = new Date(startDateTime.getTime() + (parseInt(duration) * 60 * 1000));
    
    // Prepare data for API call
    const sessionData = {
        skill_id: parseInt(skillId),
        session_type: sessionType,
        partner_id: studentId ? parseInt(studentId) : null,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        location: location,
        notes: notes
    };
    
    // Make API call to create session
    fetch('/api/sessions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(sessionData)
    })
    .then(response => {
        if (!response.ok) throw new Error('Failed to create session');
        return response.json();
    })
    .then(data => {
        showAlert('Session created successfully!', 'success');
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('createSessionModal'));
        modal.hide();
        
        // Reload sessions
        loadUserSessions();
        
        // Reset form
        form.reset();
    })
    .catch(error => {
        console.error('Error creating session:', error);
        showAlert('Failed to create session. Please try again.', 'danger');
    });
}

// Submit session rating
function submitSessionRating() {
    const sessionId = document.getElementById('rateSessionId').value;
    const rating = parseInt(document.getElementById('ratingValue').value);
    const feedback = document.getElementById('feedbackComments').value;
    
    if (!rating) {
        showAlert('Please select a rating.', 'warning');
        return;
    }
    
    // Make API call to submit rating
    fetch(`/api/sessions/${sessionId}/rate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
            rating: rating,
            feedback: feedback
        })
    })
    .then(response => {
        if (!response.ok) throw new Error('Failed to submit rating');
        return response.json();
    })
    .then(data => {
        showAlert('Thank you for your feedback!', 'success');
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('rateSessionModal'));
        modal.hide();
        
        // Reload sessions
        loadUserSessions();
    })
    .catch(error => {
        console.error('Error submitting rating:', error);
        showAlert('Failed to submit rating. Please try again.', 'danger');
    });
}

// Rate a session
function rateSession(sessionId) {
    // Set the session ID in the form
    document.getElementById('rateSessionId').value = sessionId;
    
    // Reset form
    document.querySelectorAll('.star-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById('ratingValue').value = '';
    document.getElementById('feedbackComments').value = '';
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('rateSessionModal'));
    modal.show();
}

// Helper functions for session actions
function startSession(sessionId) {
    // This would typically involve updating the session status and redirecting to a video call or in-person meeting
    showAlert('Starting session...', 'info');
}

function cancelSession(sessionId) {
    if (confirm('Are you sure you want to cancel this session?')) {
        // Make API call to cancel session
        fetch(`/api/sessions/${sessionId}/cancel`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        })
        .then(response => {
            if (!response.ok) throw new Error('Failed to cancel session');
            return response.json();
        })
        .then(data => {
            showAlert('Session cancelled successfully', 'success');
            
            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('sessionDetailsModal'));
            modal.hide();
            
            // Reload sessions
            loadUserSessions();
        })
        .catch(error => {
            console.error('Error cancelling session:', error);
            showAlert('Failed to cancel session. Please try again.', 'danger');
        });
    }
}

function acceptSession(sessionId) {
    // Make API call to accept session request
    fetch(`/api/sessions/${sessionId}/accept`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
    })
    .then(response => {
        if (!response.ok) throw new Error('Failed to accept session');
        return response.json();
    })
    .then(data => {
        showAlert('Session accepted successfully', 'success');
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('sessionDetailsModal'));
        modal.hide();
        
        // Reload sessions
        loadUserSessions();
    })
    .catch(error => {
        console.error('Error accepting session:', error);
        showAlert('Failed to accept session. Please try again.', 'danger');
    });
}

function declineSession(sessionId) {
    if (confirm('Are you sure you want to decline this session request?')) {
        // Make API call to decline session request
        fetch(`/api/sessions/${sessionId}/decline`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        })
        .then(response => {
            if (!response.ok) throw new Error('Failed to decline session');
            return response.json();
        })
        .then(data => {
            showAlert('Session request declined', 'success');
            
            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('sessionDetailsModal'));
            modal.hide();
            
            // Reload sessions
            loadUserSessions();
        })
        .catch(error => {
            console.error('Error declining session:', error);
            showAlert('Failed to decline session. Please try again.', 'danger');
        });
    }
}

// Utility functions
function formatDate(date) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

function formatTime(date) {
    const options = { hour: 'numeric', minute: '2-digit', hour12: true };
    return date.toLocaleTimeString('en-US', options);
} 