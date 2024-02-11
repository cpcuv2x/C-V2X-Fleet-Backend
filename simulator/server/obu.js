let { getSpeed, setSpeed } = require('../../OBU/obu.js');

process.on('message', (message) => {
	console.log('Message from parent:', message);
	setSpeed(message);
});
