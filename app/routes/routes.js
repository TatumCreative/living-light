module.exports = function( app, io ) {
	
	app.use( "/spawning-pool", require('../../poems/spawning-pool/route')() )
	
	app.get('*', function(request, response) {
		response.status(404).send("404")
	})
}