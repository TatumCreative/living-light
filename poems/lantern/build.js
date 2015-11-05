var Archiver     = require('archiver')
var Handlebars   = require('handlebars')
var Express      = require('express')
var Fs           = require('fs')
var Rimraf       = require('rimraf')
var Path         = require('path')
var PoemTemplate = Handlebars.compile( require('fs').readFileSync( __dirname + '/lantern.hbs', 'utf8' ) )

function _destination( filename ) {
	return __dirname + '/../../static/living-light-client/' + filename
}

function _copy( source, destination ) {
	return Fs.createReadStream( __dirname + '/' + source ).pipe(Fs.createWriteStream( destination ))
}

function _ensureExists( path ) {
	try {
	    Fs.mkdirSync( __dirname + '/' + path )
	} catch( err ) {
        if( !err.code == 'EEXIST' ) { throw err }
	}
}

;(function run() {
	
	// Ensure directories exist
	_ensureExists( '../../static/living-light-client' )
	_ensureExists( '../../static/living-light-client/common' )
	_ensureExists( '../../static/living-light-client/socket.io' )
	_ensureExists( '../../static/living-light-client/common/css' )
	_ensureExists( '../../static/living-light-client/common/vendor' )
	
	// Create the markup from the template
	var markup = PoemTemplate({
		title : "Lantern | Living Light",
		script : "bundle.js",
		version : 1,
		websiteUrl : "http://poem.gregtatum.com",
		socketIoUrl : 'common/vendor/socket.io.js',
	})
	
	Fs.writeFile( _destination('index.html'), markup, function(err) {
		if( err ) {
			throw err
		}
	})
	
	//Copy over the js and css
	_copy( 'static/bundle.js',     _destination('bundle.js') )
	_copy( 'static/bundle.js.map', _destination('bundle.js.map') )
	_copy( 'static/lantern.css',   _destination('lantern.css') )
	_copy( 'static/lantern.js',    _destination('lantern.js') )
	
	_copy('../../static/common/css/poem-base.css', _destination('common/css/poem-base.css') )
	_copy('../../static/common/css/poem-code.css', _destination('common/css/poem-code.css') )
	
	_copy('../../static/common/vendor/socket.io.js', _destination('/common/vendor/socket.io.js') )
	_copy('../../static/common/vendor/jquery-2.1.1.min.js', _destination('/common/vendor/jquery-2.1.1.min.js') )
	_copy('../../static/common/vendor/three.js', _destination('/common/vendor/three.js') )
	_copy('../../static/common/vendor/lodash.min.js', _destination('/common/vendor/lodash.min.js') )
	
	
	//Create a downloadable archive
	
	Fs.unlink( __dirname + '/../../static/living-light.zip', function (err) {
		if (err && err.code !== 'ENOENT') throw err;
	})
	
	var archive = Archiver('zip')
	
	var archiveWrite = Fs.createWriteStream( __dirname + '/../../static/living-light.zip')
	
	archive.pipe( archiveWrite )
	
	archive
		.directory( Path.resolve(__dirname, '../../static/living-light-client'), 'living-light' )
		.finalize()
	
	archiveWrite.on('close', function () {
		Rimraf( __dirname + '/../../static/living-light-client', function( err ) {})
	    console.log('living-light.zip has been written. ' + archive.pointer() + ' total bytes.')
	})
})()