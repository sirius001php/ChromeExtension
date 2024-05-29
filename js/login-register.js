document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('login-button').addEventListener('click', function () {
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;

        fetch('http://127.0.0.1:5000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username: username, password: password })
        })
        .then(response => response.json())
        .then(data => {
            if (data.token) {
                chrome.storage.local.set({ access_token: data.token, csrf_token: data.csrf_token, username: username }, function () {
                    window.location.href = '../templates/main.html';
                });
            } else {
                document.getElementById('login-output').innerText = 'Login failed: ' + (data.message || 'Unknown error');
            }
        })
        .catch(error => {
            document.getElementById('login-output').innerText = 'Login failed: ' + error.message;
        });
    });

    document.getElementById('register-button').addEventListener('click', function () {
        const username = document.getElementById('register-username').value;
        const password = document.getElementById('register-password').value;

        chrome.runtime.sendMessage({
            action: "register",
            url: "http://127.0.0.1:5000/register",
            method: "POST",
            data: { username: username, password: password }
        }, function (response) {
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError.message);
                document.getElementById('output').innerText = 'Error: ' + chrome.runtime.lastError.message;
            } else if (response.error) {
                document.getElementById('output').innerText = 'Error: ' + response.error;
            } else {
                document.getElementById('output').innerText = 'Registration successful';
            }
        });
    });

    document.getElementById('show-register').addEventListener('click', function (e) {
        e.preventDefault();
        document.getElementById('login-form').classList.add('hidden');
        document.getElementById('register-form').classList.remove('hidden');
    });

    document.getElementById('show-login').addEventListener('click', function (e) {
        e.preventDefault();
        document.getElementById('register-form').classList.add('hidden');
        document.getElementById('login-form').classList.remove('hidden');
    });

    document.getElementById('show-search').addEventListener('click', function (e) {
        e.preventDefault();
        chrome.storage.local.get(['token'], function (result) {
            if (result.token) {
                window.location.href = '../templates/main.html';
            } else {
                document.getElementById('output').innerText = 'You need to login first';
            }
        });
    });
});
