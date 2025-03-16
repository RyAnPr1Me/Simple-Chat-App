let username = null;
const loginModal = document.getElementById("loginModal");
const loginUsernameInput = document.getElementById("loginUsername");
const loginButton = document.getElementById("loginButton");
const chatApp = document.getElementById("chatApp");
const usernameDisplay = document.getElementById("usernameDisplay");
const messageArea = document.getElementById("messageArea");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const userList = document.getElementById("userList");

// Initialize Pusher
const pusher = new Pusher('df5bb9092afe8e53d9b4', {
  cluster: 'us2'
});

const channel = pusher.subscribe('global-chat');

channel.bind('chat-message', function(data) {
  displayMessage(data.username, data.message, "received");
});

channel.bind('user-status', function(data) {
  updateUsersOnline(data.users);
});

function login() {
  const enteredUsername = loginUsernameInput.value.trim();
  if (!enteredUsername) return alert('Please enter a valid username!');
  username = enteredUsername;
  usernameDisplay.textContent = "Logged in as: " + username;
  loginModal.style.display = "none";
  chatApp.style.display = "flex";

  // Notify backend about new user login
  fetch('/update_user_status', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username: username
    })
  }).catch(error => console.error('Error updating user status:', error));
}

loginButton.addEventListener("click", login);
loginUsernameInput.addEventListener("keyup", (event) => {
  if (event.key === "Enter") login();
});

function sendMessage() {
  const message = messageInput.value.trim();
  if (!message || !username) return alert('Please enter a message!');
  displayMessage(username, message, "sent");

  // Encrypt message before sending
  const encryptedMessage = CryptoJS.AES.encrypt(message, 'secret-key').toString();

  // Send to backend
  fetch('/send_message', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username: username,
      message: encryptedMessage
    })
  }).then(response => response.json())
    .then(data => {
      console.log('Message sent:', data);
    })
    .catch(error => console.error('Error sending message:', error));

  messageInput.value = ''; // Clear input after sending
}

sendBtn.addEventListener("click", sendMessage);
messageInput.addEventListener("keyup", (event) => {
  if (event.key === "Enter") sendMessage();
});

function displayMessage(user, message, type) {
  const div = document.createElement("div");
  div.classList.add("message", type);
  div.textContent = `${user}: ${message}`;
  messageArea.appendChild(div);
  messageArea.scrollTop = messageArea.scrollHeight;
}

function updateUsersOnline(users) {
  userList.innerHTML = "";
  users.forEach(user => {
    const li = document.createElement("li");
    li.textContent = user;
    userList.appendChild(li);
  });
}
