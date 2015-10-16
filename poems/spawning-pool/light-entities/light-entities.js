var TAU = Math.PI * 2
var SimplexNoise = require('simplex-noise')

function _randomSphericalCoordinate( radius ) {

	// Randomize using spherical coordinates
	// https://en.wikipedia.org/wiki/Spherical_coordinate_system

	var theta  = _.random( TAU, true )
	var phi    = _.random( TAU, true )
	var radius = _.random( radius, true )
	
	return new THREE.Vector3(
		radius * Math.sin( theta ) * Math.cos( phi ),
		radius * Math.sin( theta ) * Math.sin( phi ),
		radius * Math.cos( theta )
	)
}

function _createEntity( config ) {

	var position  = _randomSphericalCoordinate( config.radius )
	var direction = _randomSphericalCoordinate( 1 )
	
	var points = _.times( config.trailCount, function createInitialPointsTrail( i ) {
		//Create a points trail
		return (
			new THREE.Vector3()
			.copy(direction)
			.multiplyScalar( i * config.trailDistance )
			.add( position )
		)
	})
	
	var hue = Math.random() * 0.3 + 0.5
	var colors = _.times( config.trailCount, function( i ) {
		var unitI = (i + 1) / (config.trailCount + 1)
		return new THREE.Color().setHSL( hue, 1, config.brightness * (1 - unitI) )
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
		veer : veer
	}
}

function _addEntityToMesh( entity, mesh ) {
	
	entity.points.forEach(function( point ) {
		mesh.geometry.vertices.push( point )
	})
	
	entity.colors.forEach(function( color ) {
		mesh.geometry.colors.push( color )
	})
	
	mesh.geometry.verticesNeedUpdate = true
	mesh.geometry.colorsNeedUpdate = true
}

function _createMesh( config, ratio ) {
	
	var geometry = new THREE.Geometry()
	geometry.dynamic = true

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

function _updateFn( config, mesh, entities ) {

	var avoidEdgeDirection = new THREE.Vector3(1,0,0)
	var origin = new THREE.Vector3(0,0,0)
	var radiusSq = config.radius * config.radius
	
	var simplexA = new SimplexNoise()
	var simplexB = new SimplexNoise()
	var max = 0
	var min = 0
	
	return function update( e ) {
		
		mesh.rotation.y += config.meshRotation
		
		for( var i=0; i < entities.length; i++ ) {
			var entity = entities[i]

			var theta = TAU * simplexA.noise4D(
				config.simplexScale * entity.position.x,
				config.simplexScale * entity.position.y,
				config.simplexScale * entity.position.z,
				0.0001 * e.elapsed
			)
			
			max = Math.max( theta, max )
			min = Math.min( theta, min )
			
			var phi = TAU * simplexB.noise4D(
				config.simplexScale * entity.position.x,
				config.simplexScale * entity.position.y,
				config.simplexScale * entity.position.z,
				0.0001 * e.elapsed
			)
			
			//----------------------------------------------
			// Randomly turn the entities
			entity.direction.x += entity.veer.x + config.turnSpeed * Math.sin( theta ) * Math.cos( phi )
			entity.direction.y += entity.veer.y + config.turnSpeed * Math.sin( theta ) * Math.sin( phi )
			entity.direction.z += entity.veer.z + config.turnSpeed * Math.cos( theta )
			
			entity.direction.normalize()
			
			//----------------------------------------------
			// Avoid the edges
			var distanceToOriginSq = entity.position.distanceToSquared( origin )
			
			avoidEdgeDirection
				.copy( entity.position )
				.normalize()
				.multiplyScalar( - distanceToOriginSq / radiusSq * config.edgeAvoidanceWeight )
			
			entity.direction.add( avoidEdgeDirection ).normalize()
			
			//----------------------------------------------
			// Apply the direction with the move speed
			entity.position.x += config.moveSpeed * entity.direction.x
			entity.position.y += config.moveSpeed * entity.direction.y
			entity.position.z += config.moveSpeed * entity.direction.z
			
			//----------------------------------------------
			// Move the first point
			entity.points[0].copy( entity.position )
			
			//----------------------------------------------
			// Follow the leader
			for( var j=1; j < entity.points.length; j++ ) {
				
				var currPoint = entity.points[j]
				var prevPoint = entity.points[j-1]
				
				currPoint.lerp( prevPoint, config.trailSpeed )
				
			}
		}
		mesh.geometry.verticesNeedUpdate = true
	}
}

module.exports = function createLightEntities( app, props ) {
	
	var config = _.extend({
		count : 5000,
		radius : 200,
		trailCount : 100,
		trailDistance : 1,
		moveSpeed : 1,
		turnSpeed : 0.9,
		trailSpeed : 0.5,
		edgeAvoidanceWeight : 0.5,
		meshRotation : 0.001,
		simplexScale : 0.005,
		veerRange : 0.5,
		brightness : 0.2,
		size: 1.5
	}, props)
	
	var entities = _.times( config.count, function() {
		return _createEntity(config)
	})
	
	var mesh = _createMesh( config, app.ratio )
	
	entities.forEach(function( entity ) {
		_addEntityToMesh( entity, mesh )
	})
	
	app.scene.add( mesh )
	app.emitter.on('update', _updateFn( config, mesh, entities ) )
	
	return mesh
}