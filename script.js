document.addEventListener("DOMContentLoaded", function() {
    const loginModal = document.getElementById("loginModal");
    const chatApp = document.getElementById("chatApp");
    const loginButton = document.getElementById("loginButton");
    const loginUsername = document.getElementById("loginUsername");
    const usernameDisplay = document.getElementById("usernameDisplay");
    const messageInput = document.getElementById("messageInput");
    const messageArea = document.getElementById("messageArea");
    const sendBtn = document.getElementById("sendBtn");

    // Handle Login
    function loginUser() {
        const username = loginUsername.value.trim();
        if (username) {
            usernameDisplay.textContent = `Logged in as: ${username}`;
            loginModal.classList.add("hidden"); // Hide login
            chatApp.style.display = "flex"; // Show chat
        }
    }

    loginButton.addEventListener("click", loginUser);
    loginUsername.addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            loginUser();
        }
    });

    // Handle Sending Messages
    function sendMessage() {
        const messageText = messageInput.value.trim();
        if (messageText) {
            const messageDiv = document.createElement("div");
            messageDiv.classList.add("message", "sent");
            messageDiv.textContent = messageText;
            messageArea.appendChild(messageDiv);
            messageInput.value = "";
            messageArea.scrollTop = messageArea.scrollHeight;
        }
    }

    sendBtn.addEventListener("click", sendMessage);
    messageInput.addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            sendMessage();
        }
    });
});
