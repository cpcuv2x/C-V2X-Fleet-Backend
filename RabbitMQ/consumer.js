const amqp = require('amqplib/callback_api');

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Consumer = (queueName, routingKey, callbackFunction) => {
	let connection;
	let channel;
	const rabbitMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';

	const callback = (ch, method, properties, body) => {
		let data = JSON.parse(ch.content.toString('utf-8'));
		callbackFunction(data);
	};

	amqp.connect(rabbitMQ_URL, function (error0, conn) {
		if (error0) {
			throw error0;
		}
		connection = conn;

		connection.createChannel(function (error1, ch) {
			if (error1) {
				connection.close();
				throw error1;
			}
			channel = ch;

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
						connection.close();
						throw error2;
					}
					channel.bindQueue(q.queue, exchange, routingKey);

					channel.consume(q.queue, callback, {
						noAck: true,
					});
				},
			);
		});
	});

	const close = () => {
		if (channel) {
			channel.close();
		}
		if (connection) {
			connection.close();
		}
	};

	return {
		close,
	};
};

module.exports = Consumer;
