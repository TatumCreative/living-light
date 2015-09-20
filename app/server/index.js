var Http = require('http')
var Express = require('express')
var SocketIO = require('socket.io');
var Dotenv = require('dotenv')


;(function() {
	
	Dotenv.load()
	var app = Express()
	app.locals.env = process.env
	
	
	//Configure view engine
	require('./config/view-engine')( app )

	//Start the server
	var port   = process.env.PORT || 8765
	var server = Http.createServer(app)
	var io = SocketIO(server);

	server.listen(port, function() {
		console.log('Living light server listening at: ' + process.env.WEBSITE_URL)
	})

	//Configure statics
	app.use(Express.static(process.cwd() + '/static'))

	//Configure routes
	require('../routes/routes')( app, io )
	
})()