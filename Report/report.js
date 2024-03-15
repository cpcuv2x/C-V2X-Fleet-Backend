// Incident Report Device

const io = require('socket.io-client');

// mock
const port = process.argv[2];
const id = process.argv[3];

let isActive;
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

// for sim
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

	// emit new report
	sendNewReport: function (reportType) {
		if (isActive) {
			message = {
				type: reportType,
				latitude: latitude,
				longitude: longitude,
				timestamp: new Date(),
			};
			socket.emit('new incident report', (message) => {
				console.log('Sent incident:', message);
			});
		}
	},
};
