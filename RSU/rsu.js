// RSU

// RabbitMQ
const Producer = require('../RabbitMQ/producer');
const Consumer = require('../RabbitMQ/consumer');

// other libs
const { createServer } = require('http');
const { Server } = require('socket.io');

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

// mock
const port = process.argv[2];
const id = process.argv[3];

let isActive = true;
const connectedCarId = new Map();

let recSpeed;
// gonna get from somewhere
let latitude;
let longitude;

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
		if (!irList.includes(message)) {
			irList.push(message);
			socket.broadcast.emit('incident report', message);
			producer.publish(irKey, JSON.stringify(message));
		}
	});

	socket.on('disconnect', () => {
		connectedCarId.delete(socket.id);
	});
});

const emitRecSpeed = setInterval(() => {
	io.emit('recommend speed', {
		rsu_id: id,
		recommend_speed: recSpeed,
		unit: 'km/h',
		timestamp: Date(),
	});
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
	io.emit('rsu location', message);
	// console.log('produce location');
	producer.publish(locationKey, JSON.stringify(message));
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
	producer.publish(heartbeatKey, JSON.stringify(message));
	// console.log('produce heartbeat');
}, 1000);

httpServer.listen(port, () => {
	console.log(`server running at http://localhost:${port}`);
});

process.on('unhandledRejection', (err, promise) => {
	console.error(`Unhandled Rejection: ${err}`);
	process.exit(1);
});
