chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Received message:', request); // Доданий лог
    if (request.action === "login" || request.action === "register" || request.action === "getperson" || request.action === "addperson" || request.action === "addcomment") {
        const headers = {
            'Content-Type': 'application/json',
            ...request.headers
        };

        fetch(request.url, {
            method: request.method,
            headers: headers,
            body: request.method === "POST" ? JSON.stringify(request.data) : null
        })
        .then(response => {
            console.log('Response status:', response.status); // Доданий лог
            if (!response.ok) {
                throw new Error(`HTTP status ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Response data:', data); // Доданий лог
            sendResponse({ data });

        })
        .catch(error => {
            console.error('Error:', error);
            sendResponse({ error: 'An error occurred: ' + error.message });
        });
        return true; // Keep the message channel open for sendResponse
    }
});
