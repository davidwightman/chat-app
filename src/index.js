const express = require('express')
const path = require('path') // core node module, no need to install
const http = require('http')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

// setup static directory to serve
app.use(express.static(publicDirectoryPath))

io.on('connection', (socket) => {
    console.log('new web socket connection')
   
  

    socket.on('join', ({ username, room}) => {
        socket.join(room)

    socket.emit('message',generateMessage('welcome'))

    socket.broadcast.to(room).emit('message', generateMessage(`${username} has joined!`))

        // io.to.emit - everyone in a specific room
        // socket.broadcast.to.emit - everyone in a room except client
    })

    // send to everyone
    socket.on('sendMessage', (message, callback) => {
        const filter = new Filter()
        if (filter.isProfane(message)){
            return callback('profanity is not allow')
        }
        // socket.emit('countUpdated', count)
        io.to('a').emit('message', generateMessage(message))
        callback()
    })

    socket.on('sendLocation', (obj, callback) => {
        io.emit('locationMessage', generateLocationMessage(`https://google.com/maps?q=${obj.latitude},${obj.longitude}`))
        callback()
    })

    socket.on('disconnect', ()=>{
        io.emit('message', generateMessage('a user has left'))
    })
})

server.listen(port, () => {
    console.log('Server is up on port ' + port)
})