var EventEmitter = require('events').EventEmitter
var CurrentState = require('@tatumcreative/current-state')



function _setSocketEvents( socket, state ) {
	
	socket.on('connect', function() {
		console.log('connected')
		
		socket.emit("setPoem", state.get("myCode") )
		state.set({
			isConnected : true,
			connectionRequestSent: true,
			connectionError : false,
		})
	})
	
	socket.on('disconnect', function() {
	
		state.set({
			isConnected : false,
			connectionError : false,
			theirCode : null,
			myCode : null,
			connectionRequestSent : false
		})
	})
	
	socket.on('connect_error', function(err) {
		state.set({
			connectionError: true
		})
	})
	
	socket.on("setPoem", function( code ) {
		console.log('setPoem', code)
		state.set("myCode", code)
	})
	
	socket.on('tap', function() {
		console.log('tap')
	})
}

module.exports = function setupClientIOConnection() {
	
	var socket = socket = io("http://local.poem.gregtatum.com:8765/io")

	var state = CurrentState({
		isConnected : false,
		connectionError : false,
		codeTypedComplete : false,
		theirCode : null,
		myCode : null,
		connectionRequestSent : false
	})
	
	_setSocketEvents( socket, state )
	
	return {
		state : state,
		socket : socket
	}
}