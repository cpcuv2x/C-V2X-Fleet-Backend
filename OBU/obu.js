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

	let isActive = true;

	// RSU data
	let rsuIp = 'localhost'; // mock
	let rsuPort = 8000; // mock
	let rsuId;
	let recSpeed;
	let rsuLatitude;
	let rsuLongitude;

	// OBU data
	let frontCameraStatus;
	let backCameraStatus;
	let rightCameraStatus;
	let leftCameraStatus;

	// RabbitMQ parameters
	const heartbeatKey = 'heartbeat_obu';
	const locationKey = 'location_obu';
	const speedKey = 'speed_obu';
	const emergencyKey = 'emergency_obu';

	const producer = Producer();
	producer.connect();

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
		socket.emit('car id', { type: 'CAR', id: id });
	}, 1000);

	// socket (send to OBU frontend)
	frontendIo.on('connection', async (socket) => {
		console.log('connected to frontend');

		socket.on('camera status', (message) => {
			updateCameraStatus(message);
		});

		socket.on('emergency', (message) => {
			message['car_id'] = id;
			message['status'] = 'PENDING';
			producer.publish(emergencyKey, JSON.stringify(message));
			console.log(message);
		});

		socket.on('disconnect', () => {
			console.log('frontend disconnect');
		});
	});

	const emitCarInfo = setInterval(() => {
		frontendIo.emit('car info', {
			id: id,
			velocity: speed,
			unit: 'km/h',
			latitude: latitude,
			longitude: longitude,
			timestamp: Date(),
		});
	}, 1000);

	const emitRsuInfo = setInterval(() => {
		frontendIo.emit('rsu info', {
			rsu_id: rsuId,
			recommend_speed: recSpeed,
			unit: 'km/h',
			latitude: rsuLatitude,
			longitude: rsuLongitude,
			timestamp: Date(),
		});
	}, 1000);

	// RabbitMQ
	const produceHeartbeat = setInterval(() => {
		message = {
			type: 'CAR',
			id: id,
			data: {
				status: isActive ? 'ACTIVE' : 'INACTIVE',
				front_camera: frontCameraStatus,
				back_camera: backCameraStatus,
				right_camera: rightCameraStatus,
				left_camera: leftCameraStatus,
			},
			timestamp: Date(),
		};
		producer.publish(heartbeatKey, JSON.stringify(message));
		console.log('produce heartbeat');
	}, 1000);

	const produceLocation = setInterval(() => {
		message = {
			type: 'CAR',
			id: id,
			latitude: latitude,
			longitude: longitude,
			timestamp: Date(),
		};
		producer.publish(locationKey, JSON.stringify(message));
		console.log('produce location');
	}, 1000);

	const produceSpeed = setInterval(() => {
		message = {
			type: 'CAR',
			id: id,
			velocity: speed,
			unit: 'km/h',
			timestamp: Date(),
		};
		producer.publish(speedKey, JSON.stringify(message));
	}, 1000);

	// update variable handler
	const updateCameraStatus = (data) => {
		frontCameraStatus = data['front'];
		backCameraStatus = data['back'];
		leftCameraStatus = data['left'];
		rightCameraStatus = data['right'];
	};

	httpServer.listen(port, () => {
		console.log(`server running at http://localhost:${port}`);
	});
	return {
		httpServer,
		socket,
		frontendIo,
		producer,
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
		producer,
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
		cleanup(intervalList, socket, frontendIo, httpServer);
		process.exit(0);
	});

	process.on('SIGTERM', () => {
		console.log('Received SIGTERM. Shutting down gracefully...');
		cleanup(intervalList, socket, frontendIo, httpServer);
		process.exit(0);
	});
};

const cleanup = (intervalList, clientSocket, serverSocket, httpServer) => {
	intervalList.forEach((item) => {
		clearInterval(item);
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

module.exports = {
	getSpeed: function () {
		return speed;
	},
	setSpeed: function (newSpeed) {
		speed = newSpeed;
	},
};
