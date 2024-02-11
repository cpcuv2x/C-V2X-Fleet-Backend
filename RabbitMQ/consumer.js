const amqp = require('amqplib/callback_api');

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Consumer = (queueName, routingKey, callbackFunction) => {
	const rabbitMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';

	const callback = (ch, method, properties, body) => {
		let data = JSON.parse(ch.content.toString('utf-8'));
		callbackFunction(data);
	};

	amqp.connect(rabbitMQ_URL, function (error0, connection) {
		if (error0) {
			throw error0;
		}
		connection.createChannel(function (error1, channel) {
			if (error1) {
				throw error1;
			}
			var exchange = 'direct_logs';

			channel.assertExchange(exchange, 'direct', {
				durable: true,
			});

			channel.assertQueue(
				queueName,
				{
					durable: true,
					// exclusive: true,
				},
				function (error2, q) {
					if (error2) {
						throw error2;
					}
					channel.bindQueue(q.queue, exchange, routingKey);

					channel.consume(q.queue, callback, {
						noAck: true,
					});
				},
			);
			// console.log(' [*] Waiting for logs. To exit press CTRL+C');
		});
	});
};

module.exports = Consumer;
