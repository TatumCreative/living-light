var OnTap = require('@tatumcreative/on-tap')

module.exports = function lanternUiController( socket, state ) {
	
	OnTap( document.getElementById('container-blocker'), function(e) {
		
		if( state.get('theirCode') !== null ) {
			
			var data = {
				x : e.x / window.innerWidth,
				y : e.y / window.innerHeight,
			}
			
			socket.emit('message', data, function( response ) {
				console.log('got a response', response)
			})
			console.log('sending message', data)
		}
	})
}