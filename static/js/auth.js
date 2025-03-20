document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            if (password !== confirmPassword) {
                alert('Passwords do not match!');
                return;
            }
            
            console.log('Sending registration request:', { username, email });
            
            // Send registration request
            fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username,
                    email,
                    password
                })
            })
            .then(response => {
                console.log('Response status:', response.status);
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error('Registration failed with status: ' + response.status);
                }
            })
            .then(data => {
                console.log('Registration successful:', data);
                alert('Registration successful! Please log in.');
                window.location.href = '/login';
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Registration failed: ' + error.message);
            });
        });
    }
}); 