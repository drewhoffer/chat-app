const socket = io()

//elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $locationButton = document.querySelector('#sendLocation')


const $messages = document.querySelector('#messages')
const autoScroll = () =>{
	//New message element
	const $newMessage = $messages.lastElementChild

	//get height of new message
	const newMessageStyles = getComputedStyle($newMessage)
	const newMessageMargin = parseInt(newMessageStyles.marginBottom)
	const newMessageHeight = $newMessage.offsetHeight + newMessageMargin


	//visible height
	const visibleHeight = $messages.offsetHeight

	//Height of messages container
	const containerHeight = $messages.scrollHeight

	//figure out how far down we have scrolled
	const scrollOffset = $messages.scrollTop + visibleHeight

	//were we at bottom before last message was sent?
	if(containerHeight - newMessageHeight <= scrollOffset) {
		$messages.scrollTop = $messages.scrollHeight
	}

}
//templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//options

function parseQuery(queryString) {
    var query = {};
    var pairs = (queryString[0] === '?' ? queryString.substr(1) : queryString).split('&');
    for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i].split('=');
        query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
    }
    return query;
}


let queryString = window.location.search.substring(1) //Get my query string arguments

const args = Object.values(parseQuery(queryString)) //create array of strings
args.forEach((arg, index) => {return args[index] = args[index].split('+').join(' ') }) //splits string by + and joins then together

const {0:username, 1:room} = args //assign username to 0 index etc

socket.on('message', (message) =>{
	console.log(message)
	const html = Mustache.render(messageTemplate, {
		username: message.username,
		message: message.text,
		createdAt: moment(message.createdAt).format('h:mm a')
	})
	$messages.insertAdjacentHTML('beforeend', html)
	autoScroll()

})



socket.on('locationMessage', (message) =>{
	console.log(message)
	const html = Mustache.render(locationTemplate, {
		username: message.username,
		url: message.url,
		createdAt: moment(message.createdAt).format('h:mm a')
	})
	$messages.insertAdjacentHTML('beforeend', html)
	autoScroll()
})

socket.on('roomData', ({room, users}) => {
	console.log(users)
	const html = Mustache.render(sidebarTemplate,{
		room,
		users
	})
	document.querySelector('#sidebar').innerHTML = html
})


$messageForm.addEventListener('submit', (e) => {
	e.preventDefault();
	
	//disable form
	$messageFormButton.disabled = true

	const message = e.target.elements.message.value;

	socket.emit('sendMessage', message, (error) =>{

		//enable
		$messageFormButton.disabled = false
		$messageFormInput.focus()
		$messageFormInput.value = ''


		if (error) {
			return console.log(error)
		}
		console.log('Message delivered!')
	});
})


$locationButton.addEventListener('click', () =>{
	if (!navigator.geolocation){
		return alert('Geolocation is not supported by your browser.')
	}

	$locationButton.disabled = true

	navigator.geolocation.getCurrentPosition( (position) => {
		
		$locationButton.disabled = false
		//share position
		socket.emit('sendLocation', {
			latitude:position.coords.latitude,
		longitude: position.coords.longitude
		}, 
		() =>{
			console.log('Location shared!')
		});
	})
})


socket.emit('join', {username, room}, (error) => {
	if(error){
		location.href = '/'
		alert(error)
	}
})