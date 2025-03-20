document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.href = '/login';
        return;
    }
    
    // Initialize FullCalendar
    initializeCalendar();
    
    // Load sessions data
    loadSessions();
    
    // Setup view toggles
    document.getElementById('calendarViewBtn').addEventListener('click', function() {
        document.getElementById('calendarView').classList.remove('d-none');
        document.getElementById('listView').classList.add('d-none');
        document.getElementById('calendarViewBtn').classList.add('active');
        document.getElementById('listViewBtn').classList.remove('active');
    });
    
    document.getElementById('listViewBtn').addEventListener('click', function() {
        document.getElementById('calendarView').classList.add('d-none');
        document.getElementById('listView').classList.remove('d-none');
        document.getElementById('calendarViewBtn').classList.remove('active');
        document.getElementById('listViewBtn').classList.add('active');
    });
    
    // Setup rating modal
    setupRatingModal();
});

let calendar;
let allSessions = [];

function initializeCalendar() {
    const calendarEl = document.getElementById('calendar');
    
    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        events: [],
        eventClick: function(info) {
            showSessionDetails(info.event.id);
        }
    });
    
    calendar.render();
}

function loadSessions() {
    const token = localStorage.getItem('authToken');
    
    fetch(`${API_URL}/sessions`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('Failed to load sessions');
        }
    })
    .then(data => {
        allSessions = data;
        
        // Update calendar
        updateCalendarEvents(data);
        
        // Update list views
        const upcoming = data.filter(session => 
            (session.status === 'confirmed' || session.status === 'pending') && 
            new Date(session.start_time) > new Date()
        );
        
        const pending = data.filter(session => 
            session.status === 'pending'
        );
        
        const past = data.filter(session => 
            session.status === 'completed' || 
            (new Date(session.start_time) < new Date() && session.status !== 'cancelled')
        );
        
        displaySessionsList(upcoming, 'upcomingSessions');
        displaySessionsList(pending, 'pendingSessions');
        displaySessionsList(past, 'pastSessions');
    })
    .catch(error => {
        console.error('Error loading sessions:', error);
        document.getElementById('upcomingSessions').innerHTML = '<p class="text-danger">Failed to load sessions.</p>';
        document.getElementById('pendingSessions').innerHTML = '<p class="text-danger">Failed to load sessions.</p>';
        document.getElementById('pastSessions').innerHTML = '<p class="text-danger">Failed to load sessions.</p>';
    });
}

function updateCalendarEvents(sessions) {
    // Clear existing events
    calendar.removeAllEvents();
    
    // Add new events
    sessions.forEach(session => {
        let color;
        switch(session.status) {
            case 'pending': color = '#ffc107'; break; // warning
            case 'confirmed': color = '#28a745'; break; // success
            case 'completed': color = '#17a2b8'; break; // info
            case 'cancelled': color = '#dc3545'; break; // danger
            default: color = '#6c757d'; // secondary
        }
        
        calendar.addEvent({
            id: session.id,
            title: `${session.skill} ${session.teacher_id === currentUser.id ? '(Teaching)' : '(Learning)'}`,
            start: session.start_time,
            end: session.end_time,
            backgroundColor: color,
            borderColor: color
        });
    });
}

function displaySessionsList(sessions, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    if (sessions.length === 0) {
        container.innerHTML = '<p class="text-muted">No sessions found.</p>';
        return;
    }
    
    sessions.forEach(session => {
        const sessionElement = document.createElement('div');
        sessionElement.className = 'card mb-3';
        
        const isTeaching = session.teacher_id === currentUser.id;
        
        sessionElement.innerHTML = `
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start">
                    <div>
                        <h5 class="card-title">${session.skill}</h5>
                        <h6 class="card-subtitle mb-2 text-muted">
                            ${isTeaching ? 'Teaching' : 'Learning'} with ${isTeaching ? session.learner : session.teacher}
                        </h6>
                        <p class="mb-1">
                            <i class="bi bi-calendar"></i> ${formatDate(session.start_time)}
                        </p>
                        <p class="mb-1">
                            <i class="bi bi-clock"></i> ${formatTime(session.start_time)} - ${formatTime(session.end_time)}
                        </p>
                        <p class="mb-0">
                            <i class="bi bi-geo-alt"></i> ${session.location || 'No location specified'}
                        </p>
                    </div>
                    <span class="badge bg-${getStatusColor(session.status)}">${session.status}</span>
                </div>
                <div class="mt-3">
                    <button class="btn btn-sm btn-primary view-session-btn" data-session-id="${session.id}">
                        View Details
                    </button>
                </div>
            </div>
        `;
        
        container.appendChild(sessionElement);
    });
    
    // Setup view buttons
    document.querySelectorAll('.view-session-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const sessionId = this.getAttribute('data-session-id');
            showSessionDetails(sessionId);
        });
    });
}

function showSessionDetails(sessionId) {
    // Find the session
    const session = allSessions.find(s => s.id === parseInt(sessionId));
    
    if (!session) {
        console.error('Session not found:', sessionId);
        return;
    }
    
    // Populate the modal
    document.getElementById('sessionSkill').textContent = session.skill;
    document.getElementById('sessionWith').textContent = session.teacher_id === currentUser.id ? session.learner : session.teacher;
    document.getElementById('sessionDate').textContent = formatDate(session.start_time);
    document.getElementById('sessionTime').textContent = `${formatTime(session.start_time)} - ${formatTime(session.end_time)}`;
    document.getElementById('sessionLocation').textContent = session.location || 'No location specified';
    document.getElementById('sessionStatus').textContent = session.status;
    document.getElementById('sessionNotes').textContent = session.notes || 'No notes';
    
    // Setup action buttons based on session status
    const actionsContainer = document.getElementById('sessionActions');
    actionsContainer.innerHTML = '';
    
    if (session.status === 'pending') {
        // If the current user is the teacher, show confirm/reject buttons
        if (session.teacher_id === currentUser.id) {
            actionsContainer.innerHTML = `
                <button class="btn btn-success me-2 confirm-session-btn" data-session-id="${session.id}">
                    Confirm Session
                </button>
                <button class="btn btn-danger reject-session-btn" data-session-id="${session.id}">
                    Reject Session
                </button>
            `;
        } else {
            actionsContainer.innerHTML = `
                <button class="btn btn-danger cancel-session-btn" data-session-id="${session.id}">
                    Cancel Request
                </button>
            `;
        }
    } else if (session.status === 'confirmed') {
        actionsContainer.innerHTML = `
            <button class="btn btn-success me-2 complete-session-btn" data-session-id="${session.id}">
                Mark as Completed
            </button>
            <button class="btn btn-danger cancel-session-btn" data-session-id="${session.id}">
                Cancel Session
            </button>
        `;
    } else if (session.status === 'completed' && !session.has_rated) {
        actionsContainer.innerHTML = `
            <button class="btn btn-primary rate-session-btn" data-session-id="${session.id}">
                Rate this Session
            </button>
        `;
    }
    
    // Setup event listeners for the buttons
    setupSessionActionButtons();
    
    // Show the modal
    const modal = new bootstrap.Modal(document.getElementById('sessionDetailsModal'));
    modal.show();
}

function setupSessionActionButtons() {
    // Confirm session
    const confirmBtn = document.querySelector('.confirm-session-btn');
    if (confirmBtn) {
        confirmBtn.addEventListener('click', function() {
            updateSessionStatus(this.getAttribute('data-session-id'), 'confirmed');
        });
    }
    
    // Reject session
    const rejectBtn = document.querySelector('.reject-session-btn');
    if (rejectBtn) {
        rejectBtn.addEventListener('click', function() {
            updateSessionStatus(this.getAttribute('data-session-id'), 'rejected');
        });
    }
    
    // Cancel session
    const cancelBtn = document.querySelector('.cancel-session-btn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            updateSessionStatus(this.getAttribute('data-session-id'), 'cancelled');
        });
    }
    
    // Complete session
    const completeBtn = document.querySelector('.complete-session-btn');
    if (completeBtn) {
        completeBtn.addEventListener('click', function() {
            updateSessionStatus(this.getAttribute('data-session-id'), 'completed');
        });
    }
    
    // Rate session
    const rateBtn = document.querySelector('.rate-session-btn');
    if (rateBtn) {
        rateBtn.addEventListener('click', function() {
            const sessionId = this.getAttribute('data-session-id');
            
            // Populate the rating modal
            document.getElementById('rateSessionId').value = sessionId;
            
            // Reset rating
            document.getElementById('ratingValue').value = '';
            document.querySelectorAll('.star-btn').forEach(btn => {
                btn.classList.remove('active');
                btn.classList.remove('btn-warning');
                btn.classList.add('btn-outline-warning');
            });
            
            // Hide the details modal
            bootstrap.Modal.getInstance(document.getElementById('sessionDetailsModal')).hide();
            
            // Show the rating modal
            const rateModal = new bootstrap.Modal(document.getElementById('rateSessionModal'));
            rateModal.show();
        });
    }
}

function updateSessionStatus(sessionId, status) {
    const token = localStorage.getItem('authToken');
    
    fetch(`${API_URL}/sessions/${sessionId}/status`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            status: status
        })
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('Failed to update session status');
        }
    })
    .then(data => {
        // Close modal
        bootstrap.Modal.getInstance(document.getElementById('sessionDetailsModal')).hide();
        
        // Reload sessions
        loadSessions();
        
        // Show success message
        showAlert(`Session ${status} successfully!`, 'success');
    })
    .catch(error => {
        console.error('Error updating session status:', error);
        showAlert('Failed to update session status. Please try again.', 'danger');
    });
}

function setupRatingModal() {
    // Setup star buttons
    document.querySelectorAll('.star-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const rating = parseInt(this.getAttribute('data-rating'));
            
            // Update hidden input
            document.getElementById('ratingValue').value = rating;
            
            // Update button classes
            document.querySelectorAll('.star-btn').forEach((btn, index) => {
                if (index < rating) {
                    btn.classList.remove('btn-outline-warning');
                    btn.classList.add('btn-warning');
                } else {
                    btn.classList.add('btn-outline-warning');
                    btn.classList.remove('btn-warning');
                }
            });
        });
    });
    
    // Setup submit button
    document.getElementById('submitRatingBtn').addEventListener('click', submitRating);
}

function submitRating() {
    const token = localStorage.getItem('authToken');
    const sessionId = document.getElementById('rateSessionId').value;
    const rating = document.getElementById('ratingValue').value;
    const feedback = document.getElementById('feedback').value;
    
    if (!rating) {
        alert('Please select a rating');
        return;
    }
    
    fetch(`${API_URL}/sessions/${sessionId}/rate`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            rating: parseInt(rating),
            feedback: feedback
        })
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('Failed to submit rating');
        }
    })
    .then(data => {
        // Close modal
        bootstrap.Modal.getInstance(document.getElementById('rateSessionModal')).hide();
        
        // Reload sessions
        loadSessions();
        
        // Show success message
        showAlert('Rating submitted successfully!', 'success');
    })
    .catch(error => {
        console.error('Error submitting rating:', error);
        showAlert('Failed to submit rating. Please try again.', 'danger');
    });
}

// Helper functions
function getStatusColor(status) {
    switch(status) {
        case 'pending': return 'warning';
        case 'confirmed': return 'success';
        case 'completed': return 'info';
        case 'cancelled': 
        case 'rejected': return 'danger';
        default: return 'secondary';
    }
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