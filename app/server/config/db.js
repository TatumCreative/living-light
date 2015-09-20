var _ = require('lodash')
  , Mongoose = require('mongoose')
  , LoadModels = require('../../app/models/load-models')

module.exports = function startMongoose( runOnFirstConnect ) {
	
	return new Promise(function(resolve, reject) {

		var db = Mongoose.connection
	
		var connect = function() {
			var options = { server: { socketOptions: { keepAlive: 1 } } }
			Mongoose.connect(process.env.MONGODB_URL, options)
		}

		db.on('error', function(err) {
			console.error.bind(console, 'connection error:')
			reject.apply(this, arguments)
		})
	
		db.on('disconnected', connect)
	
		db.once('open', function() {
			LoadModels()
			runOnFirstConnect()
			resolve()
		})
	
		connect()
	})
	
}