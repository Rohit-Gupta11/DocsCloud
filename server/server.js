const io = require('socket.io')(3001, {
    cors: {
        origin: process.env.ORIGIN,
        methods: ["GET", "POST"]
    }
});