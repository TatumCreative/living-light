var CreateClient = require('./client')
var CreatePoem = require('./poem')
var CreatePoemManager = require('./poem-manager')
var Numeral = require('numeral')

function _addLeadingZeros( number, digits ) {
	
    var string = String(number)

    while( string.length < digits ) {
		string = "0" + string
	}
    return string;
}

function _setPoemFn( socket, poemManager ) {

	return function setPoem() {
		
		var poem = CreatePoem( socket )
		var index = poemManager.addPoem( poem )
		poem.code = _addLeadingZeros( index, 3 )

		socket.emit('setPoem', poem.code)

		socket.on( 'disconnect', function() {
	
			console.log('ws-manager: removePoem - ' + poem.code)

			poemManager.removePoem( poem )
	
			console.log('ws-manager: poem manager has ' + poemManager.countPoems() + " poems")
		})

		console.log('ws-manager: setPoem - ' + poem.code)
		console.log('ws-manager: poem manager has ' + poemManager.countPoems() + " poems")
	}
}

function _setClientFn( socket, poemManager ) {
	
	var poem, client
	
	function tryToRemoveClient() {
		if( poem && client ) {
			poem.removeClient( client )
			client = null
			console.log('ws-manager: Removed client from poem ' + poem.code)
		}
	}

	socket.on( 'removeClient', tryToRemoveClient)
	
	return function setClient( code, result ) {
		
		tryToRemoveClient()
		poem = poemManager.getPoemByCode( code )
		
		if( poem ) {
			
			client = CreateClient( socket, poem )
			poem.addClient( client )
			
			result( code )
			
			console.log('ws-manager: Client joined poem ' + code + ' (' + poem.countClients() + ' clients)')
			
		} else {
			
			if( result ) {
				result()
			}
			if( code ) {
				console.log('ws-manager: Client could not find poem ' + code)
			}
		}
	}
}

module.exports = function createWebsocketManager( io, url ) {
	
	var poemManager = CreatePoemManager()
	
	console.log('Setting up socket.io on ', url)
	io.of( url ).on( 'connection', function handleNewConnections( socket ) {
		
		socket.on( 'setPoem', _setPoemFn(
			socket,
			poemManager
		))
		
		socket.on( 'setClient', _setClientFn(
			socket,
			poemManager
		))
		
		socket.on( 'removeClient', _setClientFn(
			socket,
			poemManager
		))
	})
}

