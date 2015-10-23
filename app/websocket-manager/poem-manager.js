var _ = require('lodash')

function _getPoemByCode( poems, code ) {
	
	return poems[ parseInt( code, 10 ) ]	
}

function _addPoem( poems, poem, codeToCheck ) {
	
	// Add a poem but ensure a unique poem code
	var index
	
	//Try to connect to a specific code
	if( codeToCheck ) {
		
		var code = parseInt(codeToCheck, 10)
		if( code >= 0 && code < 1000 ) {
			if( !poems[code] ) {
				index = code
			}
		}
	}
	
	//If no index yet find a random open one
	if( !index ) {
		
		var openIndices = (
			poems
			.map((poem, index) => {	return poem ? null : index })
			.filter((index) => { return index !== null })
		)
	
		index = _.random( openIndices.length - 1 )
	}
	
	poems[index] = poem
	
	return index
}

function _removePoem( poems, poem ) {
	
	var i = poems.indexOf( poem )
	
	poem.disconnect()
	
	poems[i] = null
	
}

function _countPoems( poems ) {
	
	return poems.reduce(function( memo, poem ) {
		if( poem ) {
			memo++
		}
		return memo
	}, 0)
}

function _removeClient( poems, socket ) {
	
	for( var i=0; i < poems.length; i++ ) {
		var poem = poems[i]
		
		if( poem ) {
			poem.removeClientBySocket( socket )
		}
	}
}

module.exports = function createManager() {
	
	var poems = _.times(1000, () => null)
	
	return {
		addPoem        : _addPoem       .bind(null, poems),
		removePoem     : _removePoem    .bind(null, poems),
		getPoemByCode  : _getPoemByCode .bind(null, poems),
		countPoems     : _countPoems    .bind(null, poems),
		removeClient   : _removeClient  .bind(null, poems),
	}
}