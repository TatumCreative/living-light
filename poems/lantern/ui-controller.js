var OnTap        = require('@tatumcreative/on-tap')

module.exports = function lanternUiController( socket, state ) {
	
	OnTap( document.getElementById('container-blocker'), function(e) {
		if( state.get('theirCode') !== null ) {
			socket.emit('message', e)
			console.log('sending message', e)
		}
	})
}