const amqp = require('amqplib/callback_api');

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Producer = () => {
	let connection;
	let channel;
	const exchange = 'direct_logs';
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

				ch.assertExchange(exchange, 'direct', {
					durable: true,
				});

				channel = ch;
			});
		});
	};

	const publish = (routingKey, msg) => {
		channel.publish(exchange, routingKey, Buffer.from(msg));
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
