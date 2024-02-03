const Consumer = require('../RabbitMQ/consumer');

const printConsume = (msg) => {
	console.log(msg);
};

const consumer1 = Consumer('heartbeat_obu', 'heartbeat_obu', printConsume);
const consumer2 = Consumer('location_obu', 'location_obu', printConsume);
const consumer3 = Consumer('heartbeat_rsu', 'heartbeat_rsu', printConsume);
const consumer4 = Consumer('location_rsu', 'location_rsu', printConsume);
