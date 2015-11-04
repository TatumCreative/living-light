var Handlebars = require('handlebars')
var Express = require('express')
var PoemTemplate = Handlebars.compile(
	require('fs').readFileSync( __dirname + '/lantern.hbs', 'utf8' )
)

module.exports = function() {
	
	var route = Express.Router()
	
	route.use( Express.static(__dirname + '/static') )
	
	route.get('/', function(request, response) {
		
		response.status(200).send(
			PoemTemplate({
				title : "Lantern | Living Light",
				script : "/lantern/bundle.js",
				version : 1,
				websiteUrl : process.env.WEBSITE_URL,
				baseHref : '/lantern/',
				socketIoUrl : '../socket.io/socket.io.js',
			})
		)
	})
	
	return route
}