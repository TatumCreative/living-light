var Manifest        = require('./manifest');
var ManifestToPoem  = require('../common/core/manifestToPoem')
var CreatePoem      = require('../common/core/poem')
var StartWebSockets = require('../common/websockets')
var UiController    = require('./ui-controller')

;(function createPoem() {
	
	console.log('hello')
	ManifestToPoem.init( CreatePoem, { poem: Manifest } )
	// ManifestToPoem.load( "poem" )
	var websockets = StartWebSockets()
	
	UiController( websockets.socket, websockets.state )
	
})()