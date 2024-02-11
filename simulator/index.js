const { fork } = require('child_process');
const path = require('path');

const child_process = fork(path.join(__dirname, 'obu.js'), ['12345', 'ID1']);
fork(path.join(__dirname, 'obu.js'), ['12346', 'ID2']);

child_process.send(20);
