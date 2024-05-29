document.addEventListener('DOMContentLoaded', function () {
    chrome.storage.local.get(['access_token', 'csrf_token', 'username'], function (result) {
        if (!result.access_token) {
            window.location.href = '../templates/login-register.html';
            return;
        }

        const usernameDisplay = document.getElementById('username-display');
        usernameDisplay.innerText = `Username:${result.username}`;

        document.getElementById('search-button').addEventListener('click', function () {
            const id = document.getElementById('search-id').value;

            chrome.runtime.sendMessage({
                action: 'getperson',
                method: 'GET',
                url: `http://127.0.0.1:5000/getperson/${id}`,
                headers: {
                    'Authorization': 'Bearer ' + result.access_token,
                    'X-CSRFToken': result.csrf_token
                }
            }, function(response) {
                if (response.error) {
                    const output = document.getElementById('output');
                    output.innerHTML = `<p class="error">Error: ${response.error}</p>`;
                    showNewDataForm(); // Показуємо форму для введення нових даних
                } 
                else {
                    const data = response.data;
                    const output = document.getElementById('output');
                    output.innerHTML = ''; // Clear previous results


                    const resultDiv = document.createElement('div');
                    resultDiv.className = 'result';

                    const siteId = document.createElement('p');
                    siteId.innerHTML = `<strong>Site ID:</strong> ${data.site_id}`;
                    resultDiv.appendChild(siteId);

                    const url = document.createElement('p');
                    url.innerHTML = `<strong>URL:</strong> ${data.url}`;
                    resultDiv.appendChild(url);

                    const description = document.createElement('p');
                    description.innerHTML = `<strong>Description:</strong> ${data.description}`;
                    resultDiv.appendChild(description);

                    const dateCreate = document.createElement('p');
                    dateCreate.innerHTML = `<strong>Date Created:</strong> ${data.date_create}`;
                    resultDiv.appendChild(dateCreate);

                    const username = document.createElement('p');
                    username.innerHTML = `<strong>Username who Created:</strong> ${data.username}`;
                    resultDiv.appendChild(username);

                    if (data.comments && data.comments.length > 0) {
                        const commentsTitle = document.createElement('h4');
                        commentsTitle.innerText = 'Comments:';
                        resultDiv.appendChild(commentsTitle);

                        data.comments.forEach(comment => {
                            const commentDiv = document.createElement('div');
                            commentDiv.className = 'comment';

                            const commentContent = document.createElement('p');
                            commentContent.innerHTML = `<strong>Comment:</strong> ${comment.content}`;
                            commentDiv.appendChild(commentContent);

                            const commentDate = document.createElement('p');
                            commentDate.innerHTML = `<strong>Date:</strong> ${comment.date_create}`;
                            commentDiv.appendChild(commentDate);

                            const commentUsername = document.createElement('p');
                            commentUsername.innerHTML = `<strong>Username:</strong> ${comment.username_comment}`;
                            commentDiv.appendChild(commentUsername);

                            resultDiv.appendChild(commentDiv);
                        });
                    }
                    output.appendChild(resultDiv);


                    // show comment section
                    document.getElementById('comment-section').classList.remove('hidden');
                    document.getElementById('submit-comment').addEventListener('click', function() {
                        const commentContent = document.getElementById('comment-content').value;
                        submitComment(id, commentContent, result.access_token, result.csrf_token, result.username);
                    });
                }
            });
        });
        document.getElementById('logout-button').addEventListener('click', function () {
            chrome.storage.local.remove(['access_token', 'csrf_token', 'username'], function () {
                window.location.href = '../templates/login-register.html';
            });
        });

        function showNewDataForm() {
            document.getElementById('new-site-id').value = '';
            document.getElementById('new-description').value = '';
            // show/hiden search and add person
            document.getElementById('new-data-section').classList.remove('hidden');
            document.getElementById('search-section').classList.add('hidden');
            // Видаляємо існуючі слухачі подій перед додаванням нових
            const submitButton = document.getElementById('submit-new-data');
            const newButton = submitButton.cloneNode(true);
            submitButton.parentNode.replaceChild(newButton, submitButton);
            newButton.addEventListener('click', submitNewData);
        }

        function submitNewData() {
            const newSiteId = document.getElementById('new-site-id').value;
            const newDescription = document.getElementById('new-description').value;

            console.log('Submitting new data:', {
                site_id: newSiteId,
                description: newDescription,
                username: result.username
            }); // Логування даних перед відправкою

            chrome.runtime.sendMessage({
                action: 'addperson',
                method: 'POST',
                url: 'http://127.0.0.1:5000/addperson',
                headers: {
                    'Authorization': 'Bearer ' + result.access_token,
                    'X-CSRFToken': result.csrf_token
                },
                data: {
                    site_id: newSiteId,
                    description: newDescription,
                    username: result.username // Додаємо ім'я користувача до запиту
                }
            }, function(response) {
                if (response.error) {
                    alert('Error: ' + response.error);
                } else {
                    alert('Data added successfully');
                    // show/hiden search and add person
                    document.getElementById('new-data-section').classList.add('hidden');
                    document.getElementById('search-id').value = '';
                    document.getElementById('search-section').classList.remove('hidden');
                }
            });
        }
        function submitComment(siteId, commentContent, accessToken, csrfToken, username) {
            console.log('Submitting comment:', {
                site_id: siteId,
                content: commentContent,
                username: username
            });
            chrome.runtime.sendMessage({
                action: 'addcomment',
                method: 'POST',
                url: 'http://127.0.0.1:5000/addcomment',
                headers: {
                    'Authorization': 'Bearer ' + accessToken,
                    'X-CSRFToken': csrfToken
                },
                data: {
                    site_id: siteId,
                    content: commentContent,
                    username: username // Додаємо ім'я користувача до запиту
                }
            }, function(response) {
                if (response.error) {
                    alert('Error: ' + response.error);
                } else {
                    alert('Comment added successfully');
                    // show/hiden search and add person
                    document.getElementById('comment-content').value = '';
                    document.getElementById('comment-section').classList.add('hidden');
                }
            });
        }
    });
});
