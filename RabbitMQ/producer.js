const amqp = require('amqplib/callback_api');

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Producer = (queueName, isDurable = false) => {
	let connection;
	let channel;
	const rabbitMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';

	const connect = () => {
		amqp.connect(rabbitMQ_URL, function (conn_err, conn) {
			if (conn_err) {
				throw conn_err;
			}
			connection = conn;
			connection.createChannel(function (channel_error, ch) {
				if (channel_error) {
					throw channel_error;
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
					},
				);
			});
		});
	};

	const publish = (msg) => {
		channel.sendToQueue(queueName, Buffer.from(msg));
	};

	const close = () => {
		if (channel) {
			channel.close();
		}
		if (connection) {
			connection.close();
		}
	};

	return {
		connect,
		publish,
		close,
	};
};

module.exports = Producer;
