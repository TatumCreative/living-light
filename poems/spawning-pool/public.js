var Manifest        = require('./manifest');
var ManifestToPoem  = require('../common/core/manifestToPoem')
var CreatePoem      = require('../common/core/poem')
var StartWebSockets = require('../common/websockets')

;(function createPoem() {

	ManifestToPoem.init( CreatePoem, { poem: Manifest } )
	ManifestToPoem.load( "poem" )
	StartWebSockets()

})()