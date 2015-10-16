var EventEmitter = require('events').EventEmitter
var CurrentState = require('@tatumcreative/current-state')

function _setSocketEvents( state, socket ) {
	
	socket.on('connect', function() {
		// console.log('connected')
		
		socket.emit("setPoem", state.get("myCode") )
		state.set({
			isConnected : true,
			connectionRequestSent: true,
			connectionError : false,
		})
	})
	
	socket.on('disconnect', function() {
	
		state.set({
			isConnected : false,
			connectionError : false,
			theirCode : null,
			myCode : null,
			connectionRequestSent : false
		})
	})
	
	socket.on('connect_error', function(err) {
		state.set({
			connectionError: true
		})
	})
	
	socket.on("setPoem", function( code ) {
		state.set("myCode", code)
	})
	
	socket.on("removePoem", function() {
		state.set("theirCode", null)
	})
	
	socket.on('message', function(e) {
		console.log('message received', e.data)
	})
}

function _numbersOnly( text ) {
	
	var digits = _.filter( text.split(''), function( digit ) {
		var isNumber = /[$0-9^]/
		return Boolean( digit.match( isNumber ) )
	})
	
	return digits.join('')
}

function _tryToConnectToPoem( state, socket, $input, code ) {
	
	// Hooks up this client to that poem
	socket.emit( 'setClient', code, function( connectedToCode ) {

		if( $input.val() === code ) {
			
			if( _.isString( connectedToCode ) ) {
				
				$('.code-poem-number').blur()
				state.set('theirCode', connectedToCode)
			}
		}
	})
}

function _codeInputChangedFn( state, socket, $input ) {
	
	var prevCode
	
	return function codeInputChanged( rawCode ) {
		
		// Sanitize code
		var code = _numbersOnly( rawCode )
		if( code.length > 3 ) {	code = prevCode	}
		
		// Update state if changed
		if( code !== prevCode ) {

			if( code.length !== 3 && prevCode && prevCode.length === 3 ) {
				socket.emit('removeClient')
			}
			
			state.set({
				theirCode: null,
				codeTypedComplete : (code.length === 3)
			})
			
			if( code.length === 3 ) {
				_tryToConnectToPoem( state, socket, $input, code )
			}
		}
		
		prevCode = code
		
		return code
	}
}

function _handleCodeInput( state, socket ) {
	
	var $input = $('.code-poem-number')

	$input.on('keyup', (function() {

		var codeInputChanged = _codeInputChangedFn( state, socket, $input )
		
		return function handleCodeInputChange() {
		
			var codeInInput = $input.val()
			var code = codeInputChanged( codeInInput )
		
			if( code !== codeInInput ) {
				$input.val(code)
			}
		}
	})())
	
	$input.on('focus', function handleCodeInputFocus() {
		
		$input.select()
		 
		if( $input.val() === "..." ) {
			$input.val('')
		}
	})
	
	$input.on('blur', function handleCodeInputBlur() {
		
		if( $input.val() === "" ) {
			$input.val('...')
		}
	})
}

function _updateStatusMessageFn() {
	
	var $myCode            = $('.code-yours-number')
	var $status            = $('.code-status')
	var $theirCodeWrapper  = $('.code-poem-inner')
	
	return function updateStatusMessage( current ) {
	
		var fullyConnected = false
	
		if( current.isConnected ) {
		
			if( current.myCode !== null ) {
			
				$myCode.text( current.myCode )
			
				if( current.theirCode !== null ) {
					$status.text( "Connected" )
					fullyConnected = true
				} else {
					$status.text( "Type Code Here" )
				}
			} else {
				$status.text( "Connecting" )
				$myCode.text( "..." )
			}
		
		} else {
			if( current.connectionError ) {
				$status.text( "Connection Error" )
			} else {
				$status.text( "Disconnected" )
			}
			$myCode.text( "..." )
		}
		
		$theirCodeWrapper.toggleClass( 'connected', fullyConnected )
	}
}

module.exports = function manageWebsocketConnection( socket, state ) {
	
	var socket = socket = io( window.WEBSITE_URL + "/io")

	var state = CurrentState({
		isConnected : false,
		connectionError : false,
		codeTypedComplete : false,
		theirCode : null,
		myCode : null,
		connectionRequestSent : false
	})
	
	state.on( 'changed', _updateStatusMessageFn() )
	_handleCodeInput( state, socket )
	_setSocketEvents( state, socket )
	
	return {
		state : state,
		socket : socket
	}
}