var Handlebars = require('handlebars')
var _ = require('lodash')
var Helpers = require('../../templates/helpers')


module.exports = function( app ) {
	
	_.each(Helpers, function( fn, key ) {
		Helpers.registerFunction( key, fn )
	})
	
	app.use(function( req, res, next ) {
		res.handlebars = Handlebars
		next()
	})
	
}