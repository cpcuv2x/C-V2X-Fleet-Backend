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

// log
const fs = require('fs');
const util = require('util');
const log_file = fs.createWriteStream(__dirname + '/debug.log', {flags : 'a'});
const log_stdout = process.stdout;

console.log = function(d) { //
  log_file.write(new Date() + '\t' + util.format(d) + '\n');
  log_stdout.write(new Date() + '\t' + util.format(d) + '\n');
};

// sim data
//let isActive = false; // default
let isActive = true;
let isWarning;
let speed;
let latitude = 13.737069525441195;
let longitude = 100.53304240520373;
let driveMode = "autonomous";

// mech socket 
const mechSocketPort = process.env.MECH_SOCKET_PORT || 8000;
const mechClientSocketPort = process.env.MECH_CLIENT_SOCKET_PORT || 12000;
var udp = require('dgram');
var net = require('net');
var mechServer = udp.createSocket('udp4');
var mechClient = net.Socket();
// var mechClient = net.createConnection({ port: mechClientSocketPort }, () => {
// 	console.log('connected to server!');
// })

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

	// socket server for mech client
	// emits when any error occurs
	mechServer.on('error',function(error){
		console.error('Error: ' + error);
		mechServer.close();
	});

	mechServer.on('connect',function(error){
		console.error('Error: ' + error);
		mechServer.close();
	});

	// receive new datagram msg
	mechServer.on('message',function(msg,info){
		console.log(JSON.parse(msg));
		let jsonData = JSON.parse(msg);
		console.log(jsonData);
		if(jsonData?.speed){
			speed = parseFloat(jsonData.speed);
		}
		if(jsonData?.lat){
			latitude = parseFloat(jsonData.lat);
		}
		if(jsonData?.lon){
			longitude = parseFloat(jsonData.lon);
		}
		if(jsonData?.driveMode){
			driveMode = jsonData.driveMode;
		}		
	});

	//emits when socket is ready and listening for datagram msgs
	mechServer.on('listening',function(){
		var address = mechServer.address();
		var port = address.port;
		var ipaddr = address.address;
		console.log('MechServer is listening at ' + ipaddr + ":" + port);
	});

	//emits after the socket is closed using socket.close();
	mechServer.on('close',function(){
		console.log('MechSocket is closed !');
	});

	function connectToMech(message, attempt){
		
		mechClient.connect(mechClientSocketPort,()=>{
			console.log("connect to mech server")
			mechClient.write(message)
			mechClient.destroy()
			console.log("Successfully send to mech socket")
		})

		mechClient.on('error',function(error){
			attempt = attempt + 1
			console.log("try to reconnect (" + attempt + ")") 
			if(attempt < 3){
				reconnect(message, attempt)
			} else {
				console.log('Cannot connect to mech server: ' + error);
			}
		});

		mechClient.on('end', () => {
			console.log('disconnected from mech server');
		});
		
	}

	reconnect = (message, attempt) => {
		setTimeout(() => {
			mechClient.removeAllListeners() // the important line that enables you to reopen a connection
			connectToMech(message, attempt)
		}, 1000)
	}

	// connect to RSU
	const socket = io(`http://${rsuIp}:${rsuPort}`);

	// connect to Control Center Backend
	const ccBackendSocket = io(process.env.NEXT_PUBLIC_WEB_SOCKET_URL || "ws://localhost:3426");

	// socket (connected to RSU)
	socket.on('connect', () => {
		console.log('Connected to the server');
	});

	socket.on('disconnect', () => {
		console.log('Disconnected from the server');
	});

	socket.on('incident report', (message) => {
		console.log('Received incident:', message);
		frontendIo.emit('incident report', message); // forward reportsList to frontend
	});

	socket.on('new report notification', (message) => {
		frontendIo.emit('new report notification', message); // forward new report noti to frontend
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
			message['latitude'] = latitude;
			message['longitude'] = longitude;
			if (isActive) {
				emergencyProducer.publish(JSON.stringify(message));
				console.log(message);
			}
		});

		socket.on('disconnect', () => {
			console.log('frontend disconnect');
		});
	});

	// socket (to control center backend)
	ccBackendSocket.emit('join', id)

	ccBackendSocket.on('emergency_stop_req', (car_id) => {
		console.log('emergency stop received from control center');
		// send signal to car
		let obj = {
			"message": "emergency stop"
		}
		const message = Buffer.from(JSON.stringify(obj));
		try{
			connectToMech(message, 0);
		} catch(e) {
			console.log(e)
		}
		
		
		// forward emergency to frontend
		frontendIo.emit('emergency_stop', 'emergency stop');
		console.log('forward emergency stop to frontend');
		// send response back to control center
		ccBackendSocket.emit('emergency_stop_res', {
			car_id: car_id,
			success: true, 
		});
		console.log('emit emergency stop success back to control center');
	});

	const emitCarInfo = setInterval(() => {
		if (isActive) {
			message = {
				id: id,
				velocity: speed,
				unit: 'km/h',
				latitude: latitude,
				longitude: longitude,
				timestamp: new Date(),
				mode: driveMode,
			};
			frontendIo.emit('car info', message);
			// console.log('emit car info');
			// console.log(message);
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
				drive_mode: driveMode,
			},
			timestamp: new Date(),
		};
		if (isActive) {
			heartbeatProducer.publish(JSON.stringify(message));
			// console.log('produce heartbeat');
			// console.log(JSON.stringify(message));
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
			//console.log('produce location');
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

	mechServer.bind(mechSocketPort);
	
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
		// restartServer(httpServer, intervalList, producerList);
		cleanup(intervalList, socket, frontendIo, httpServer, producerList);
		process.exit(0);
	});

	process.on('unhandledRejection', (err, promise) => {
		console.error('Unhandled Promise Rejection:', err);
		// restartServer(httpServer, intervalList, producerList);
		cleanup(intervalList, socket, frontendIo, httpServer, producerList);
		process.exit(0);
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

	// drive mode
	getDriveMode: function() {
		return driveMode;
	},
	setDriveMode: function (newDriveMode) {
		driveMode = newDriveMode;
	},
};
