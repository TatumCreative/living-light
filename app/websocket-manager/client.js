var _ = require('lodash');
var CreateRelayRequest = require('./relay-request');

module.exports = function createClient( socket, poem ) {

	var destroyRelay = CreateRelayRequest( "message", socket, poem.socket )

	return {
		socket : socket,
		destroy : destroyRelay
	}
}