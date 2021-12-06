// import { io } from 'socket.io-client';
import { key }  from './NodeServer/index.js';

const socket = io('http://localhost:8000', {transports: ['websocket']});

const form = document.getElementById('send-container');
const messageInput = document.getElementById('messageInp');
const messageContainer = document.querySelector(".container");

const append = (message, position) => {
    const element = `<div class="message ${position}">${message}</div>`
    messageContainer.innerHTML += element;
}

const append2 = (message) => {
    const element = `<div class="center">${message}</div>`
    messageContainer.innerHTML += element;
}


const name = prompt("Enter your name to join");

socket.emit('new-user-joined', name);

socket.on('user-joined', name =>{
    append2(`${name} joined the chat`);
})

socket.on('receive', data =>{
    append(`${data.name}: ${decrypt(data.message)}`, 'left');
})

socket.on('left', name =>{
    append2(`${name} left the chat`)
})

form.addEventListener('submit', (e) =>{
    e.preventDefault()
    if(messageInput.value === '') return ;
    const message = messageInput.value;
    append(`You: ${message}`, 'right');
    socket.emit('send', message)
    messageInput.value = ''
    scrollToBottom()
})

function scrollToBottom(){
    messageContainer.scrollTo(0, messageContainer.scrollHeight);
}

export function decrypt(text) {
    let iv = Buffer.from(text.iv, 'hex');
    let encryptedText = Buffer.from(text.encryptedData, 'hex');
    let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}
