var WebsocketManager = require('../websocket-manager/websocket-manager')

module.exports = function( app, io ) {
	
	WebsocketManager( io, "/io" )
	
	app.use( "/spawning-pool", require('../../poems/spawning-pool/route')() )
	app.use( "/lantern",       require('../../poems/lantern/route')() )
	
	app.get('*', function(request, response) {
		response.status(404).send("404")
	})
}