// getRandomInteger returns a random integer between the given minimum and maximum (both inclusive).
function getRandomInteger(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min
}
module.exports.getRandomInteger = getRandomInteger

// selectRandomly takes an array and returns a random element from it.
function selectRandomly(arr) {
	return arr[getRandomInteger(0, arr.length - 1)]
}
module.exports.selectRandomly = selectRandomly
