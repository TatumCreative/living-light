var EventEmitter = require('events').EventEmitter
module.exports = function setupClientIOConnection() {
	
	var emitter = new EventEmitter()
	var current = {}
	var socket = socket = io("http://local.poem.gregtatum.com:8765/io")
	
	socket.on('connect', function() {
		socket.emit("setPoem", current.code)
	})
	
	socket.on('disconnect', function() {
		$('.code-yours-number').text( "..." )
		$('.code-status').text( "Disconnected" )
	})
	
	socket.on('connect_error', function(err) {
		$('.code-status').text( "Connection Error" )
	})
	
	socket.on("setPoem", function( code ) {
		current.code = code
		$('.code-yours-number').text( code )
		$('.code-status').text( "Type Here" )
	})
	
	socket.on('tap', function() {
		console.log('tap')
	})
	
	return {
		emitter : emitter,
		current : current,
		socket : socket
	}
}