var _ = require('lodash');
var CreateRelayRequest = require('./relay-request');

function _relayCallback( err, data, reply ) {

	// what is this? can I delete it?
	
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


module.exports = function createClient( socket, poem ) {

	var destroyRelay = CreateRelayRequest( "message", socket, poem.socket )

	return {
		socket : socket,
		destroy : destroyRelay
	}
}