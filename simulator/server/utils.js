function randomElement(arr) {
	return arr[Math.floor(Math.random() * arr.length)];
}

function addLocNoise(latitude, longitude) {
	return {
		latitude: latitude + randomNoise(),
		longitude: longitude + randomNoise(),
	};
}

// function random number between -0.01 and 0.01
function randomNoise() {
	return Math.random() * 0.02 - 0.01;
}

module.exports = {
	randomElement,
	addLocNoise,
};
