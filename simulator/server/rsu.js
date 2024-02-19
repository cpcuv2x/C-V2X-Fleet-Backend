const {
	setActiveStatus,
	setLatitude,
	setLongitude,
} = require('../../RSU/rsu.js');

const { exat_pos } = require('./static/exat_pos.js');
const { chula_pos } = require('./static/chula_pos.js');

let location_route = null;

process.on('message', (message) => {
	const { type, value } = message;
	console.log('Message from parent:', type, value);
	if (type === 'location') {
		if (location_route) {
			clear_route();
		}
		if (value === 'exat') {
			change_route('exat', exat_pos);
		}
		if (value === 'chula') {
			change_route('chula', chula_pos);
		}
	} else if (type === 'heartbeat') {
		if (String(value).toLowerCase() === 'active') {
			setActiveStatus(true);
		} else if (String(value).toLowerCase() === 'inactive') {
			setActiveStatus(false);
		}
	}
});

process.on('SIGTERM', () => {
	console.log('Received SIGTERM. Shutting down gracefully...');
	process.exit(0);
});

function change_route(route_name, position_route) {
	location_route = route_name;
	setLatitude(position_route[0].latitude);
	setLongitude(position_route[0].longitude);
}

function clear_route() {
	location_route = null;
	console.log('Cleared previous route');
}
