const app = require('express')();
const cors = require('cors');
const { fork } = require('child_process');

const child_process = fork('obu.js', ['12345', 'ID1']);
const child_process1 = fork('obu.js', ['12346', 'ID2']);
// child_process.send(20);

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

app.get('/obu', (req, res) => {
	res.json(Array.from(OBU_MAP));
});

app.get('/obu/:id', (req, res) => {
	res.json(OBU_MAP.get(req.params.id));
});

app.listen(3425, () => {
	console.log('Simulator is running on port 3425');
});
