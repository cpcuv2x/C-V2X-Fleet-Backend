const {
	setActiveStatus,
	setLatitude,
	setLongitude,
} = require('../../RSU/rsu.js');

const { exat_pos } = require('./static/exat_pos.js');
const { chula_pos } = require('./static/chula_pos.js')

let location_route = null;
let route_counter = 0;
let location_runner = null;

process.on('message', (message) => {
	const { type, value } = message;
	console.log('Message from parent:', type, value);
	if (type === 'location') {
		if (location_route) {
			location_route = null;
			clearInterval(location_runner);
			console.log('Cleared previous route');
		}
		if (value === 'exat') {
			location_route = 'exat';
			location_runner = setInterval(() => {
				route_counter = (route_counter + 1) % exat_pos.length;
				setLatitude(exat_pos[route_counter].latitude);
				setLongitude(exat_pos[route_counter].longitude);
			}, 1000);
		}
		if (value === 'chula') {
			location_route = 'chula';
			location_runner = setInterval(() => {
				route_counter = (route_counter + 1) % chula_pos.length;
				setLatitude(chula_pos[route_counter].latitude);
				setLongitude(chula_pos[route_counter].longitude);
			}, 1000);
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
	if (location_runner) {
		clearInterval(location_runner);
	}
	process.exit(0);
});
