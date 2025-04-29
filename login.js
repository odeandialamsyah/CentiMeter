document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Get registered users from localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Find user with matching credentials
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        // Save logged in user using data.js function
        saveUser({
            nama: user.nama,
            email: user.email
        });
        localStorage.setItem('isLoggedIn', 'true');
        window.location.href = 'index.html';
    } else {
        alert('Email atau password salah!');
    }
});
