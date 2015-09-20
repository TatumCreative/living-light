/* global Q */
var EmitPromise = function( socket, command, data ) {
	
	var deferred = Q.defer();
	
	socket.emit(command, data, function( response ) {
		
		if( typeof response === "object" ) {
			
			if( response.success === true ) {
				
				deferred.resolve(response.data);
				
			} else {
				if( typeof response.message === "string" ) {
					deferred.reject( response.message );
				} else {
					deferred.reject( "The request was not successful." );
				}
			}
		} else {
			
			deferred.reject( "The response to your request could not be parsed." );
		}
		
	});
	
	return deferred.promise.timeout( 30000, "The request took too long to respond." );
};