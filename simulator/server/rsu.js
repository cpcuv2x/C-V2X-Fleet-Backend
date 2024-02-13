require('../../RSU/rsu.js');

process.on('message', (message) => {
	const { type, value } = message;
	console.log('Message from parent:', type, value);
	if (type === 'speed') {
		// setSpeed(value);
	} else if (type === 'heartbeat') {
		// setheartbeat(message);
	}
});
