var TAU = Math.PI * 2
var SimplexNoise = require('simplex-noise')

exports.randomlyTurnFn = function( config ) {

	var simplexA = new SimplexNoise()
	var simplexB = new SimplexNoise()
	
	return function randomlyTurn( entity, elapsed ) {
		
		var theta = TAU * simplexA.noise4D(
			config.simplexScale * entity.position.x,
			config.simplexScale * entity.position.y,
			config.simplexScale * entity.position.z,
			0.0001 * elapsed
		)
	
		var phi = TAU * simplexB.noise4D(
			config.simplexScale * entity.position.x,
			config.simplexScale * entity.position.y,
			config.simplexScale * entity.position.z,
			0.0001 * elapsed
		)
	
		entity.direction.x += entity.veer.x + config.turnSpeed * Math.sin( theta ) * Math.cos( phi )
		entity.direction.y += entity.veer.y + config.turnSpeed * Math.sin( theta ) * Math.sin( phi )
		entity.direction.z += entity.veer.z + config.turnSpeed * Math.cos( theta )
	
		entity.direction.normalize()	
	}
}

exports.avoidEdgesFn = function( config ) {
	
	var avoidEdgeDirection = new THREE.Vector3(1,0,0)
	var origin = new THREE.Vector3(0,0,0)
	var radiusSq = config.radius * config.radius
	
	return function avoidEdges( entity ) {
		
		var distanceToOriginSq = entity.position.distanceToSquared( origin )
		
		avoidEdgeDirection
			.copy( entity.position )
			.normalize()
			.multiplyScalar( - distanceToOriginSq / radiusSq * config.edgeAvoidanceWeight )
		
		entity.direction.add( avoidEdgeDirection ).normalize()
	}
}

exports.positionFn = function( config ) {
	
	return function position( entity ) {
	
		// Apply the direction with the move speed
		entity.position.x += config.moveSpeed * entity.direction.x
		entity.position.y += config.moveSpeed * entity.direction.y
		entity.position.z += config.moveSpeed * entity.direction.z

		// Move the first point
		entity.points[0].copy( entity.position )

		// Follow the leader
		for( var j=1; j < entity.points.length; j++ ) {
	
			var currPoint = entity.points[j]
			var prevPoint = entity.points[j-1]
	
			currPoint.lerp( prevPoint, config.trailSpeed )
		}
	}
}

exports.seekRetrievalFn = function( config, entities, camera, sendEntity ) {
	
	var direction = new THREE.Vector3()
	var target = new THREE.Vector3()
	var raycaster = new THREE.Raycaster()
	raycaster.setFromCamera( new THREE.Vector2(-0.5,-0.5), camera )
	
	target.copy( raycaster.ray.direction )
		.multiplyScalar( 2 )
		.add( camera.position )
	
	var moveEntity = new THREE.Vector3()
	
	return function seekRetrieval( entity ) {
		
		direction
			.copy( target )
			.sub( entity.position )
		
		var distanceSq = direction.lengthSq()
		
		direction.normalize()
		
		entity.direction.lerp( direction, 0.01 )
		direction.lerp( direction, 0.05 )
		
		moveEntity.copy( direction ).multiplyScalar( 2 )
		
		entity.position.add( moveEntity )
		
		if( distanceSq < 50 ) {
			sendEntity( entity )
			entities.remove( entity )
			entity.seekRetrieval = false
			return true
		}
	}
}