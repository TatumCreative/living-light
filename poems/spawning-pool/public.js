var Manifest        = require('./manifest');
var ManifestToPoem  = require('../common/core/manifestToPoem')
var CreatePoem      = require('../common/core/poem')

;(function createPoem() {

	ManifestToPoem.init( CreatePoem, { poem: Manifest } )
	ManifestToPoem.load( "poem" )

})()