module.exports = {
	name : "Spawning Pool",
	config : {
		camera : {
			x : -300,
			near : 0.1,
			far : 10000,
			fov : 40
		}
	},
	components : {
		renderer : { function : require('../common/renderers/basic-renderer') },
		controls : { construct: require("../common/components/cameras/Controls") },
		mouse : { function: require('../common/components/hids/mouse-tracker')	},
		entities : { function: require('./light-entities/light-entities') }
	}
}