// RSU

// RabbitMQ
const Producer = require('../RabbitMQ/producer');
const Consumer = require('../RabbitMQ/consumer');

// other libs
const { createServer } = require('http');
const { Server } = require('socket.io');

// mock
const port = process.argv[2];
const id = process.argv[3];

// sim data
let isActive = false; // default
let latitude;
let longitude;

const initServer = () => {
	// init server
	const httpServer = createServer();
	const io = new Server(httpServer, {
		transports: ['websocket', 'polling'],
		cors: {
			origin: '*',
			methods: ['GET', 'POST'],
		},
		allowEIO3: true,
	});

	const connectedCarId = new Map();

	let recSpeed;

	const irList = []; // list of all alive reports

	// RabbitMQ parameter
	const heartbeatKey = 'heartbeat_rsu';
	const locationKey = 'location_rsu';
	const recSpeedKey = `recommend_speed_rsu_${id}`;
	const recSpeedQueue = `queue_${recSpeedKey}`;
	const irKey = `incident_report_rsu_${id}`;
	const irQueue = `queue_${irKey}`;

	const updateRecSpeed = (msg) => {
		let newRecSpeed = msg['velocity'];
		recSpeed = newRecSpeed;
		console.log(`new rec speed = ${recSpeed} km/h`);
	};

	const updateIr = (msg) => {
		irList = message; // backend return list of current available incident reports
		emitIr();
	};

	const emitIr = () => {
		if (irList.length !== 0) {
			irList.forEach((report) => {
				io.emit('incident report', report);
			});
		}
	};

	// RabbitMQ
	const producer = Producer();
	producer.connect();

	const recSpeedConsumer = Consumer(recSpeedQueue, recSpeedKey, updateRecSpeed);
	const irConsumer = Consumer(irQueue, irKey, updateIr);

	// socket
	io.on('connection', async (socket) => {
		socket.on('car id', (message) => {
			// console.log('receive car id:', message);
			connectedCarId.set(socket.id, message['id']);
		});

		socket.on('incident report', (message) => {
			message['rsu_id'] = id;
			if (isActive) {
				if (!irList.includes(message)) {
					irList.push(message);
					socket.broadcast.emit('incident report', message);
					producer.publish(irKey, JSON.stringify(message));
				}
			}
		});

		socket.on('disconnect', () => {
			connectedCarId.delete(socket.id);
		});
	});

	const emitRecSpeed = setInterval(() => {
		if (isActive) {
			io.emit('recommend speed', {
				rsu_id: id,
				recommend_speed: recSpeed,
				unit: 'km/h',
				timestamp: Date(),
			});
		}
		// console.log('emit rec speed');
	}, 1000);

	// emit location via socket and RabbitMQ
	const emitRSULocation = setInterval(() => {
		message = {
			type: 'RSU',
			id: id,
			latitude: latitude,
			longitude: longitude,
			timestamp: Date(),
		};
		if (isActive) {
			io.emit('rsu location', message);
			// console.log('produce location');
			producer.publish(locationKey, JSON.stringify(message));
		}
	}, 1000);

	const produceHeartbeat = setInterval(() => {
		message = {
			type: 'RSU',
			id: id,
			data: {
				status: isActive ? 'ACTIVE' : 'INACTIVE',
				connected_OBU: [...connectedCarId.values()],
			},
			timestamp: Date(),
		};
		if (isActive) {
			producer.publish(heartbeatKey, JSON.stringify(message));
		}
		// console.log('produce heartbeat');
	}, 1000);

	httpServer.listen(port, () => {
		console.log(`server running at http://localhost:${port}`);
	});
	return {
		httpServer,
		io,
		producer,
		recSpeedConsumer,
		irConsumer,
		emitRecSpeed,
		emitRSULocation,
		produceHeartbeat,
	};
};

// start server
const start = () => {
	const {
		httpServer,
		io,
		producer,
		recSpeedConsumer,
		irConsumer,
		emitRecSpeed,
		emitRSULocation,
		produceHeartbeat,
	} = initServer();

	const intervalList = [emitRecSpeed, emitRSULocation, produceHeartbeat];

	// error handler
	process.on('uncaughtException', (err) => {
		console.error('Uncaught Exception:', err);
		restartServer(httpServer, intervalList);
	});

	process.on('unhandledRejection', (err, promise) => {
		console.error('Unhandled Promise Rejection:', err);
		restartServer(httpServer, intervalList);
	});

	process.on('SIGINT', () => {
		console.log('Received SIGINT. Shutting down gracefully...');
		cleanup(intervalList, io, httpServer);
		process.exit(0);
	});

	process.on('SIGTERM', () => {
		console.log('Received SIGTERM. Shutting down gracefully...');
		cleanup(intervalList, io, httpServer);
		process.exit(0);
	});
};

const cleanup = (intervalList, serverSocket, httpServer) => {
	intervalList.forEach((item) => {
		clearInterval(item);
	});

	serverSocket.close(() => {
		console.log('Close RSU socket Server');
	});

	httpServer.close(() => {
		console.log('Server closed');
	});
};

// restart
const restartServer = (httpServer, intervalList) => {
	intervalList.forEach((item) => {
		clearInterval(item);
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
