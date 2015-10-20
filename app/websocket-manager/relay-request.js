var _ = require('lodash');
var Uuid = require('uuid')

var TIMEOUT = 30000

function _sendFn( names, sockets, unresolvedRequests, callback ) {
	
	return function send( dataToSend, replyBack ) {

		console.log("relay-request: send message")
		var requestId = Uuid.v4()
		
		new Promise((resolve, reject) => {
		
			if( sockets.from.disconnected === true ) {
				return reject("your connection appears to have been dropped.", callback)
			}
		
			if( sockets.to.disconnected === true ) {
				return reject("the poem has been disconnected.", callback)
			}
		
			unresolvedRequests.push( {
				resolve     : resolve,
				requestId   : requestId,
				replyBack   : replyBack
			})
		
			sockets.to.emit( names.request, {
				responseName : names.response,
				requestId : requestId,
				data : dataToSend
			})
		
			setTimeout(function() {
				reject("the poem took too long to respond")
			}, TIMEOUT)
			
		})
		.then(
			(data)  => { callback( null, data ) },
			(error) => { callback( error ) }
		)
	}
}	

function _receiveFn( unresolvedRequests ) {
	
	return function receive( response ) {
	
		var request = _.find(unresolvedRequests, ( request ) => {
			return response.requestId === request.requestId 
		})
	
		if( request ) {
		
			unresolvedRequests.splice( unresolvedRequests.indexOf( request ), 1)
			request.resolve( response.data )
			if( request.replyBack ) {
				request.replyBack( response.data )
			}
			console.log("relay-request: receive() resolving request", response.data)
		}
	}
}

module.exports = function createRelayRequest( requestName, fromSocket, toSocket, callback ) {

	var unresolvedRequests = []
	
	var names = {
		request : requestName,
		response : requestName + "-response-" + Uuid.v4()
	}
	
	var sockets = {
		from : fromSocket,
		to : toSocket
	}
	
	var send = _sendFn( names, sockets, unresolvedRequests, callback )
	var receive = _receiveFn( unresolvedRequests )
	
	sockets.from.on( names.request, send )
	sockets.to.on( names.response, receive )
	
	return function disconnectRelayRequest() {
		sockets.from.removeListener( names.request, send )
		sockets.to.removeListener( names.response, receive )
	}
}