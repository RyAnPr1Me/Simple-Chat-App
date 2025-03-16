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
const pusher = new Pusher("df5bb9092afe8e53d9b4", {
  cluster: "us2",
  forceTLS: true,
});

const channel = pusher.subscribe("global-chat");

channel.bind("chat-message", (data) => {
  const decryptedMessage = decryptMessage(data.message);
  displayMessage(data.username, decryptedMessage, "received");
});

channel.bind("user-status", (data) => {
  updateUsersOnline(data.users);
});

function login() {
  const enteredUsername = loginUsernameInput.value.trim();
  if (!enteredUsername) {
    alert("Please enter a valid username!");
    return;
  }

  username = enteredUsername;
  usernameDisplay.textContent = `Logged in as: ${username}`;
  loginModal.style.display = "none";
  chatApp.style.display = "flex";

  notifyBackend("/update_user_status", { username }).catch((error) =>
    console.error("Error updating user status:", error)
  );
}

loginButton.addEventListener("click", login);
loginUsernameInput.addEventListener("keyup", (event) => {
  if (event.key === "Enter") login();
});

function sendMessage() {
  const message = messageInput.value.trim();
  if (!message) {
    alert("Please enter a message!");
    return;
  }

  displayMessage(username, message, "sent");

  const encryptedMessage = encryptMessage(message);

  notifyBackend("/send_message", { username, message: encryptedMessage })
    .then((data) => console.log("Message sent:", data))
    .catch((error) => console.error("Error sending message:", error));

  messageInput.value = ""; // Clear input after sending
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
  users.forEach((user) => {
    const li = document.createElement("li");
    li.textContent = user;
    userList.appendChild(li);
  });
}

function encryptMessage(message) {
  return CryptoJS.AES.encrypt(message, "secret-key").toString();
}

function decryptMessage(encryptedMessage) {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedMessage, "secret-key");
    return bytes.toString(CryptoJS.enc.Utf8) || "[Decryption Error]";
  } catch (error) {
    console.error("Error decrypting message:", error);
    return "[Error]";
  }
}

function notifyBackend(endpoint, data) {
  return fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  }).then((response) => response.json());
}

// Auto-reconnect when Pusher disconnects
pusher.connection.bind("disconnected", () => {
  console.warn("Pusher disconnected! Attempting to reconnect...");
  setTimeout(() => {
    location.reload();
  }, 3000);
});
