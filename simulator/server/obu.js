let {
	setActiveStatus,
	setWarningStatus,
	setLatitude,
	setLongitude,
	setSpeed,
} = require('../../OBU/obu.js');

const { chula_route } = require('./static/chula_route.js');
const { exat_route } = require('./static/exat_route.js');

let location_route = null;
let route_counter = 0;
let location_runner = null;

process.on('message', (message) => {
	const { type, value } = message;
	console.log('Message from parent:', type, value);
	if (type === 'speed') {
		setSpeed(value);
	} else if (type === 'heartbeat') {
		if (String(value).toLowerCase() === 'warning') {
			setWarningStatus(true);
			setActiveStatus(true);
		} else if (String(value).toLowerCase() === 'active') {
			setWarningStatus(false);
			setActiveStatus(true);
		} else if (String(value).toLowerCase() === 'inactive') {
			setWarningStatus(false);
			setActiveStatus(false);
		}
	} else if (type === 'route') {
		if (location_route) {
			clear_route();
		}
		if (value === 'chula') {
			change_route('chula', chula_route);
		} else if (value === 'exat') {
			change_route('exat', exat_route);
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

function change_route(route_name, position_route) {
	location_route = route_name;
	location_runner = setInterval(() => {
		route_counter = (route_counter + 1) % exat_route.length;
		setLatitude(position_route[route_counter].latitude);
		setLongitude(position_route[route_counter].longitude);
	}, 1000);
}

function clear_route() {
	clearInterval(location_runner);
	location_route = null;
	console.log('Cleared previous route');
}
