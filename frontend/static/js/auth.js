document.addEventListener('DOMContentLoaded', function() {
    // Handle login form submission
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const errorElement = document.getElementById('loginError');
            
            fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            })
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error('Login failed');
                }
            })
            .then(data => {
                localStorage.setItem('authToken', data.token);
                window.location.href = '/profile';
            })
            .catch(error => {
                errorElement.textContent = 'Invalid email or password';
                errorElement.classList.remove('d-none');
            });
        });
    }
    
    // Handle registration form submission
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const bio = document.getElementById('bio').value;
            const errorElement = document.getElementById('registerError');
            
            // Validate passwords match
            if (password !== confirmPassword) {
                errorElement.textContent = 'Passwords do not match';
                errorElement.classList.remove('d-none');
                return;
            }
            
            fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: username,
                    email: email,
                    password: password,
                    bio: bio
                })
            })
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else if (response.status === 400) {
                    return response.json().then(data => {
                        throw new Error(data.error || 'Registration failed');
                    });
                } else {
                    throw new Error('Registration failed');
                }
            })
            .then(data => {
                // Redirect to login page with success message
                window.location.href = '/login?registered=true';
            })
            .catch(error => {
                errorElement.textContent = error.message;
                errorElement.classList.remove('d-none');
            });
        });
    }
    
    // Display registration success message if applicable
    if (window.location.search.includes('registered=true')) {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            const successAlert = document.createElement('div');
            successAlert.className = 'alert alert-success mb-3';
            successAlert.textContent = 'Registration successful! You can now log in.';
            loginForm.prepend(successAlert);
        }
    }
}); 