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
		} else if (String(value).toLowerCase() === 'active') {
			setWarningStatus(false);
			setActiveStatus(true);
		} else if (String(value).toLowerCase() === 'inactive') {
			setWarningStatus(false);
			setActiveStatus(false);
		}
	} else if (type === 'route') {
		if (location_route) {
			location_route = null;
			clearInterval(location_runner);
			console.log('Cleared previous route');
		}
		if (value === 'chula') {
			location_route = 'chula';
			location_runner = setInterval(() => {
				route_counter = (route_counter + 1) % chula_route.length;
				setLatitude(chula_route[route_counter].latitude);
				setLongitude(chula_route[route_counter].longitude);
			}, 1000);
		} else if (value === 'exat') {
			location_route = 'exat';
			location_runner = setInterval(() => {
				route_counter = (route_counter + 1) % exat_route.length;
				setLatitude(exat_route[route_counter].latitude);
				setLongitude(exat_route[route_counter].longitude);
			}, 1000);
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
