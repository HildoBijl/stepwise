const { ensureInt } = require('../numbers')
const { numberArray } = require('../arrays')

// getRandomBoolean returns true or false, randomly. Optionally, the probability for true can be given.
function getRandomBoolean(probability = 0.5) {
	return Math.random() < probability
}
module.exports.getRandomBoolean = getRandomBoolean

// getRandomNumber returns a random floating number between the given minimum and maximum.
function getRandomNumber(min, max) {
	return min + (max - min) * Math.random()
}
module.exports.getRandomNumber = getRandomNumber

// getRandomInteger returns a random integer between the given min and max (both inclusive) according to a uniform distribution. Optionally, an array of values that should not be selected can be passed along. So getRandomInteger(-3, 5, [-1,0,1]) returns either -3, -2, 2, 3, 4 or 5, each with a 1/6 chance.
function getRandomInteger(min, max, prevent = []) {
	// Check input: must be numbers.
	min = ensureInt(min)
	max = ensureInt(max)
	prevent = Array.isArray(prevent) ? prevent : [prevent]

	// Check the number of options.
	if (max - min + 1 <= prevent.length && numberArray(min, max).every(option => prevent.includes(option)))
		throw new Error(`Invalid getRandomInteger options: we tried to generate a random number between ${max} and ${min}, but (after taking into account a prevent-array) there were no options left.`)

	// Set up a random integer number.
	const number = Math.floor(Math.random() * (max - min + 1)) + min

	// Check if it's in the prevent list. If so, repeat to eventually find something.
	if (prevent.includes(number))
		return getRandomInteger(min, max, prevent)

	// All good!
	return number
}
module.exports.getRandomInteger = getRandomInteger
