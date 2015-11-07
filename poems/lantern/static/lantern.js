/*
	//------------------------------------------
	// Create a Lantern of Living Light
	//------------------------------------------
	
	View the docs for three.js:

		* All docs:      http://threejs.org/docs/
		* Vector3:       http://threejs.org/docs/#Reference/Math/Vector3
		* Colors:        http://threejs.org/docs/#Reference/Math/Color
		* PointMaterial: http://threejs.org/docs/#Reference/Materials/PointsMaterial

	Suggested activities:
	 * Have lights follow the mouse around instead of going towards the origin
*/

function Lantern( scene, mesh ) {

	
	this.scene = scene // The current three.js scene
	
	/*
		This is the three.js mesh that holds the geometry and material for all of the living lights
		It is created and managed for you. For more information check out the THREE.Points mesh
		documentation: http://localhost/vendor/three.js/docs/#Reference/Objects/Points
	
		Some fun properties are:
		 * mesh.material.size (the size of the particles)
		 * mesh.material.map (a texture map for the particles)
	*/
	
	this.mesh = mesh
	
	/*
		Going from 2d to 3d coordinates is kind of hard (it involves raycasting). This mousePosition
		is updated for you with the mouse position translated into appropriate 3d coordinates.
	*/
	
	this.mousePosition = new THREE.Vector3()
	
	/*
		Random numbers in code can be hard to debug. The config object collects all of these
		magic values in an easy to manipulate space. Feel free to add more values here.
	*/
	
	this.config = {
		moveSpeed : 1,
		turnSpeed : 0.01
	}
	
}

Lantern.prototype.updateLight = (function() {
	
	// Allocate objects before the update loop
	var origin = new THREE.Vector3()
	var toOrigin = new THREE.Vector3()
	
	return function updateIndividualPieceOfLight( position, direction, color, age ) {
		
		/*
			position  - THREE.Vector3 - The 3d position of the living light
			direction - THREE.Vector3 - The current direction, a length 1 vector
			color     - THREE.Color   - The color of the light
			age       - Number        - When the piece of light was first born
		*/
		
		// Create a directional vector that points to the origin
		toOrigin.copy( origin )
		toOrigin.sub( position )
		toOrigin.normalize() //Makes the vector length 1
		
		// Move slightly towards the origin
		direction.lerp( toOrigin, this.config.turnSpeed )
		direction.normalize() //Makes the vector length 1
		
		// Move in the direction and speed
		position.x += direction.x * this.config.moveSpeed
		position.y += direction.y * this.config.moveSpeed
		position.z += direction.z * this.config.moveSpeed
	}
	
})()

Lantern.prototype.lightAdded = function( position, direction ) {
	
	// This function gets called every time a light is added
	
}

Lantern.prototype.lightRemoved = function( position, direction ) {
	
	// This function gets called every time a light is removed
	
}