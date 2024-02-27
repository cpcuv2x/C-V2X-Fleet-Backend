// Incident Report Device

const io = require('socket.io-client');

// mock
const port = process.argv[2];
const id = process.argv[3];

let latitude;
let longitude;

// RSU data
let rsuIp = 'localhost'; // mock
let rsuPort = 8001; // mock

// report type
const TYPE = ['ACCIDENT', 'CLOSED ROAD', 'CONSTRUCTION', 'TRAFFIC CONGESTION'];

// connect to RSU
const socket = io(`http://${rsuIp}:${rsuPort}`);

// socket (connected to RSU)
socket.on('connect', () => {
	console.log('Connected to the server');
});

socket.on('disconnect', () => {
	console.log('Disconnected from the server');
});

// mock report
const emitReport = setInterval(() => {
	message = {
		type: TYPE[Math.floor(Math.random() * 4)],
		detail: 'mock incident report',
		latitude: latitude,
		longitude: longitude,
		timestamp: new Date(),
	};
	socket.emit('new incident report', (message) => {
		console.log('Sent incident:', message);
	});
}, 10000);
