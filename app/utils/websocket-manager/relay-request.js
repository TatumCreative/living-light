var _ = require('lodash');
var Uuid = require('uuid')

var TIMEOUT = 30000

function _sendFn( names, sockets, unresolvedRequests, callback ) {
	
	function send( dataToSend, replyBack ) {

		console.log("RelayRequest: send()")
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
			console.log("RelayRequest: receive() resolving request")
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
	
	sockets.from.on( names.request, _sendFn(
		names,
		sockets,
		unresolvedRequests,
		callback
	))
	
	sockets.to.on( names.response , _receiveFn(
		unresolvedRequests
	))
}