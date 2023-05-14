require('dotenv').config();
const mongoose = require("mongoose")
const Document = require("./models/Document")

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('db')
})

const io = require("socket.io")(3001, {
    cors: {
        origin: process.env.ORIGIN,
        methods: ["GET", "POST"],
    },
})

const defaultValue = "";

io.on("connection", socket => {
    console.log('this is working well')
    socket.on("get-document", async documentId => {
        const document = await findOrCreateDocument(documentId);
        socket.join(documentId);
        socket.emit("load-document", document.data);

        socket.on("send-changes", delta => {
            socket.broadcast.to(documentId).emit("receive-changes", delta);
        });

        socket.on("save-document", async data => {
            await Document.findByIdAndUpdate(documentId, { data });
        });
    });
});

async function findOrCreateDocument(id) {
    if (id == null) return;
    
    const document = await Document.findById(id);
    
    if (document) return document;
    
    return await Document.create({ _id: id, data: defaultValue });
}