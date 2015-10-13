function _numbersOnly( text ) {
	
	var digits = _.filter( text.split(''), function( digit ) {
		var isNumber = /[$0-9^]/
		return Boolean( digit.match( isNumber ) )
	})
	
	return digits.join('')
}

function _manageCodeInput( $input, $status, current, onTypeInCompleteCode ) {
	
	$input.on('focus', function() {
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

		var currText = _numbersOnly( $input.val() )

		if( currText !== prevText ) {

			if( currText.length > 3 ) {
				currText = prevText
			}
		
			current.poemCode = null
			$status.text("Type Here")
		
			if( currText.length === 3 ) {
				onTypeInCompleteCode( currText )
			}
		}
		
		$input.val(currText)
		prevText = currText
		
	})
}

function _onTypeInCompleteCode( socket, $codeInput, $status, current ) {
	
	return function onTypeInCompleteCode( poemCode ) {
		
		console.log('Trying to connect to poem', poemCode)
		// Hooks up this client to that poem
		socket.emit( 'setClient', poemCode, function( connectedToCode ) {

			console.log('The poem search returned', connectedToCode)
			
			if( $codeInput.val() === poemCode ) {
				
				if( _.isString( connectedToCode ) ) {
					
					console.log('Connecting to poem', connectedToCode)
					
					$status.text("Connected")
					current.poemCode = connectedToCode
				}
			}
		})
	}
}

module.exports = function lanternUiController( socket, current ) {
	
	var $codeInput = $('.code-poem-number')
	var $status = $('.code-status')
	
	var onTypeInCompleteCode = _onTypeInCompleteCode(
		socket,
		$codeInput,
		$status,
		current
	)
	
	_manageCodeInput(
		$codeInput,
		$status,
		current,
		onTypeInCompleteCode
	)
}