const express = require('express')
const path = require('path') // core node module, no need to install
const http = require('http')
const socketio = require('socket.io')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

// setup static directory to serve
app.use(express.static(publicDirectoryPath))

io.on('connection', () => {
    console.log('new web socket')
})

server.listen(port, () => {
    console.log('Server is up on port ' + port)
})