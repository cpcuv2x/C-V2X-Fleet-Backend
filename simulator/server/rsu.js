const { setActiveStatus } = require('../../RSU/rsu.js');

process.on('message', (message) => {
	const { type, value } = message;
	console.log('Message from parent:', type, value);
	if (type === 'location') {
		// setSpeed(value);
	} else if (type === 'heartbeat') {
		if (String(value).toLowerCase() === 'active') {
			setActiveStatus(true);
		} else if (String(value).toLowerCase() === 'inactive') {
			setActiveStatus(false);
		}
	}
});
