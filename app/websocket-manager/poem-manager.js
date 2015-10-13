var _ = require('lodash')

function _getPoemByCode( poems, code ) {
	
	return poems[ parseInt( code, 10 ) ]	
}

function _addPoem( poems, poem ) {
	
	// Add a poem but ensure a unique poem code
	
	var openIndices = (
		poems
		.map((poem, index) => {
			return poem ? null : index
		})
		.filter((index) => {
			return index !== null
		})
	)
	
	var index = _.random( openIndices.length - 1 )
	
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

module.exports = function createManager() {
	
	var poems = _.times(1000, () => null)
	
	return {
		addPoem        : _addPoem       .bind(null, poems),
		removePoem     : _removePoem    .bind(null, poems),
		getPoemByCode  : _getPoemByCode .bind(null, poems),
		countPoems     : _countPoems    .bind(null, poems),
	}
}