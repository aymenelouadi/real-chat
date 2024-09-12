// الاتصال بـ Socket.io
const socket = io();

// الحصول على العناصر
const createRoomBtn = document.getElementById('create-room');
const joinRoomBtn = document.getElementById('join-room');
const roomCodeInput = document.getElementById('room-code');
const usernameInput = document.getElementById('username');
const chatForm = document.getElementById('chat-form');
const messageInput = document.getElementById('message');
const messagesDiv = document.getElementById('messages');
const chatContainer = document.querySelector('.chat-container');
const statusElement = document.getElementById('status');

// إنشاء غرفة جديدة
createRoomBtn.addEventListener('click', async () => {
    const response = await fetch('/createRoom', { method: 'POST' });
    const data = await response.json();
    roomCodeInput.value = data.roomCode;
    statusElement.innerText = `تم إنشاء غرفة جديدة. رمز الغرفة هو ${data.roomCode}`;
});

// الانضمام إلى غرفة
joinRoomBtn.addEventListener('click', () => {
    const roomCode = roomCodeInput.value;
    const username = usernameInput.value;

    if (roomCode && username) {
        socket.emit('joinRoom', roomCode, username, (success) => {
            if (success) {
                document.querySelector('.room-setup').style.display = 'none';
                chatContainer.style.display = 'flex';
                statusElement.innerText = `مرحبا، ${username}!`;
            } else {
                statusElement.innerText = 'رمز الغرفة غير صحيح';
            }
        });
    }
});

// إرسال الرسائل
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const msg = messageInput.value;
    socket.emit('chatMessage', msg);
    messageInput.value = '';
});

// استقبال الرسائل وعرضها
socket.on('message', (msg) => {
    const messageElement = document.createElement('div');
    messageElement.className = 'message';
    messageElement.innerText = msg;
    messagesDiv.appendChild(messageElement);
    messagesDiv.scrollTop = messagesDiv.scrollHeight; // التمرير التلقائي لأسفل
});
