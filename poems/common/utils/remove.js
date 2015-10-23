module.exports = function remove( array, element ) {
	
	var index = array.indexOf( element )
	if( index > 0 ) {
		array.splice( index, 1 )
	}
}