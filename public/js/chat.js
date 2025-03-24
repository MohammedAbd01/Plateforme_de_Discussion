const socket = io();
let currentRoom = '';
let username = '';
let onlineUsers = []; // To store online users for mention suggestions

// DOM elements
const messageInput = document.getElementById('message-input');
const messagesDiv = document.getElementById('messages');
const sendButton = document.getElementById('send-message');
const roomList = document.getElementById('room-list');

document.addEventListener('DOMContentLoaded', () => {
  // Create login and registration forms
  createAuthForms();
  onlineUsers = []; // To store online users for mention suggestions
  // Check if we're already logged in
  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username');
  if (token && username) {
    login(username, token);
  } else {
    showLoginForm();
  }
});

// Function to display message in the chat
function displayMessage(message) {
  const div = document.createElement('div');
  div.classList.add('message');
  
  // Add class for styling based on whether this is our own message
  if (message.user === username) {
    div.classList.add('self');
  } else {
    div.classList.add('other');
  }
  
  // Highlight mentions
  let text = message.text;
  if (message.mentions && message.mentions.length > 0) {
    message.mentions.forEach(mention => {
      // Highlight mentions of current user
      if (mention === username) {
        text = text.replace(`@${mention}`, `<span class="mention-self">@${mention}</span>`);
      } else {
        text = text.replace(`@${mention}`, `<span class="mention">@${mention}</span>`);
      }
    });
  }
  
  // Format timestamp
  const time = new Date(message.timestamp).toLocaleTimeString();
  
  div.innerHTML = `
    <span class="user">${message.user}</span>
    <span class="time">${time}</span>
    <p class="text">${text}</p>
  `;
  
  messagesDiv.appendChild(div);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Create the auth forms
function createAuthForms() {
  // Create login form container
  const loginForm = document.createElement('div');
  loginForm.id = 'login-form';
  loginForm.classList.add('auth-form');
  loginForm.innerHTML = `
    <h2><i class="fas fa-sign-in-alt"></i> Login</h2>
    <div class="form-group">
      <label for="login-username"><i class="fas fa-user"></i> Username</label>
      <input type="text" id="login-username" placeholder="Enter your username" />
    </div>
    <div class="form-group">
      <label for="login-password"><i class="fas fa-lock"></i> Password</label>
      <input type="password" id="login-password" placeholder="Enter your password" />
    </div>
    <button id="login-button">Login</button>
    <p class="form-switch">Don't have an account? <a href="#register">Register</a></p>
  `;
  
  // Create register form container
  const registerForm = document.createElement('div');
  registerForm.id = 'register-form';
  registerForm.classList.add('auth-form');
  registerForm.innerHTML = `
    <h2><i class="fas fa-user-plus"></i> Create Account</h2>
    <div class="form-group">
      <label for="register-username"><i class="fas fa-user"></i> Username*</label>
      <input type="text" id="register-username" placeholder="Choose a username" required />
    </div>
    <div class="form-group">
      <label for="register-password"><i class="fas fa-lock"></i> Password*</label>
      <input type="password" id="register-password" placeholder="Choose a password" required />
    </div>
    <div class="form-group">
      <label for="register-firstname"><i class="fas fa-id-card"></i> First Name*</label>
      <input type="text" id="register-firstname" placeholder="Your first name" required />
    </div>
    <div class="form-group">
      <label for="register-lastname"><i class="fas fa-id-card"></i> Last Name*</label>
      <input type="text" id="register-lastname" placeholder="Your last name" required />
    </div>
    <div class="form-group">
      <label for="register-age"><i class="fas fa-birthday-cake"></i> Age*</label>
      <input type="number" id="register-age" placeholder="Your age" required min="16" max="100" />
    </div>
    <div class="form-group">
      <label for="register-email"><i class="fas fa-envelope"></i> Email*</label>
      <input type="email" id="register-email" placeholder="Your email" required />
    </div>
    <button id="register-button">Create Account</button>
    <p class="form-switch">Already have an account? <a href="#login">Login</a></p>
  `;
  
  // Create profile editor
  const profileEditor = document.createElement('div');
  profileEditor.id = 'profile-editor';
  profileEditor.classList.add('auth-form');
  profileEditor.innerHTML = `
    <h2><i class="fas fa-user-edit"></i> Edit Profile</h2>
    <div class="form-group">
      <label for="profile-firstname"><i class="fas fa-id-card"></i> First Name</label>
      <input type="text" id="profile-firstname" placeholder="Your first name" />
    </div>
    <div class="form-group">
      <label for="profile-lastname"><i class="fas fa-id-card"></i> Last Name</label>
      <input type="text" id="profile-lastname" placeholder="Your last name" />
    </div>
    <div class="form-group">
      <label for="profile-age"><i class="fas fa-birthday-cake"></i> Age</label>
      <input type="number" id="profile-age" placeholder="Your age" min="16" max="100" />
    </div>
    <div class="form-group">
      <label for="profile-email"><i class="fas fa-envelope"></i> Email</label>
      <input type="email" id="profile-email" placeholder="Your email" />
    </div>
    <button id="save-profile">Save Changes</button>
    <button id="cancel-profile" class="secondary">Cancel</button>
  `;
  
  // Add forms to the page
  document.querySelector('main').prepend(profileEditor);
  document.querySelector('main').prepend(registerForm);
  document.querySelector('main').prepend(loginForm);
  
  // Hide them initially
  loginForm.style.display = 'none';
  registerForm.style.display = 'none';
  profileEditor.style.display = 'none';
  
  // Add event listeners for login
  document.getElementById('login-button').addEventListener('click', async () => {
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    
    if (username && password) {
      try {
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('username', data.username);
          login(data.username, data.token);
        } else {
          alert(data.message || 'Login failed');
        }
      } catch (error) {
        alert('Error during login. Please try again.');
      }
    }
  });
  
  // Add event listeners for registration
  document.getElementById('register-button').addEventListener('click', async () => {
    const username = document.getElementById('register-username').value.trim();
    const password = document.getElementById('register-password').value;
    const firstName = document.getElementById('register-firstname').value.trim();
    const lastName = document.getElementById('register-lastname').value.trim();
    const age = parseInt(document.getElementById('register-age').value);
    const email = document.getElementById('register-email').value.trim();
    
    if (username && password && firstName && lastName && age && email) {
      try {
        const response = await fetch('/api/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            username, 
            password, 
            firstName, 
            lastName, 
            age, 
            email 
          })
        });
        
        const data = await response.json();
        
        if (response.ok) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('username', data.username);
          login(data.username, data.token);
        } else {
          alert(data.message || 'Registration failed');
        }
      } catch (error) {
        alert('Error during registration. Please try again.');
      }
    } else {
      alert('Please fill out all required fields.');
    }
  });
  
  // Add event listeners for profile editor
  document.getElementById('save-profile').addEventListener('click', async () => {
    const firstName = document.getElementById('profile-firstname').value.trim();
    const lastName = document.getElementById('profile-lastname').value.trim();
    const age = parseInt(document.getElementById('profile-age').value);
    const email = document.getElementById('profile-email').value.trim();
    
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          firstName,
          lastName,
          age,
          email
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert('Profile updated successfully');
        hideProfileEditor();
      } else {
        alert(data.message || 'Profile update failed');
      }
    } catch (error) {
      alert('Error updating profile. Please try again.');
    }
  });
  
  document.getElementById('cancel-profile').addEventListener('click', hideProfileEditor);
  
  // Navigation links
  document.querySelector('a[href="#login"]').addEventListener('click', (e) => {
    e.preventDefault();
    showLoginForm();
  });
  
  document.querySelector('a[href="#register"]').addEventListener('click', (e) => {
    e.preventDefault();
    showRegisterForm();
  });
  
  // Add a link in the header for profile editing
  const navList = document.querySelector('header nav ul');
  const profileLink = document.createElement('li');
  profileLink.innerHTML = '<a href="#profile" id="edit-profile-link">Edit Profile</a>';
  profileLink.style.display = 'none'; // Hide initially
  navList.appendChild(profileLink);
  
  document.getElementById('edit-profile-link').addEventListener('click', (e) => {
    e.preventDefault();
    showProfileEditor();
  });
}

function showLoginForm() {
  document.getElementById('login-form').style.display = 'block';
  document.getElementById('register-form').style.display = 'none';
  document.getElementById('profile-editor').style.display = 'none';
  document.getElementById('chat-room').style.display = 'none';
  document.getElementById('chat').style.display = 'none';
}

function showRegisterForm() {
  document.getElementById('login-form').style.display = 'none';
  document.getElementById('register-form').style.display = 'block';
  document.getElementById('profile-editor').style.display = 'none';
  document.getElementById('chat-room').style.display = 'none';
  document.getElementById('chat').style.display = 'none';
}

function showProfileEditor() {
  loadUserProfile();
  document.getElementById('login-form').style.display = 'none';
  document.getElementById('register-form').style.display = 'none';
  document.getElementById('profile-editor').style.display = 'block';
  document.getElementById('chat-room').style.display = 'none';
  document.getElementById('chat').style.display = 'none';
}

function hideProfileEditor() {
  document.getElementById('profile-editor').style.display = 'none';
  document.getElementById('chat-room').style.display = 'block';
  document.getElementById('chat').style.display = 'block';
}

async function loadUserProfile() {
  try {
    const response = await fetch('/api/profile', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (response.ok) {
      const user = await response.json();
      document.getElementById('profile-firstname').value = user.firstName;
      document.getElementById('profile-lastname').value = user.lastName;
      document.getElementById('profile-age').value = user.age;
      document.getElementById('profile-email').value = user.email;
    }
  } catch (error) {
    console.error('Error loading profile:', error);
  }
}

function login(username, token) {
  // Update global username variable in chat.js
  window.username = username;
  
  // Tell the server we logged in with token
  socket.emit('login', { username, token });
  
  // Show chat interface
  document.getElementById('login-form').style.display = 'none';
  document.getElementById('register-form').style.display = 'none';
  document.getElementById('profile-editor').style.display = 'none';
  document.getElementById('chat-room').style.display = 'block';
  document.getElementById('chat').style.display = 'block';
  
  // Show logout and profile links
  document.querySelector('a[href="#login"]').parentElement.style.display = 'none';
  document.querySelector('a[href="#register"]').parentElement.style.display = 'none';
  document.getElementById('edit-profile-link').parentElement.style.display = 'block';
  
  // Add a logout link
  const navList = document.querySelector('header nav ul');
  let logoutLink = document.getElementById('logout-link');
  if (!logoutLink) {
    const li = document.createElement('li');
    li.innerHTML = '<a href="#logout" id="logout-link">Logout</a>';
    navList.appendChild(li);
    
    document.getElementById('logout-link').addEventListener('click', (e) => {
      e.preventDefault();
      logout();
    });
  } else {
    logoutLink.parentElement.style.display = 'block';
  }
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  window.username = '';
  
  // Hide profile and logout links
  document.getElementById('edit-profile-link').parentElement.style.display = 'none';
  document.getElementById('logout-link').parentElement.style.display = 'none';
  
  // Show login and register links
  document.querySelector('a[href="#login"]').parentElement.style.display = 'block';
  document.querySelector('a[href="#register"]').parentElement.style.display = 'block';
  
  showLoginForm();
}

// Function to join a room
function joinRoom(room) {
  currentRoom = room;
  socket.emit('joinRoom', room);
  
  // Update room label
  document.querySelector('#chat h2').textContent = `Chat - ${room}`;
  
  // Clear messages
  messagesDiv.innerHTML = '';
}

// Initialize room list
socket.on('userList', (data) => {
  if (data.rooms) {
    roomList.innerHTML = '';
    data.rooms.forEach(room => {
      const div = document.createElement('div');
      div.classList.add('room');
      div.textContent = room;
      div.addEventListener('click', () => joinRoom(room));
      roomList.appendChild(div);
    });
  }
  
  if (data.users) {
    // Update online users list for mention suggestions
    onlineUsers = data.users.map(user => user.username);
  }
});

// Display room history when joining
socket.on('roomHistory', (data) => {
  messagesDiv.innerHTML = '';
  data.messages.forEach(msg => displayMessage(msg));
});

// Display new messages
socket.on('message', (message) => {
  displayMessage(message);
  
  // Check if message mentions current user
  if (message.mentions && message.mentions.includes(username)) {
    // Play notification sound or show notification
    if (Notification.permission === 'granted') {
      new Notification('New mention!', {
        body: `${message.user} mentioned you in ${currentRoom}`
      });
    }
  }
});

// Listen for mention notifications
socket.on('mention', (data) => {
  if (Notification.permission === 'granted') {
    new Notification(`@${data.from} mentioned you`, {
      body: `In ${data.room}: ${data.message}`
    });
  }
});

// Add mention suggestions functionality
messageInput.addEventListener('input', function() {
  const cursorPos = this.selectionStart;
  const text = this.value;
  const mentionStart = text.lastIndexOf('@', cursorPos);
  
  if (mentionStart !== -1 && mentionStart < cursorPos) {
    const mentionText = text.substring(mentionStart + 1, cursorPos).toLowerCase();
    showMentionSuggestions(mentionText, mentionStart);
  } else {
    hideMentionSuggestions();
  }
});

// Show mention suggestions
function showMentionSuggestions(query, mentionStart) {
  // Remove old suggestions
  let suggestionBox = document.getElementById('mention-suggestions');
  if (!suggestionBox) {
    suggestionBox = document.createElement('div');
    suggestionBox.id = 'mention-suggestions';
    document.body.appendChild(suggestionBox);
  }
  
  // Clear old suggestions
  suggestionBox.innerHTML = '';
  
  // Find matching users
  const matches = onlineUsers.filter(user => 
    user.toLowerCase().includes(query) && user !== username
  );
  
  if (matches.length === 0) {
    hideMentionSuggestions();
    return;
  }
  
  // Position suggestion box
  const inputRect = messageInput.getBoundingClientRect();
  suggestionBox.style.position = 'absolute';
  suggestionBox.style.left = inputRect.left + 'px';
  suggestionBox.style.top = (inputRect.top - suggestionBox.offsetHeight) + 'px';
  suggestionBox.style.display = 'block';
  
  // Add suggestions
  matches.forEach(user => {
    const div = document.createElement('div');
    div.classList.add('mention-suggestion');
    div.textContent = user;
    div.addEventListener('click', () => {
      // Replace the partial mention with the full username
      const before = messageInput.value.substring(0, mentionStart);
      const after = messageInput.value.substring(messageInput.selectionStart);
      messageInput.value = before + '@' + user + ' ' + after;
      messageInput.focus();
      hideMentionSuggestions();
    });
    suggestionBox.appendChild(div);
  });
}

// Hide mention suggestions
function hideMentionSuggestions() {
  const suggestionBox = document.getElementById('mention-suggestions');
  if (suggestionBox) {
    suggestionBox.style.display = 'none';
  }
}

// Send message
sendButton.addEventListener('click', () => {
  const message = messageInput.value.trim();
  
  if (message && currentRoom) {
    socket.emit('chatMessage', { text: message });
    messageInput.value = '';
    messageInput.focus();
    hideMentionSuggestions();
  }
});

// Allow sending with Enter key
messageInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendButton.click();
  }
});

// Request notification permission
document.addEventListener('DOMContentLoaded', () => {
  if (Notification.permission !== 'granted') {
    Notification.requestPermission();
  }
});

// Handle socket errors
socket.on('error', (data) => {
  alert(data.message || 'An error occurred');
});

// Make username globally available
window.setUsername = function(name) {
  username = name;
};