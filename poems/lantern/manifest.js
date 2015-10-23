module.exports = {
	name : "Lantern",
	config : {
		camera : {
			x : -300,
			near : 0.1,
			far : 10000,
			fov : 40
		}
	},
	components : {
		websockets   : { function : require('../common/websockets') },
		renderer     : { function : require('../common/renderers/basic-renderer') },
		controls     : { construct: require("../common/components/cameras/Controls") },
		mouse        : { function : require('../common/components/hids/mouse-tracker')	},
		lanternLight : { function : require('./lantern-light/lantern-light') },
	}
}