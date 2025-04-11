// Initialize Firebase (replace with your config)
const firebaseConfig = { /* Your Firebase config */ };
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const functions = firebase.functions();
const chatFunction = functions.httpsCallable('chat');

let currentChatId = null;

// Authentication state
auth.onAuthStateChanged(user => {
    if (user) {
        document.getElementById('login-container').style.display = 'none';
        document.getElementById('chat-container').style.display = 'flex';
        loadChatList(user.uid);
    } else {
        document.getElementById('login-container').innerHTML = '<button onclick="signIn()">Sign In with Google</button>';
        document.getElementById('chat-container').style.display = 'none';
    }
});

function signIn() {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
}

// Load chat list
function loadChatList(userId) {
    db.collection('users').doc(userId).collection('chats').onSnapshot(snapshot => {
        const chatList = document.getElementById('chat-list');
        chatList.innerHTML = '';
        snapshot.forEach(doc => {
            const button = document.createElement('button');
            button.textContent = doc.data().title || doc.id;
            button.onclick = () => loadChat(doc.id);
            chatList.appendChild(button);
        });
    });
}

// Load specific chat
function loadChat(chatId) {
    currentChatId = chatId;
    const chatWindow = document.getElementById('chat-window');
    chatWindow.innerHTML = '';
    db.collection('users').doc(auth.currentUser.uid).collection('chats').doc(chatId)
        .collection('messages').orderBy('timestamp').onSnapshot(snapshot => {
            snapshot.forEach(doc => {
                const msg = doc.data();
                const div = document.createElement('div');
                div.className = msg.role === 'user' ? 'message-user' : 'message-ai';
                div.textContent = msg.content;
                chatWindow.appendChild(div);
            });
            chatWindow.scrollTop = chatWindow.scrollHeight;
        });
}

// Send message
document.getElementById('send-button').onclick = async () => {
    const input = document.getElementById('message-input');
    const mode = document.getElementById('mode-select').value;
    const message = input.value.trim();
    if (!message || !currentChatId) return;

    input.disabled = true;
    const userMsg = { role: 'user', content: message, timestamp: Date.now() };
    await db.collection('users').doc(auth.currentUser.uid).collection('chats')
        .doc(currentChatId).collection('messages').add(userMsg);

    const response = await chatFunction({ message, chatId: currentChatId, mode });
    const aiMsg = { role: 'assistant', content: response.data.response, timestamp: Date.now() };
    await db.collection('users').doc(auth.currentUser.uid).collection('chats')
        .doc(currentChatId).collection('messages').add(aiMsg);

    input.value = '';
    input.disabled = false;
};

// New chat
document.getElementById('new-chat-button').onclick = () => {
    const mode = document.getElementById('mode-select').value;
    if (mode === 'roleplay') {
        const character = prompt('Enter character name:');
        const description = prompt('Enter character description:');
        createNewChat(mode, { character, description });
    } else {
        createNewChat(mode);
    }
};

async function createNewChat(mode, roleplayInfo = {}) {
    const userId = auth.currentUser.uid;
    const chatRef = await db.collection('users').doc(userId).collection('chats').add({
        mode,
        roleplayInfo,
        title: `Chat ${new Date().toLocaleString()}`,
        timestamp: Date.now()
    });
    loadChat(chatRef.id);
}
