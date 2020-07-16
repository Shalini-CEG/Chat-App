const express = require('express')
const path = require('path')
const socketio = require('socket.io')
const http = require('http')
const formatMessage = require('./utils/messages')
const {userJoin, getCurrentUser, userLeave, getRoomUsers} = require('./utils/users')


const app = express()
app.use(express.static(path.join(__dirname,'public')))
const server = http.createServer(app)
const io = socketio(server)
const admin = 'Admin rule '


io.on('connection', socket => {

    socket.on('joinRoom', ({username, room}) =>{
        //console.log('New WS connection...');
        const user = userJoin(socket.id, username, room);


        socket.join(user.room)
    //Welcome message
        socket.emit('message', formatMessage(admin,'Welcome to Chat Paradise'));
    // to specific room
        socket.broadcast.to(user.room).emit('message', formatMessage(admin,`${user.username} has joined!`))

        //Send user roominfo
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        })
    })


    socket.on('chatMessage', (msg) =>{
    
    const user = getCurrentUser(socket.id);

        io.to(user.room).emit('message',formatMessage(user.username , msg))
    })

    socket.on('disconnect', () =>{
        const user = userLeave(socket.id);

        if(user){
            io.to(user.room).emit('message', formatMessage(admin,`${user.username} has left the chat..`))
        };
        //Send user roominfo
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
          });
       
    });

});

server.listen(3000, () => console.log('Server is running on this port'));