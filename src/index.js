const express = require('express')
const path = require('path')
const http = require('http')
const socketio = require('socket.io')
const Filter = require('bad-words')
const {generateMessage, generateLocationMessage} = require('./utils/messages')
const {addUser, getUser, removeUser, getUsersInRoom } = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000



//Path setting 
    //Public used for static
    //templates for handlebars
const publicDir = path.join(__dirname, '../public')

//Setup static directory to serve
app.use(express.static(publicDir))






io.on('connection', (socket) =>{
	console.log('New websocket connection')

	socket.on('join', (options, callback) =>{
		
		const {error, user} = addUser({id: socket.id, ...options})

		if (error){
			return callback(error)
		}


		socket.join(user.room)
		socket.emit('message',generateMessage('Server','Welcome!'))
		socket.broadcast.to(user.room).emit('message', generateMessage('Server',`${user.username} has joined!`))
		io.to(user.room).emit('roomData',{
			room: user.room,
			users: getUsersInRoom(user.room)
		})
		callback() // no errors
	})






	
	socket.on('sendMessage', (message, callback) => {
		const filter = new Filter()
		const user = getUser(socket.id)
		
		if (filter.isProfane(message)){
			return callback('Profanity is not allowed!')
		}
		
		io.to(user.room).emit('message', generateMessage(user.username, message))
		callback('Delivered')
	})



	socket.on('sendLocation', (location, callback) =>{
		const user = getUser(socket.id)
		
		io.to(user.room).emit('locationMessage', generateLocationMessage(user.username,
			 `https://google.com/maps?q=${location.latitude},${location.longitude}`))

		callback('Delivered!')
	})








	socket.on('disconnect', () =>{
		const user = removeUser(socket.id)
		
		if (user){
			io.to(user.room).emit('message', generateMessage('Server',`${user.username} has disconnected. . .`))
			io.to(user.room).emit('roomData',{
				room: user.room,
				users: getUsersInRoom(user.room)
			})
		}

	})
})



server.listen(port, () => {
    console.log(`Server started successfully! Port: ${port}`)
})