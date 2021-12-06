import { createServer } from "http";
import { Server } from "socket.io";
// import { encrypt } from "./cryp.js";
import crypto from 'crypto';
 
const httpServer = createServer();
const io = new Server(httpServer);
// const io = require('socket.io')(8000);

const users = {};

io.on('connection', socket => {
    socket.on('new-user-joined', name => {
        // console.log(`new user ${name}`)
        users[socket.id] = name;
        socket.broadcast.emit('user-joined', name);
    });

    socket.on('send', message => {
        socket.broadcast.emit('receive', {message: encrypt(message), name: users[socket.id]})
        console.log(encrypt(message))
    });

    socket.on('disconnect', message =>{
        socket.broadcast.emit('left', users[socket.id])
        delete users[socket.id]
    })
})

//crypto
const algorithm = 'aes-256-cbc';
export const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);
  
function encrypt(text) {
    let cipher = crypto.createCipheriv('aes-256-cbc',Buffer.from(key), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };
}

export function decrypt(text) {
    let iv = Buffer.from(text.iv, 'hex');
    let encryptedText = Buffer.from(text.encryptedData, 'hex');
    let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}


httpServer.listen(8000);