module.exports = function handleTap( poem, props ) {
	
	var config = _.extend({
		
	}, props)
	
	poem.websockets.socket.on('message', function() {
		console.log('hello')
	})
}