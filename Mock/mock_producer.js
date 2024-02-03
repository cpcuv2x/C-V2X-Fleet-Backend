const Producer = require('../RabbitMQ/producer');

const producer = Producer();
producer.connect();

setInterval(() => {
	message = JSON.stringify({
		id: '01',
		velocity: Math.random() * 120,
		unit: 'km/h',
		timestamp: Date(),
	});
	producer.publish('recommend_speed_rsu_01', message);
}, 2000);
