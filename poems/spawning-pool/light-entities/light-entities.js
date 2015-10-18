var TAU = Math.PI * 2
var Update = require('./update')

function _randomSphericalCoordinate( radius, spawnPoint ) {

	// Randomize using spherical coordinates
	// https://en.wikipedia.org/wiki/Spherical_coordinate_system

	var theta  = _.random( TAU, true )
	var phi    = _.random( TAU, true )
	var radius = _.random( radius, true )
	
	if( spawnPoint ) {
		var x = spawnPoint.x
		var y = spawnPoint.y
		var z = spawnPoint.z
	} else {
		var x = 0
		var y = 0
		var z = 0
	}
	
	return new THREE.Vector3(
		x + radius * Math.sin( theta ) * Math.cos( phi ),
		y + radius * Math.sin( theta ) * Math.sin( phi ),
		z + radius * Math.cos( theta )
	)
}

function _createEntity( config, spawnPoint ) {
	
	var position  = _randomSphericalCoordinate( config.radius, spawnPoint )
	var direction = _randomSphericalCoordinate( 1 )
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
	
	var hue = (age / 100000) % 1
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
		retrieved : false,
		index : -1
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
		
		_remove( list, entity )
		_remove( takenIndices, entity.index )
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

function _remove( array, element ) {
	
	var index = array.indexOf( element )
	if( index > 0 ) {
		array.splice( index, 1 )
	}
}

function _removeEntityFromMesh( entity, mesh ) {
	
	entity.points.forEach(function( point ) {
		_remove( mesh.geometry.vertices, point )
	})
	
	entity.colors.forEach(function( color ) {
		_remove( mesh.geometry.colors, color )
	})
	
	mesh.geometry.verticesNeedUpdate = true
	mesh.geometry.colorsNeedUpdate = true
}

function _createMesh( config, ratio ) {
	
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
	
	return new THREE.Points( geometry, material )
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

function _updateFn( config, mesh, entities ) {

	var avoidEdges = Update.avoidEdgesFn( config )
	var randomlyTurn = Update.randomlyTurnFn( config )
	var position = Update.positionFn( config )
	var repopulateEntities = _repopulateEntitiesFn( config, mesh, entities )
	
	return function update( e ) {
		
		mesh.rotation.y += config.meshRotation
		
		_.times( 10, repopulateEntities )

		for( var i=0; i < entities.list.length; i++ ) {
			var entity = entities.list[i]

			randomlyTurn( entity, e.elapsed )
			avoidEdges( entity )
			position( entity )
			
		}

		mesh.geometry.verticesNeedUpdate = true
		mesh.geometry.colorsNeedUpdate = true
		
		// if( mesh.geometry._bufferGeometry ) {
		// 	mesh.geometry._bufferGeometry.setFromObject( mesh.geometry )
		// }
	}
}

function _createInitialEntities( config, entities ) {
	
	_.times( config.count, function() {
		entities.add( _createEntity( config ) )
	})
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
		trailSpeed          : 0.5,
		edgeAvoidanceWeight : 0.5,
		meshRotation        : 0.001,
		simplexScale        : 0.005,
		veerRange           : 0.5,
		brightness          : 0.2,
		size                : 1.5,
	}, props)
	
	var mesh = _createMesh( config, app.ratio )
	var entities = _manageEntitiesFn( config, mesh )
	_createInitialEntities( config, entities )
	
	app.scene.add( mesh )
	app.emitter.on('update', _updateFn( config, mesh, entities ) )
	
	return mesh
}