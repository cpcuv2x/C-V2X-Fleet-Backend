let {
  setActiveStatus,
  setWarningStatus,
  setLatitude,
  setLongitude,
  setSpeed,
} = require('../../OBU/obu.js');

process.on('message', (message) => {
  const { type, value } = message;
  console.log('Message from parent:', type, value);
  if (type === 'speed') {
    setSpeed(value);
  } else if (type === 'heartbeat') {
    if (String(value).toLowerCase() === 'warning') {
      setWarningStatus(true);
    } else if (String(value).toLowerCase() === 'active') {
      setWarningStatus(false);
      setActiveStatus(true);
    } else if (String(value).toLowerCase() === 'inactive') {
      setWarningStatus(false);
      setActiveStatus(false);
    }
  }
});
