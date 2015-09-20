var CreatePoemManager = require('./poem-manager')
var Numeral = require('numeral')

function _addLeadingZeros( number, digits ) {
	
    var string = String(number)

    while( string.length < digits ) {
		string = "0" + string
	}
    return string;
}

function _setPoemFn( socket, poemManager, createPoem, createClient ) {

	return function setPoem( data, result ) {
		
		var poem = createPoem( socket )
		var index = poemManager.addPoem( poem )
		poem.code = _addLeadingZeros( index, 3 )

		result({
			success : true,
			data : { code : poem.code }
		})

		socket.on( 'disconnect', function() {
	
			poemManager.removePoem( poem )
	
			console.log('ws-manager: removePoem - ' + requestedPoemCode)
			console.log('ws-manager: poem manager has ' + poemManager.countPoems() + " poems")
		})

		console.log('ws-manager: setPoem - ' + poem.code)
		console.log('ws-manager: poem manager has ' + poemManager.countPoems() + " poems")
	}
}

function _setClientFn( socket, poemManager, createClient ) {
	
	return function setClient( code, result ) {
		
		var poem = poemManager.getPoemByCode( code )
		
		if( poem ) {
			
			var client = createClient( socket, poem )
			poem.addClient( client )
			
			
			result({
				success : true,
				data : { code : code }
			})
			
			console.log('ws-manager: joinPoem code ' + code)
			console.log('ws-manager: joinPoem clients ' + poem.clients.length)
			
		} else {
			
			result({
				success : false,
				message : "A poem with the code '"+code+"' could not be found."
			})
			
			console.log('ws-manager: No poem to connect to.')
		}
	}
}

module.exports = function createWebsocketManager( io, urlPrefix, createPoem, createClient ) {
	
	var poemManager = CreatePoemManager()
	
	io.of( urlPrefix ).on( 'connection', function handleNewConnections( socket ) {
		
		socket.on( 'setPoem', _setPoemFn(
			socket,
			poemManager,
			createPoem,
		))
		
		socket.on( 'setClient', _setClientFn(
			socket,
			poemManager,
			createClient
		))
	})
}

