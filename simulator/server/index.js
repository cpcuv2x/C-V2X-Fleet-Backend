const express = require('express');
const app = express();
const cors = require('cors');
const { fork } = require('child_process');

const child_process = fork('obu.js', ['12345', 'ID1']);
const child_process1 = fork('obu.js', ['12346', 'ID2']);

const OBU_MAP = new Map();
OBU_MAP.set('ID1', {
	id: 'ID1',
	speed: 20,
});
OBU_MAP.set('ID2', {
	id: 'ID2',
	speed: 20,
});

app.use(cors());
app.use(express.json());

app.get('/obu', (req, res) => {
	res.json(Array.from(OBU_MAP));
});

app.get('/obu/:id', (req, res) => {
	res.json(OBU_MAP.get(req.params.id));
});

app.post('/obu/:id', (req, res) => {
	const id = req.params.id;
	const data = req.body;

	const speed = data.speed;

	// Update the speed of the OBU
	child_process.send(speed);
	OBU_MAP.get(id).speed = speed;

	res.json(OBU_MAP.get(id));
});

app.listen(8000, () => {
	console.log('Simulator is running on port 8000');
});
