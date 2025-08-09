document.addEventListener('DOMContentLoaded', () => {
    const notification = document.getElementById('notification');
    const notificationMessage = document.getElementById('notificationMessage');
    const loginForm = document.getElementById('loginForm');
    const loginBtn = document.getElementById('loginBtn');
    const btnLoader = document.querySelector('.btn-loader');
    const btnText = loginBtn.querySelector('span');
    const btnIcon = loginBtn.querySelector('i:not(.fa-spinner)');

    // Show notification function
    function showNotification(message, isError = false) {
        notificationMessage.textContent = message;
        notification.className = 'notification' + (isError ? ' error' : ' success');
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 4000);
    }

    // Show loading state
    function showLoading() {
        loginBtn.disabled = true;
        btnIcon.style.display = 'none';
        btnText.style.display = 'none';
        btnLoader.style.display = 'inline-block';
        loginBtn.classList.add('loading');
    }

    // Hide loading state
    function hideLoading() {
        loginBtn.disabled = false;
        btnIcon.style.display = 'inline-block';
        btnText.style.display = 'inline-block';
        btnLoader.style.display = 'none';
        loginBtn.classList.remove('loading');
    }

    // Handle admin login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;
            const rememberMe = document.getElementById('rememberMe').checked;

            // Validate inputs
            if (!username || !password) {
                showNotification('Please enter both username and password', true);
                return;
            }

            // Show loading state
            showLoading();

            // Simulate API call delay for better UX
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Check credentials
            if (username === 'aalekh' && password === '0001') {
                // Store login state
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('username', username);
                localStorage.setItem('userType', 'admin');
                localStorage.setItem('loginTime', new Date().toISOString());
                
                if (rememberMe) {
                    localStorage.setItem('rememberMe', 'true');
                }

                showNotification('Login successful! Redirecting to dashboard...', false);
                
                // Redirect to dashboard after a short delay
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1500);
            }
            else if (username === 'saha' && password === '1994') {
                // Store login state
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('username', username);
                localStorage.setItem('userType', 'admin');
                localStorage.setItem('loginTime', new Date().toISOString());
                
                if (rememberMe) {
                    localStorage.setItem('rememberMe', 'true');
                }

                showNotification('Login successful! Redirecting to dashboard...', false);
                
                // Redirect to dashboard after a short delay
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1500);
            } else {
                hideLoading();
                showNotification('Invalid username or password. Please try again.', true);
                
                // Clear password field for security
                document.getElementById('password').value = '';
                document.getElementById('password').focus();
            }
        });
    }

    // Auto-focus username field on page load
    const usernameField = document.getElementById('username');
    if (usernameField) {
        usernameField.focus();
    }

    // Check if user is already logged in
    if (localStorage.getItem('isLoggedIn') === 'true' && localStorage.getItem('rememberMe') === 'true') {
        showNotification('You are already logged in. Redirecting...', false);
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 2000);
    }

    // Add enter key support for form fields
    document.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && (e.target.id === 'username' || e.target.id === 'password')) {
            loginForm.dispatchEvent(new Event('submit'));
        }
    });
}); 