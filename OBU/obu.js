// OBU

const Producer = require('../RabbitMQ/producer');

// other libs
const os = require('os');
const io = require('socket.io-client');
const { createServer } = require('http');
const { Server } = require('socket.io');

// mock
const port = process.argv[2];
const id = process.argv[3];
// const interfaces = os.networkInterfaces();
// const ip = interfaces.lo0[0].address; // car's ip

// sim data
let isActive = false; // default
let isWarning;
let speed;
let latitude;
let longitude;

const initServer = () => {
	// init server for send to frontend
	const httpServer = createServer();
	const frontendIo = new Server(httpServer, {
		transports: ['websocket', 'polling'],
		cors: {
			origin: '*',
			methods: ['GET', 'POST'],
		},
		allowEIO3: true,
		closeOnBeforeunload: true,
	});

	// RSU data
	let rsuIp = 'localhost'; // mock
	let rsuPort = 8001; // mock
	let rsuId;
	let recSpeed;
	let rsuLatitude;
	let rsuLongitude;

	// RabbitMQ parameters
	const heartbeatQueue = 'heartbeat';
	const locationQueue = 'location';
	const speedQueue = 'car_speed';
	const emergencyQueue = 'emergency';

	const initProducer = (queueName, isDurable = false) => {
		const producer = Producer(queueName, isDurable);
		producer.connect();
		return producer;
	};

	const heartbeatProducer = initProducer(heartbeatQueue);
	const locationProducer = initProducer(locationQueue);
	const speedProducer = initProducer(speedQueue);
	const emergencyProducer = initProducer(emergencyQueue, true);

	// connect to RSU
	const socket = io(`http://${rsuIp}:${rsuPort}`);

	// socket (connected to RSU)
	socket.on('connect', () => {
		console.log('Connected to the server');
	});

	socket.on('disconnect', () => {
		console.log('Disconnected from the server');
	});

	socket.on('incident report', (message) => {
		console.log('Received incident:', message);
	});

	socket.on('recommend speed', (message) => {
		console.log('Received recommend speed:', message);
		recSpeed = message['recommend_speed'];
	});

	socket.on('rsu location', (message) => {
		console.log('RSU location:', message);
		rsuId = message['id'];
		rsuLatitude = message['latitude'];
		rsuLongitude = message['longitude'];
	});

	const emitCarId = setInterval(() => {
		if (isActive) {
			socket.emit('car id', { type: 'CAR', id: id });
		}
	}, 1000);

	// socket (send to OBU frontend)
	frontendIo.on('connection', async (socket) => {
		console.log('connected to frontend');

		socket.on('emergency', (message) => {
			message['car_id'] = id;
			if (isActive) {
				emergencyProducer.publish(JSON.stringify(message));
				console.log(message);
			}
		});

		socket.on('disconnect', () => {
			console.log('frontend disconnect');
		});
	});

	const emitCarInfo = setInterval(() => {
		if (isActive) {
			frontendIo.emit('car info', {
				id: id,
				velocity: speed,
				unit: 'km/h',
				latitude: latitude,
				longitude: longitude,
				timestamp: new Date(),
			});
		}
	}, 1000);

	const emitRsuInfo = setInterval(() => {
		if (isActive) {
			frontendIo.emit('rsu info', {
				rsu_id: rsuId,
				recommend_speed: recSpeed,
				unit: 'km/h',
				latitude: rsuLatitude,
				longitude: rsuLongitude,
				timestamp: new Date(),
			});
		}
	}, 1000);

	// RabbitMQ
	const produceHeartbeat = setInterval(() => {
		message = {
			type: 'CAR',
			id: id,
			data: {
				status: isWarning ? 'WARNING' : isActive ? 'ACTIVE' : 'INACTIVE',
			},
			timestamp: new Date(),
		};
		if (isActive) {
			heartbeatProducer.publish(JSON.stringify(message));
			console.log('produce heartbeat');
		}
	}, 1000);

	const produceLocation = setInterval(() => {
		message = {
			type: 'CAR',
			id: id,
			latitude: latitude,
			longitude: longitude,
			timestamp: new Date(),
		};
		if (isActive) {
			locationProducer.publish(JSON.stringify(message));
			console.log('produce location');
		}
	}, 1000);

	const produceSpeed = setInterval(() => {
		message = {
			type: 'CAR',
			id: id,
			velocity: speed,
			unit: 'km/h',
			timestamp: new Date(),
		};
		if (isActive) {
			speedProducer.publish(JSON.stringify(message));
		}
	}, 1000);

	httpServer.listen(port, () => {
		console.log(`server running at http://localhost:${port}`);
	});
	return {
		httpServer,
		socket,
		frontendIo,
		heartbeatProducer,
		locationProducer,
		speedProducer,
		emergencyProducer,
		emitCarId,
		emitCarInfo,
		emitRsuInfo,
		produceHeartbeat,
		produceLocation,
		produceSpeed,
	};
};

// start server
const start = () => {
	const {
		httpServer,
		socket,
		frontendIo,
		heartbeatProducer,
		locationProducer,
		speedProducer,
		emergencyProducer,
		emitCarId,
		emitCarInfo,
		emitRsuInfo,
		produceHeartbeat,
		produceLocation,
		produceSpeed,
	} = initServer();

	const intervalList = [
		emitCarId,
		emitCarInfo,
		emitRsuInfo,
		produceHeartbeat,
		produceLocation,
		produceSpeed,
	];

	const producerList = [
		heartbeatProducer,
		locationProducer,
		speedProducer,
		emergencyProducer,
	];

	// error handler
	process.on('uncaughtException', (err) => {
		console.error('Uncaught Exception:', err);
		restartServer(httpServer, intervalList, producerList);
	});

	process.on('unhandledRejection', (err, promise) => {
		console.error('Unhandled Promise Rejection:', err);
		restartServer(httpServer, intervalList, producerList);
	});

	process.on('SIGINT', () => {
		console.log('Received SIGINT. Shutting down gracefully...');
		cleanup(intervalList, socket, frontendIo, httpServer, producerList);
		process.exit(0);
	});

	process.on('SIGTERM', () => {
		console.log('Received SIGTERM. Shutting down gracefully...');
		cleanup(intervalList, socket, frontendIo, httpServer, producerList);
		process.exit(0);
	});
};

const cleanup = (
	intervalList,
	clientSocket,
	serverSocket,
	httpServer,
	producerList,
) => {
	intervalList.forEach((item) => {
		clearInterval(item);
	});

	producerList.forEach((producer) => {
		producer.close();
	});

	clientSocket.disconnect();
	console.log('disconnect from RSU');
	serverSocket.close(() => {
		console.log('Close OBU Socket Server');
	});

	httpServer.close(() => {
		console.log('Server closed');
	});
};

// restart
const restartServer = (httpServer, intervalList, producerList) => {
	intervalList.forEach((item) => {
		clearInterval(item);
	});

	producerList.forEach((producer) => {
		producer.close();
	});

	httpServer.close(() => {
		console.log('Server closed. Restarting...');
		start();
	});
};

start();

// update value for sim
module.exports = {
	// isActive
	getActiveStatus: function () {
		return isActive;
	},
	setActiveStatus: function (active) {
		isActive = active;
	},

	// isWarning
	getWarningStatus: function () {
		return isWarning;
	},
	setWarningStatus: function (warning) {
		isWarning = warning;
	},

	// speed
	getSpeed: function () {
		return speed;
	},
	setSpeed: function (newSpeed) {
		speed = newSpeed;
	},

	// latitude
	getLatitude: function () {
		return latitude;
	},
	setLatitude: function (newLatitude) {
		latitude = newLatitude;
	},

	// longitude
	getLongitude: function () {
		return longitude;
	},
	setLongitude: function (newLongitude) {
		longitude = newLongitude;
	},
};
