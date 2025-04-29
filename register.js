document.getElementById('register-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const nama = document.getElementById('nama').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (password !== confirmPassword) {
        alert('Password tidak cocok!');
        return;
    }

    // Get existing users or initialize empty array
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Check if email already exists
    if (users.some(user => user.email === email)) {
        alert('Email sudah terdaftar!');
        return;
    }

    // Add new user
    users.push({
        nama,
        email,
        password // In a real app, you should hash the password
    });

    // Save updated users array
    localStorage.setItem('users', JSON.stringify(users));
    
    // Auto login after registration
    localStorage.setItem('currentUser', JSON.stringify({
        nama,
        email
    }));
    localStorage.setItem('isLoggedIn', 'true');
    
    window.location.href = 'index.html';
});
