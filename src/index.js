const express = require('express')
const path = require('path') // core node module, no need to install
const http = require('http')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

// setup static directory to serve
app.use(express.static(publicDirectoryPath))

io.on('connection', (socket) => {
    console.log('new web socket connection')

    socket.on('join', (options, callback) => {
        const { error, user } = addUser({ id: socket.id, ...options })
        
        if (error) {
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('message',generateMessage('Admin', 'Welcome!'))
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined!`))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback()
        // io.to.emit - everyone in a specific room
        // socket.broadcast.to.emit - everyone in a room except client
    })

    // send to everyone
    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id)

        const filter = new Filter()
        if (filter.isProfane(message)){
            return callback('profanity is not allow')
        }
        // socket.emit('countUpdated', count)
        io.to(user.room).emit('message', generateMessage(user.username, message))
        callback()
    })

    socket.on('sendLocation', (obj, callback) => {

        const user = getUser(socket.id)



        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${obj.latitude},${obj.longitude}`))
        callback()
    })

    socket.on('disconnect', ()=> {
        const user = removeUser(socket.id)

        if (user) {
            io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }

    })
})

server.listen(port, () => {
    console.log('Server is up on port ' + port)
})