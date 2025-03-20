import os
from flask import Flask, request, jsonify, render_template, redirect, url_for
from backend.routes.auth import auth_bp
from flask_sqlalchemy import SQLAlchemy
from backend.db import db

app = Flask(__name__,
            template_folder='templates',  # Use relative path
            static_folder='static')       # Use relative path

# Enable debug mode
app.config['DEBUG'] = True

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')

# Configure database
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///student_skill_exchange.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize database with app
db.init_app(app)

# Create tables before first request
@app.before_first_request
def create_tables():
    db.create_all()

# Add debug route
@app.route('/test')
def test():
    return 'Flask application is working! Template folder: ' + app.template_folder

# Basic routes
@app.route('/')
def home():
    return render_template('home.html')

@app.route('/login')
def login():
    return render_template('auth/login.html')

@app.route('/register')
def register():
    return render_template('auth/register.html')

@app.route('/skills')
def skills():
    return render_template('skills/index.html')

@app.route('/sessions')
def sessions():
    return render_template('sessions/index.html')

@app.route('/community')
def community():
    return render_template('community/index.html')

@app.route('/timebank')
def timebank():
    return render_template('timebank/index.html')

@app.route('/profile')
def profile():
    return render_template('user/profile.html')

@app.route('/register-test')
def register_test():
    # Print the template path to debug
    template_path = os.path.join(app.template_folder, 'auth', 'register_simple.html')
    print(f"Looking for template at: {template_path}")
    print(f"File exists: {os.path.exists(template_path)}")
    
    return render_template('auth/register_simple.html')

@app.route('/register-direct')
def register_direct():
    html = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Direct Register Test</title>
    </head>
    <body>
        <h1>Register Test</h1>
        <form id="registerForm">
            <div>
                <label for="username">Username:</label>
                <input type="text" id="username" name="username" required>
            </div>
            <div>
                <label for="email">Email:</label>
                <input type="email" id="email" name="email" required>
            </div>
            <div>
                <label for="password">Password:</label>
                <input type="password" id="password" name="password" required>
            </div>
            <div>
                <label for="confirmPassword">Confirm Password:</label>
                <input type="password" id="confirmPassword" name="confirmPassword" required>
            </div>
            <button type="submit">Register</button>
        </form>

        <script>
            document.getElementById('registerForm').addEventListener('submit', function(e) {
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
                    // window.location.href = '/login';
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('Registration failed: ' + error.message);
                });
            });
        </script>
    </body>
    </html>
    """
    return html

# Create the templates directory if it doesn't exist
os.makedirs('templates/auth', exist_ok=True)

# Create a simple template file directly from Python
with open('templates/auth/register_simple.html', 'w') as f:
    f.write("""<!DOCTYPE html>
<html>
<head>
    <title>Simple Register Test</title>
</head>
<body>
    <h1>Register Test</h1>
    <form id="registerForm">
        <div>
            <label for="username">Username:</label>
            <input type="text" id="username" name="username" required>
        </div>
        <div>
            <label for="email">Email:</label>
            <input type="email" id="email" name="email" required>
        </div>
        <div>
            <label for="password">Password:</label>
            <input type="password" id="password" name="password" required>
        </div>
        <div>
            <label for="confirmPassword">Confirm Password:</label>
            <input type="password" id="confirmPassword" name="confirmPassword" required>
        </div>
        <button type="submit">Register</button>
    </form>

    <script>
        document.getElementById('registerForm').addEventListener('submit', function(e) {
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
                // window.location.href = '/login';
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Registration failed: ' + error.message);
            });
        });
    </script>
</body>
</html>""")

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000) 