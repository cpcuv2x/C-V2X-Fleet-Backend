const Producer = require('../RabbitMQ/producer');
const Consumer = require('../RabbitMQ/consumer');

const producer = Producer();
producer.connect();

const publishRecSpeed = (msg) => {
	let id = msg['id'];
	if (id === '01') {
		message = JSON.stringify({
			id: '01',
			velocity: Math.random() * 120,
			unit: 'km/h',
			timestamp: Date(),
		});
		producer.publish('recommend_speed_rsu_01', message);
	}
};

const consumer = Consumer(
	'queue_heartbeat_rsu',
	'heartbeat_rsu',
	publishRecSpeed,
);

// setInterval(() => {
// 	message = JSON.stringify({
// 		id: '01',
// 		velocity: Math.random() * 120,
// 		unit: 'km/h',
// 		timestamp: Date(),
// 	});
// 	producer.publish('recommend_speed_rsu_01', message);
// }, 2000);
