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

	let reportsList = []; // list of all alive reports
	let newReportsList = []; // list of all new reports

	// RabbitMQ parameter
	const heartbeatQueue = 'heartbeat';
	const locationQueue = 'location';
	const recSpeedQueue = `rec_speed_${id}`;
	const newReportQueue = 'new_report';
	const reportsQueue = `reports_${id}`;

	const updateRecSpeed = (msg) => {
		let newRecSpeed = msg['recommend_speed'];
		if (isActive) {
			recSpeed = newRecSpeed;
			console.log(`new rec speed = ${recSpeed} km/h`);
		}
	};

	const updateReports = (msg) => {
		reportsList = msg; // backend return list of current available incident reports
		newReportsList.forEach((item) => {
			if (
				reportsList.find(
					(report) => JSON.stringify(report) === JSON.stringify(item),
				)
			) {
				newReportsList = newReportsList.filter(
					(report) => JSON.stringify(report) !== JSON.stringify(item),
				); // remove newReport from newReportsList
			} else {
				reportsList.push(item);
			}
		});
		io.emit('incident report', reportsList); // emit all reports to obu
	};

	const initProducer = (queueName, isDurable = false) => {
		const producer = Producer(queueName, isDurable);
		producer.connect();
		return producer;
	};

	// RabbitMQ
	const heartbeatProducer = initProducer(heartbeatQueue);
	const locationProducer = initProducer(locationQueue);
	const newReportProducer = initProducer(newReportQueue);

	const recSpeedConsumer = Consumer(recSpeedQueue, updateRecSpeed, true);
	const reportsConsumer = Consumer(reportsQueue, updateReports, true);

	// socket
	io.on('connection', async (socket) => {
		socket.on('car id', (message) => {
			// console.log('receive car id:', message);
			connectedCarId.set(socket.id, message['id']);
		});

		socket.on('new incident report', (message) => {
			message['rsu_id'] = id;
			if (isActive) {
				newReportsList.push(message);
				let allReportsList = reportsList.concat(newReportsList);
				socket.emit('incident report', allReportsList); // send ALL reports to obu
				socket.emit(
					'new report notification',
					`new report from RSU ${id} is sent`,
				); // new report noti
				newReportProducer.publish(JSON.stringify(message)); // produce new report to backend
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
				timestamp: new Date(),
				// connected_OBU: [...connectedCarId.values()], // for demo
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
			timestamp: new Date(),
		};
		if (isActive) {
			io.emit('rsu location', message);
			// console.log('produce location');
			locationProducer.publish(JSON.stringify(message));
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
			timestamp: new Date(),
		};
		if (isActive) {
			heartbeatProducer.publish(JSON.stringify(message));
		}
		// console.log('produce heartbeat');
	}, 1000);

	httpServer.listen(port, () => {
		console.log(`server running at http://localhost:${port}`);
	});
	return {
		httpServer,
		io,
		heartbeatProducer,
		locationProducer,
		newReportProducer,
		recSpeedConsumer,
		reportsConsumer,
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
		heartbeatProducer,
		locationProducer,
		newReportProducer,
		recSpeedConsumer,
		reportsConsumer,
		emitRecSpeed,
		emitRSULocation,
		produceHeartbeat,
	} = initServer();

	const intervalList = [emitRecSpeed, emitRSULocation, produceHeartbeat];
	const producerList = [heartbeatProducer, locationProducer, newReportProducer];
	const consumerList = [recSpeedConsumer, reportsConsumer];

	// error handler
	process.on('uncaughtException', (err) => {
		console.error('Uncaught Exception:', err);
		// restartServer(httpServer, intervalList, producerList, consumerList);
		cleanup(intervalList, io, httpServer, producerList, consumerList);
		process.exit(0);
	});

	process.on('unhandledRejection', (err, promise) => {
		console.error('Unhandled Promise Rejection:', err);
		// restartServer(httpServer, intervalList, producerList, consumerList);
		cleanup(intervalList, io, httpServer, producerList, consumerList);
		process.exit(0);
	});

	process.on('SIGINT', () => {
		console.log('Received SIGINT. Shutting down gracefully...');
		cleanup(intervalList, io, httpServer, producerList, consumerList);
		process.exit(0);
	});

	process.on('SIGTERM', () => {
		console.log('Received SIGTERM. Shutting down gracefully...');
		cleanup(intervalList, io, httpServer, producerList, consumerList);
		process.exit(0);
	});
};

const cleanup = (
	intervalList,
	serverSocket,
	httpServer,
	producerList,
	consumerList,
) => {
	intervalList.forEach((item) => {
		clearInterval(item);
	});

	producerList.forEach((producer) => {
		producer.close();
	});

	consumerList.forEach((consumer) => {
		consumer.close();
	});

	serverSocket.close(() => {
		console.log('Close RSU socket Server');
	});

	httpServer.close(() => {
		console.log('Server closed');
	});
};

// restart
const restartServer = (
	httpServer,
	intervalList,
	producerList,
	consumerList,
) => {
	intervalList.forEach((item) => {
		clearInterval(item);
	});

	producerList.forEach((producer) => {
		producer.close();
	});

	consumerList.forEach((consumer) => {
		consumer.close();
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
