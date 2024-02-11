const amqp = require('amqplib/callback_api');
require('dotenv').config({ path: '../.env' });

const Producer = () => {
	let channel;
	const exchange = 'direct_logs';
	const rabbitMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';

	const connect = () => {
		amqp.connect(rabbitMQ_URL, function (conn_err, connection) {
			if (conn_err) {
				throw conn_err;
			}
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
		// console.log(" [x] Sent %s: '%s'", routingKey, msg);
	};

	return {
		connect,
		publish,
	};
};

module.exports = Producer;
