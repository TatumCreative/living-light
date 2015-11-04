var WebsocketManager = require('../websocket-manager/websocket-manager')
var Express = require('express')

module.exports = function( app, io ) {
	
	WebsocketManager( io, "/io" )
	
	app.use( "/spawning-pool", require('../../poems/spawning-pool/route')() )
	app.use( "/lantern",       require('../../poems/lantern/route')() )
	
	//Configure statics
	app.use(Express.static(process.cwd() + '/static'))
	app.use('/lantern', Express.static(process.cwd() + '/static'))
	
	app.get('*', function(request, response) {
		response.status(404).send("404")
	})
	
	
}