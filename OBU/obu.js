// OBU

const Producer = require('../RabbitMQ/producer');

const io = require('socket.io-client');

const socket = io('http://localhost:8000');

// mock
const id = '02';

let isActive = true;

let recSpeed;
let latitude;
let longitude;
let front_camera_status;
let back_camera_status;
let right_camera_status;
let left_camera_status;

// RabbitMQ parameters
const heartbeatKey = 'heartbeat_obu';
const locationKey = 'location_obu';

const producer = Producer();
producer.connect();

// socket
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
	recSpeed = message['recommend speed'];
});

const emitCarId = setInterval(() => {
	socket.emit('car id', { type: 'CAR', id: id });
}, 1000);

// RabbitMQ
const produceHeartbeat = setInterval(() => {
	message = {
		type: 'CAR',
		id: id,
		data: {
			status: isActive ? 'ACTIVE' : 'INACTIVE',
			front_camera: front_camera_status,
			back_camera: back_camera_status,
			right_camera: right_camera_status,
			left_camera: left_camera_status,
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
