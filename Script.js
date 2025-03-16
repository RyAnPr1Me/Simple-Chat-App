<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Secure Chat App with real-time messaging and client-side encryption.">
  <title>Chat App</title>
  <!-- Google Fonts: Roboto -->
  <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500&display=swap" rel="stylesheet">
  <!-- Main CSS file -->
  <link rel="stylesheet" href="style.css">
  <!-- Pusher for real-time messaging -->
  <script src="https://js.pusher.com/8.2.0/pusher.min.js" defer></script>
  <!-- CryptoJS for client-side encryption -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.2.0/crypto-js.min.js" defer></script>
  <!-- Main JavaScript File -->
  <script src="script.js" defer></script>
  <!-- Favicon -->
  <link rel="icon" href="favicon.ico">
</head>
<body>
  <!-- Login Modal -->
  <div id="loginModal" class="modal">
    <div class="modal-content">
      <h2>Welcome to Chat</h2>
      <input type="text" id="loginUsername" placeholder="Enter your username" aria-label="Username">
      <button id="loginButton">Login</button>
    </div>
  </div>

  <!-- Main Chat Application -->
  <div id="chatApp" class="chat-container">
    <!-- Sidebar: Online Users -->
    <aside class="sidebar">
      <h3>Users Online</h3>
      <ul id="userList"></ul>
    </aside>

    <!-- Chat Content -->
    <div class="chat-box">
      <header class="chat-header">
        <h1>Chat App</h1>
        <div id="usernameDisplay"></div>
      </header>

      <main id="messageArea" class="message-area">
        <!-- Messages will be dynamically added here -->
      </main>

      <footer class="input-area">
        <input type="text" id="messageInput" placeholder="Type your message..." aria-label="Message Input">
        <button id="sendBtn">Send</button>
      </footer>
    </div>
  </div>

  <!-- Footer -->
  <footer class="footer">
    <p>&copy; 2025 Chat App. All rights reserved.</p>
  </footer>
</body>
</html>

