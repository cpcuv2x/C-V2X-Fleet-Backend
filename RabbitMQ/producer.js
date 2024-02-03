const amqp = require('amqplib/callback_api');

const Producer = () => {
	let channel;
	const exchange = 'direct_logs';

	const connect = () => {
		amqp.connect('amqp://localhost', function (error0, connection) {
			if (error0) {
				throw error0;
			}
			connection.createChannel(function (error1, ch) {
				if (error1) {
					throw error1;
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
