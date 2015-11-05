var OnTap           = require('@tatumcreative/on-tap')
var RandomSpherical = require('random-spherical/object')( Math.random, THREE.Vector3 )
var Remove          = require('../../common/utils/remove')
var RelayResponseFn = require('../../common/utils/relay-response')

function _createEntity( config, hex, spawnPoint ) {
	
	var position  = RandomSpherical( config.radius, spawnPoint )
	var direction = RandomSpherical( 1 )
	var age       = Date.now()
	
	var hue = (age * config.hueShiftSpeed) % 1
	var color = new THREE.Color( hex )
	
	return {
		position : position,
		direction : direction,
		color : color,
		age : age,
		index : -1,
	}
}

function _manageEntitiesFn( config, mesh ) {
	
	var list = []
	var takenIndices = []
	var availableIndices = _.times( config.maxCount )
	var offscreenVertex = new THREE.Vector3( 0, -10000, 0 )
	
	function add( entity ) {
		
		var index = availableIndices.pop()
		takenIndices.push( index )
		list.push( entity )
		entity.index = index
		
		mesh.geometry.vertices[ index ] = entity.position
		mesh.geometry.colors[ index ] = entity.color
		mesh.geometry.verticesNeedUpdate = true
		mesh.geometry.colorsNeedUpdate = true
	}
	
	function remove( entity ) {
		
		Remove( list, entity )
		Remove( takenIndices, entity.index )
		availableIndices.push( entity.index )

		mesh.geometry.vertices[ entity.index ] = offscreenVertex
		mesh.geometry.verticesNeedUpdate = true
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
	var count = config.maxCount
	
	// Fill in blank vertices and colors for correct buffer sizes
	geometry.vertices = _.times(count, _.constant( new THREE.Vector3(0,-10000,0) ) )
	geometry.vertices = _.times(count, function() { return new THREE.Vector3(0,-10000,0) } )
	geometry.colors   = _.times(count, _.constant( new THREE.Color() ) )
	geometry.dynamic  = true

	var material = new THREE.PointsMaterial({
		size         : config.size * ratio,
		vertexColors : THREE.VertexColors,
		blending     : THREE.AdditiveBlending,
		transparent  : true,
		depthTest    : false,
		fog          : false
	})
	
	var mesh = new THREE.Points( geometry, material )
	mesh.frustumCulled = false
	scene.add( mesh )
	
	return mesh
}

function _tapFn( socket, state, config, mesh, entities, camera, fingerPress, lantern ) {

	var raycaster = new THREE.Raycaster()
	var mousePosition = new THREE.Vector2()
	var $el = $('#container-blocker')
	var sharedDirection = new THREE.Vector3()
	var touchPoint3d = new THREE.Vector3()
	
	state.on('change', function( current, previous ) {
		if( current.theirCode !== previous.theirCode ) {
			if( current.theirCode ) {
				$el.css('cursor', 'pointer')
			} else {
				$el.css('cursor', 'default')
			}
		}
	})
	
	return function tap(e) {
		
		if( state.get('theirCode') !== null ) {
			
			var data = {
				x : e.x / window.innerWidth,
				y : e.y / window.innerHeight,
			}

			mousePosition.x = data.x * 2 - 1
			mousePosition.y = 1 - data.y * 2
			
			raycaster.setFromCamera( mousePosition, camera )
			raycaster.ray.closestPointToPoint( mesh.position, touchPoint3d )			
			var removeFingerPress = fingerPress( touchPoint3d )
			
			socket.emit('message', data, function( incomingEntities ) {
				
				removeFingerPress()
				RandomSpherical( sharedDirection )
				
				incomingEntities.forEach(function( incomingEntity) {
					
					var entity = _createEntity( config, incomingEntity.color, new THREE.Vector3() )
					entity.position.copy( touchPoint3d )
					entity.direction.copy( sharedDirection )
					entity.direction.x += Math.random() * 0.1
					entity.direction.y += Math.random() * 0.1
					entity.direction.normalize()
					raycaster.ray.closestPointToPoint( mesh.position, entity.position )
					entities.add( entity )
					lantern.lightAdded( entity.position, entity.direction )
					
				})
				
				// console.log('got a response', incomingEntities)
			})
			
			// console.log('sending message', data)
		}
	}
}

function _addFingerPressFn( app, config ) {
	
	var geometry = new THREE.CylinderGeometry(
		5,    // radiusTop
		7.5,  // radiusBottom
		5,    // height
		32,   // radiusSegments
		1,    // heightSegments
		true  // openEnded
	)
	geometry.applyMatrix( new THREE.Matrix4().makeRotationX( Math.PI * 0.4 ) )
	var material = new THREE.MeshBasicMaterial({color: 0x333333})
	var scaleTarget = new THREE.Vector3(2,2,2)
	
	return function addFingerPress( position ) {
		
		var mesh = new THREE.Mesh( geometry, material )
		var update = function(e) {
			mesh.rotation.z += e.dt * 0.005
			mesh.scale.lerp( scaleTarget, 0.01 )
		}
		mesh.position.copy( position )
		app.scene.add( mesh )
		app.emitter.on('update', update)
		
		return function removeFingerPress() {
			app.emitter.removeListener('update', update)
			app.scene.remove( mesh )
		}
	}
}

function _updateFn( config, entities, mesh, lantern ) {
	
	return function update() {
		
		for( var i=0; i < entities.list.length; i++ ) {
			
			var entity = entities.list[i]
			
			lantern.updateLight(
				entity.position,
				entity.direction,
				entity.color,
				entity.age
			)
		}
		mesh.geometry.verticesNeedUpdate = true
	}
}

function _handleEntityRequests( config, socket, entities, lantern ) {
	
	socket.on('message', function( event ) {
		
		var respond = RelayResponseFn( socket, event )
		var entity = _.sample( entities.list )
		if( !entity ) {
			respond([])
			return
		}
		lantern.lightRemoved( entity.position, entity.direction )
		entities.remove( entity )
		responseData = [{
			color : entity.color.getHex(),
			age : entity.age
		}]
		
		respond( responseData )
		
	})
}

module.exports = function lanternLight( app, props ) {
	
	var config = _.extend({
		maxCount : 5000,
		size     : 5,
		speed    : 1,
	}, props)

	var mesh = _createMesh( config, app.ratio, app.scene )
	var entities = _manageEntitiesFn( config, mesh )
	var lantern = new Lantern( app.scene, mesh )

	app.emitter.on( 'update', _updateFn( config, entities, mesh, lantern ) )
	var fingerPress = _addFingerPressFn( app, config )
	_handleEntityRequests( config, app.websockets.socket, entities, lantern )
	
	OnTap(
		document.getElementById('container-blocker'),
		_tapFn(
			app.websockets.socket,
			app.websockets.state,
			config,
			mesh,
			entities,
			app.camera.object,
			fingerPress,
			lantern
		)
	)
}
