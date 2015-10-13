var _ = require('lodash');
var CreateRelayRequest = require('./relay-request');

function _createMessageRelay( socket, poem ) {

	CreateRelayRequest( "message", socket, poem.socket )
}

function _relayCallback( err, data, reply ) {

	if( err ) {

		if(typeof callback === "function") {
			callback({
				success : false,
				message : err
			})
		}
		console.log("client: message error")
		return
	}
	
	console.log("client: message success")

	callback({
		success : true,
		data : data
	})
}

function _disconnect( socket ) {
	
	socket.emit( "poemDisconnected", {
		"message" : "The poem has been disconnected."
	})
	
	socket.disconnect()
}

module.exports = function createClient( socket, poem ) {

	socket.on( 'disconnect', _disconnect.bind(null, socket) )
	
	_createMessageRelay( socket, poem )
	
	return {
		disconnect : _disconnect.bind( null, socket )
	}
}