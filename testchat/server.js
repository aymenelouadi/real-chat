// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const crypto = require('crypto');

// إعداد تطبيق Express
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// تخزين الرموز العشوائية والمستخدمين المرتبطين بها
const rooms = {};

// تقديم الملفات الثابتة
app.use(express.static(__dirname));

// توليد رمز عشوائي
const generateRoomCode = () => crypto.randomBytes(4).toString('hex');

// التعامل مع اتصال Socket.io
io.on('connection', (socket) => {
    let currentRoom = null;

    // استقبال رمز الغرفة
    socket.on('joinRoom', (code, name, callback) => {
        if (rooms[code]) {
            socket.join(code);
            currentRoom = code;
            rooms[code].users[socket.id] = name;
            io.to(code).emit('message', `${name} دخل إلى الغرفة`);
            callback(true);
        } else {
            callback(false);
        }
    });

    // استقبال الرسائل
    socket.on('chatMessage', (msg) => {
        if (currentRoom) {
            const name = rooms[currentRoom].users[socket.id];
            io.to(currentRoom).emit('message', `${name}: ${msg}`);
        }
    });

    // التعامل مع قطع الاتصال
    socket.on('disconnect', () => {
        if (currentRoom) {
            const name = rooms[currentRoom].users[socket.id];
            delete rooms[currentRoom].users[socket.id];
            io.to(currentRoom).emit('message', `${name} غادر الغرفة`);
        }
    });
});

// إنشاء غرفة جديدة
app.post('/createRoom', (req, res) => {
    const roomCode = generateRoomCode();
    rooms[roomCode] = { users: {} };
    res.json({ roomCode });
});

// تشغيل السيرفر
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
