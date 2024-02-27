const Producer = require('../RabbitMQ/producer');
const Consumer = require('../RabbitMQ/consumer');

const producer = Producer('rec_speed_01', true);
producer.connect();

const publishRecSpeed = (msg) => {
	console.log(msg);
	let id = msg['id'];
	if (id === '01') {
		message = JSON.stringify({
			id: '01',
			velocity: Math.random() * 120,
			unit: 'km/h',
			timestamp: new Date(),
		});
		producer.publish(message);
	}
};

const consumer = Consumer('heartbeat', publishRecSpeed);

// setInterval(() => {
// 	message = JSON.stringify({
// 		id: '01',
// 		velocity: Math.random() * 120,
// 		unit: 'km/h',
// 		timestamp: new Date(),
// 	});
// 	producer.publish('recommend_speed_rsu_01', message);
// }, 2000);
