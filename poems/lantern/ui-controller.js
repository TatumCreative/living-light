function _numbersOnly( text ) {
	
	var digits = _.filter( text.split(''), function( digit ) {
		var isNumber = /[$0-9^]/
		return Boolean( digit.match( isNumber ) )
	})
	
	return digits.join('')
}

function _manageCodeInput( $input, $status, state, socket, onTypeInCompleteCode ) {
	
	$input.on('focus', function() {
		
		$input.select()
		 
		if( $input.val() === "..." ) {
			$input.val('')
		}
	})
	
	$input.on('blur', function() {
		if( $input.val() === "" ) {
			$input.val('...')
		}
	})

	var prevText
	
	$input.on('keyup', function() {

		var inputText = $input.val()
		var currText = _numbersOnly( inputText )
		
		if( currText !== prevText ) {

			if( currText.length > 3 ) {
				currText = prevText
			}
		
			$status.text("Type Here")
			
			if( currText.length !== 3 && prevText.length === 3 ) {
				socket.emit('removeClient')
			}
			
			state.set({
				theirCode: null,
				codeTypedComplete : (currText.length === 3)
			})
			
			if( currText.length === 3 ) {
				onTypeInCompleteCode( currText )
			}
			
		}
		
		if( currText !== inputText ) {
			$input.val(currText)
		}
		prevText = currText
		
	})
}

function _onTypeInCompleteCode( socket, $codeInput, $status, state ) {
	
	return function onTypeInCompleteCode( poemCode ) {
		
		console.log('Trying to connect to poem', poemCode)
		// Hooks up this client to that poem
		socket.emit( 'setClient', poemCode, function( connectedToCode ) {

			console.log('The poem search returned', connectedToCode)
			
			if( $codeInput.val() === poemCode ) {
				
				if( _.isString( connectedToCode ) ) {
					
					console.log('Connecting to poem', connectedToCode)
					$('.code-poem-number').blur()
					state.set('theirCode', connectedToCode)
				}
			}
		})
	}
}

function _updateStatusMessageFn() {
	
	var $myCode            = $('.code-yours-number')
	var $status            = $('.code-status')
	var $theirCodeWrapper  = $('.code-poem-inner')
	
	return function updateStatusMessage( current ) {
	
		console.log(current)
		
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


module.exports = function lanternUiController( socket, state ) {
	
	var $codeInput = $('.code-poem-number')
	var $status = $('.code-status')
	
	state.on('changed', _updateStatusMessageFn())
	
	var onTypeInCompleteCode = _onTypeInCompleteCode(
		socket,
		$codeInput,
		$status,
		state
	)
	
	_manageCodeInput(
		$codeInput,
		$status,
		state,
		socket,
		onTypeInCompleteCode
	)
}