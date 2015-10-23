var TAU = Math.PI * 2

module.exports = function randomSphericalCoordinate( radius, spawnPoint ) {

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