// Hardcoded credentials (for demo only)
const username = 'user';
const password = 'pass';

let chats = JSON.parse(localStorage.getItem('chats')) || [];
let currentChatId = null;

// Login handling
document.getElementById('login-button').addEventListener('click', () => {
    const inputUsername = document.getElementById('username').value;
    const inputPassword = document.getElementById('password').value;
    if (inputUsername === username && inputPassword === password) {
        localStorage.setItem('loggedIn', true);
        showChatInterface();
    } else {
        alert('Invalid credentials');
    }
});

// Check if already logged in
window.addEventListener('load', () => {
    if (localStorage.getItem('loggedIn') === 'true') {
        showChatInterface();
    }
});

function showChatInterface() {
    document.getElementById('login-container').style.display = 'none';
    document.getElementById('chat-container').style.display = 'flex';
    loadChatList();
}

// Load chat list
function loadChatList() {
    const chatList = document.getElementById('chat-list');
    chatList.innerHTML = '';
    chats.forEach(chat => {
        const button = document.createElement('button');
        button.textContent = chat.title;
        button.addEventListener('click', () => loadChat(chat.id));
        chatList.appendChild(button);
    });
}

// Load specific chat
function loadChat(id) {
    currentChatId = id;
    const chatWindow = document.getElementById('chat-window');
    chatWindow.innerHTML = '';
    const chat = chats.find(c => c.id === id);
    chat.messages.forEach(msg => {
        const div = document.createElement('div');
        div.className = msg.role === 'user' ? 'message-user' : 'message-ai';
        div.textContent = msg.content;
        chatWindow.appendChild(div);
    });
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Send message
document.getElementById('send-button').addEventListener('click', () => {
    const input = document.getElementById('message-input');
    const message = input.value.trim();
    if (!message || !currentChatId) return;

    const chat = chats.find(c => c.id === currentChatId);
    const userMsg = { role: 'user', content: message, timestamp: Date.now() };
    chat.messages.push(userMsg);
    displayMessage(userMsg);

    const aiResponse = generateAIResponse(chat.mode, chat.theme, message);
    const aiMsg = { role: 'assistant', content: aiResponse, timestamp: Date.now() };
    chat.messages.push(aiMsg);
    displayMessage(aiMsg);

    localStorage.setItem('chats', JSON.stringify(chats));
    input.value = '';
});

function displayMessage(msg) {
    const chatWindow = document.getElementById('chat-window');
    const div = document.createElement('div');
    div.className = msg.role === 'user' ? 'message-user' : 'message-ai';
    div.textContent = msg.content;
    chatWindow.appendChild(div);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Generate AI response
function generateAIResponse(mode, theme, message) {
    if (mode === 'normal') {
        return generateNormalResponse(message);
    } else if (mode === 'roleplay') {
        return generateRolePlayResponse(theme, message);
    }
}

function generateNormalResponse(message) {
    message = message.toLowerCase();
    if (message.includes('hello') || message.includes('hi')) {
        return 'Hello! How can I assist you?';
    } else if (message.includes('how are you')) {
        return 'I\'m doing well, thank you!';
    } else {
        return 'I\'m not sure how to respond to that.';
    }
}

function generateRolePlayResponse(theme, message) {
    message = message.toLowerCase();
    if (theme === 'pirate') {
        if (message.includes('treasure')) {
            return 'Ahoy, matey! The treasure be buried on the island!';
        } else {
            return 'Arr! What be yer question, landlubber?';
        }
    } else if (theme === 'wizard') {
        if (message.includes('spell')) {
            return 'Abracadabra! What spell do you wish to cast?';
        } else {
            return 'Greetings, traveler. What knowledge do you seek?';
        }
    } else {
        return 'I\'m here to roleplay. Ask me anything!';
    }
}

// New chat
document.getElementById('new-chat-button').addEventListener('click', () => {
    const mode = prompt('Select mode: normal or roleplay');
    if (mode === 'roleplay') {
        const theme = prompt('Enter theme (e.g., pirate, wizard):');
        createNewChat(mode, theme);
    } else if (mode === 'normal') {
        createNewChat(mode);
    } else {
        alert('Invalid mode');
    }
});

function createNewChat(mode, theme = null) {
    const id = chats.length ? Math.max(...chats.map(c => c.id)) + 1 : 1;
    const title = `Chat ${id} - ${mode}${theme ? ' (' + theme + ')' : ''}`;
    const chat = { id, mode, theme, title, messages: [] };
    chats.push(chat);
    localStorage.setItem('chats', JSON.stringify(chats));
    loadChatList();
    loadChat(id);
}
