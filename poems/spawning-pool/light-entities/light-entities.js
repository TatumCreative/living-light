var Update = require('./update')
var RelayResponseFn = require('../../common/utils/relay-response')
var RandomSpherical = require('random-spherical/object')( Math.random, THREE.Vector3 )
var Remove = require('../../common/utils/remove')

function _createEntity( config, spawnPoint ) {
	
	var position  = RandomSpherical( config.radius, spawnPoint )
	var direction = RandomSpherical()
	var age       = Date.now()
	
	var points = _.times( config.trailCount, function createInitialPointsTrail( i ) {
		//Create a points trail
		return (
			new THREE.Vector3()
			.copy(direction)
			.multiplyScalar( i * config.trailDistance )
			.add( position )
		)
	})
	
	var hue = (age * config.hueShiftSpeed) % 1
	var colors = _.times( config.trailCount, function( i ) {
		var unitI = (i + 1) / (config.trailCount + 1)
		return new THREE.Color().setHSL( hue, 0.9, config.brightness * (1 - unitI) )
	})
	
	var veer = new THREE.Vector3(
		_.random( -config.veerRange, config.veerRange, true ),
		_.random( -config.veerRange, config.veerRange, true ),
		_.random( -config.veerRange, config.veerRange, true )
	)
	
	return {
		position : position,
		direction : direction,
		points : points,
		colors : colors,
		veer : veer,
		age : age,
		trailSpeed : config.trailSpeedNormal,
		seekRetrieval : false,
		index : -1,
		response : null,
	}
}

function _manageEntitiesFn( config, mesh ) {
	
	var list = []
	var takenIndices = []
	var availableIndices = _.times( config.targetCount )
	var offscreenVertex = new THREE.Vector3( 0, -10000, 0 )
	
	function add( entity ) {
		
		var index = availableIndices.pop()
		var offset = index * config.trailCount
		takenIndices.push( index )
		list.push( entity )
		entity.index = index
		entity.points.forEach(function( point, i ) {
			mesh.geometry.vertices[ offset + i ] = point
		})
	
		entity.colors.forEach(function( color, i ) {
			mesh.geometry.colors[ offset + i ] = color
		})
	
		mesh.geometry.verticesNeedUpdate = true
		mesh.geometry.colorsNeedUpdate = true
	}
	
	function remove( entity ) {
		
		Remove( list, entity )
		Remove( takenIndices, entity.index )
		availableIndices.push( entity.index )
		
		var offset = entity.index * config.trailCount
		
		entity.points.forEach(function( point, i ) {
			mesh.geometry.vertices[ offset + i ] = offscreenVertex
		})
	
		entity.colors.forEach(function( color, i ) {
			mesh.geometry.colors[ offset + i ] = offscreenVertex
		})
	
		mesh.geometry.verticesNeedUpdate = true
		mesh.geometry.colorsNeedUpdate = true
		entity.index = -1
	}

	return {
		add : add,
		remove : remove,
		list : list
	}
}

function _createMesh( config, ratio, scene ) {
	
	var geometry = new THREE.Geometry()
	var count = config.targetCount * config.trailCount
	
	// Fill in blank vertices and colors for correct buffer sizes
	geometry.vertices = _.times(count, _.constant( new THREE.Vector3(0,-10000,0) ) )
	geometry.colors   = _.times(count, _.constant( new THREE.Color() ) )
	geometry.dynamic  = true

	var material = new THREE.PointsMaterial({
		color: 0x888888,
		size: config.size * ratio,
		vertexColors: THREE.VertexColors,
		blending : THREE.AdditiveBlending,
		transparent : true,
		depthTest : false,
		fog: false
	})
	
	var mesh = new THREE.Points( geometry, material )
	mesh.frustumCulled = false
	scene.add( mesh )
	
	return mesh
}

function _repopulateEntitiesFn( config, mesh, entities ) {
	
	var spawnPoint = new THREE.Vector3( 0, -config.radius * 2, 0 )
	
	return function repopulateEntities() {
		// 0 full, 1 empty
		var unitPopulation = (config.targetCount - entities.list.length) / config.targetCount
		
		if( Math.random() < config.repopulateChance && Math.random() < unitPopulation ) {
			entities.add(
				_createEntity( config, spawnPoint )
			)
		}
	}
}

function _handleEntityRequests( config, socket, entities ) {
	
	function getEntitiesToSend() {
		var entitiesToSend = []
		var i = 0
		
		while( i++ < entities.list.length && entitiesToSend.length < config.entitiesToSend ) {
			var entity = entities.list[i]
			if( !entity.seekRetrieval ) {
				entitiesToSend.push( entity )
			}
		}
		
		return entitiesToSend
	}
	
	socket.on('message', function( event ) {
		
		var entitiesToSend = getEntitiesToSend()
		var responseData = entitiesToSend.map(function( entity ) {
			return {
				color : entity.colors[0].getHex(),
				age : entity.age
			}
		})
		
		Promise.all( entitiesToSend.map(function( entity ) {
			return new Promise( function( resolve ) {
				
				// The entity starts seeking the exit. Once it is found the promise is resolved
				entity.trailSpeed = config.trailSpeedSeeking
				entity.seekRetrieval = true
				
				entity.retrievalDone = function retrievalDone() {
					entities.remove( entity )
					entity.trailSpeed = config.trailSpeedNormal
					entity.retrievalDone = null
					entity.seekRetrieval = false
					resolve()
				}
			})
		}))
		.then( function() {
			var respond = RelayResponseFn( socket, event )
			// console.log('Responding with', responseData )
			respond( responseData )
		})
	})
}

function _createInitialEntities( config, entities ) {
	
	_.times( config.count, function() {
		entities.add( _createEntity( config ) )
	})
}

function _updateFn( app, config, mesh, entities ) {

	var avoidEdges         = Update.avoidEdgesFn( config )
	var randomlyTurn       = Update.randomlyTurnFn( config )
	var position           = Update.positionFn( config )
	var seekRetrieval      = Update.seekRetrievalFn( config, entities, app.camera.object )
	var repopulateEntities = _repopulateEntitiesFn( config, mesh, entities )

	return function update( e ) {
		
		// mesh.rotation.y += config.meshRotation
		
		_.times( 10, repopulateEntities )

		for( var i=0; i < entities.list.length; i++ ) {
			var entity = entities.list[i]

			if( entity.seekRetrieval ) {
				var didRetrieve = seekRetrieval( entity )
				if( didRetrieve ) {	i--	}
				
			} else {
				randomlyTurn( entity, e.elapsed )
				avoidEdges( entity )
			}
			position( entity )
		}

		mesh.geometry.verticesNeedUpdate = true
	}
}

module.exports = function createLightEntities( app, props ) {
	
	var config = _.extend({
		count               : 5000,
		targetCount         : 5000,
		count               : 1,
		repopulateChance    : 0.5,
		radius              : 200,
		trailCount          : 100,
		trailDistance       : 1,
		moveSpeed           : 1,
		turnSpeed           : 0.9,
		trailSpeedNormal    : 0.5,
		trailSpeedSeeking   : 0.9,
		edgeAvoidanceWeight : 0.5,
		meshRotation        : 0.001,
		simplexScale        : 0.005,
		veerRange           : 0.5,
		brightness          : 0.2,
		size                : 1.5,
		hueShiftSpeed       : 0.00001,
		entitiesToSend      : 10,
	}, props)
	
	var socket     = app.websockets.socket
	var mesh       = _createMesh( config, app.ratio, app.scene )
	var entities   = _manageEntitiesFn( config, mesh )
	
	_handleEntityRequests( config, socket, entities )
	_createInitialEntities( config, entities )
	
	app.emitter.on('update', _updateFn( app, config, mesh, entities ) )
	
	return mesh
}