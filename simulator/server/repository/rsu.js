function getRSUdata() {
	const data = [
		{
			id: 'RSU1',
			port: '12347',
		},
		{
			id: 'RSU2',
			port: '12348',
		},
	];
	return data;
}

module.exports = {
	getRSUdata,
};
