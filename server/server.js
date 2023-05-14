require('dotenv').config()

const io = require('socket.io')(3001, {
    cors: {
        origin: process.env.ORIGIN,
        methods: ["GET", "POST"]
    }
});

io.on('connection', socket => {
    console.log('this is working well')
})