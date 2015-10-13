var Handlebars = require('handlebars')
var Express = require('express')
var PoemTemplate = Handlebars.compile(
	require('fs').readFileSync( __dirname + '/spawning-pool.hbs', 'utf8' )
)

module.exports = function() {
	
	var route = Express.Router()
	
	route.use(Express.static(__dirname + '/static'))
	
	route.get('/', function(request, response) {
		
		response.status(200).send(
			PoemTemplate({
				title : "Spawning Pool | Living Light",
				script : "/spawning-pool/bundle.js",
				version : 1
			})
		)
	})
	
	return route
}