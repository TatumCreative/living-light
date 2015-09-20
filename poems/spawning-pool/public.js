console.log('hello world')

var EventEmitter   = require('events').EventEmitter
var Manifest       = require('./manifest');
var ManifestToPoem = require('../common/core/manifestToPoem')
var CreatePoem     = require('../common/core/poem')

;(function createPoem() {

	var emitter = new EventEmitter()

	ManifestToPoem.init( CreatePoem, { poem: Manifest } )
	ManifestToPoem.load( "poem" )

})()