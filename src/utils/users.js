const users = []


//adduser
const addUser = ({id, username, room}) =>{
	//clean data
	username = username.trim().toLowerCase()
	room = room.trim().toLowerCase()

	if (!username || !room){
		return {
			error: 'Username and room are required!'
		}
	}

	const existingUser = users.find( (user) =>{
		return user.room === room && user.username === username
	})



	if (existingUser) {
		return {
			error:'Username is in use!'
		}
	}

	const user = {id,username,room}
	users.push(user)
	return {user}

}

//removeuser
const removeUser = (id) =>{
	const index = users.findIndex((user) =>  user.id === id)

	if(index !== -1){
		return users.splice(index, 1)[0]
	}

}



//getUser
const getUser = (id) => {
	return users.find((user) =>  user.id === id)
}



//getUsers
const getUsersInRoom = (room)=>{
	room = room.trim().toLowerCase()
	return users.filter((user) => user.room === room)
}

module.exports ={
	addUser,
	getUser,
	removeUser,
	getUsersInRoom
}