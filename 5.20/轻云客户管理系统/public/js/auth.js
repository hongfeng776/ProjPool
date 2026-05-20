function showMessage(elementId, message, type) {
    const messageEl = document.getElementById(elementId);
    messageEl.innerHTML = `<div class="message ${type}">${message}</div>`;
    setTimeout(() => {
        messageEl.innerHTML = '';
    }, 3000);
}

const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });
            
            const data = await response.json();
            
            if (data.success) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                showMessage('message', '登录成功，正在跳转...', 'success');
                setTimeout(() => {
                    window.location.href = '/home';
                }, 1000);
            } else {
                showMessage('message', data.message, 'error');
            }
        } catch (error) {
            showMessage('message', '网络错误，请稍后重试', 'error');
        }
    });
}

const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (password !== confirmPassword) {
            showMessage('message', '两次输入的密码不一致', 'error');
            return;
        }
        
        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, email, password })
            });
            
            const data = await response.json();
            
            if (data.success) {
                showMessage('message', '注册成功，正在跳转到登录页...', 'success');
                setTimeout(() => {
                    window.location.href = '/login';
                }, 1500);
            } else {
                showMessage('message', data.message, 'error');
            }
        } catch (error) {
            showMessage('message', '网络错误，请稍后重试', 'error');
        }
    });
}
