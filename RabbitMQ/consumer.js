const amqp = require('amqplib/callback_api');

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Consumer = (queueName, callbackFunction, isDurable = false) => {
	let connection;
	let channel;
	const rabbitMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';

	const callback = (msg) => {
		let data = JSON.parse(msg.content.toString('utf-8'));
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

			channel.assertQueue(
				queueName,
				{ durable: isDurable },
				function (error2, q) {
					if (error2) {
						connection.close();
						throw error2;
					}
					channel.consume(queueName, callback, { noAck: true });
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
