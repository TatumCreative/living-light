module.exports = function relayResponseFn( socket, event ) {
	
	return function relayResponse( data ) {
		
		socket.emit( event.responseName, {
			requestId : event.requestId,
			data      : data
		})
	}
}