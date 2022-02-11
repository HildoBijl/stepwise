const { ensureInt } = require('./numbers')
const { ensureArray, getCumulativeArray, lastOf, numberArray, shuffle } = require('./arrays')

// getRandomBoolean returns true or false, randomly. Optionally, the probability for true can be given.
function getRandomBoolean(probability = 0.5) {
	return Math.random() < probability
}
module.exports.getRandomBoolean = getRandomBoolean

// getRandom returns a random floating number between the given minimum and maximum.
function getRandom(min, max) {
	return min + (max - min) * Math.random()
}
module.exports.getRandom = getRandom

/* getRandomInteger returns a random integer between the given min and max (both inclusive) according to a uniform distribution. It must receive these parameters:
 * - min (obligatory): the minimum value (inclusive).
 * - max (obligatory): the maximum value (inclusive).
 * - prevent: an integer or array of integers to exclude. For instance, using { min: -3, max: 3, prevent: [-1, 0, 1] } will give either -3, -2, 2 or 3.
 */
function getRandomInteger(min, max, prevent = []) {
	// Check input: must be numbers.
	min = ensureInt(min)
	max = ensureInt(max)
	prevent = Array.isArray(prevent) ? prevent : [prevent]

	// Check the number of options.
	if (max - min + 1 <= prevent.length)
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

// selectRandomly takes an array and returns a random element from it.
function selectRandomly(arr, weights) {
	// If there are no weights, just pick one uniformly randomly.
	arr = ensureArray(arr)
	if (weights === undefined)
		return arr[getRandomInteger(0, arr.length - 1)]

	// If there are weights, apply them.
	const cumWeights = getCumulativeArray(weights)
	const random = Math.random() * lastOf(cumWeights)
	const index = cumWeights.findIndex(cumWeight => random <= cumWeight)
	return arr[index]
}
module.exports.selectRandomly = selectRandomly

// getRandomIndices takes an array length, like 5, and a number of indices that need to be chosen, like 3. It then returns an array with that many randomly chosen indices. Like [4, 0, 3]. If randomOrder is manually set to false, they will appear in order. (So [0, 3, 4] in the example.) Note: the given arrayLength number is an exclusive bound: it itself never appears in the array.
function getRandomIndices(arrayLength, num = arrayLength, randomOrder = true) {
	const indices = shuffle(numberArray(0, arrayLength - 1)).slice(0, num)
	return randomOrder ? indices : indices.sort((a, b) => a - b)
}
module.exports.getRandomIndices = getRandomIndices

// getRandomSubset takes an array like ['A', 'B', 'C', 'D'] and randomly picks num elements out of it. For instance, if num = 2 then it may return ['D', 'B']. If randomOrder is set to true (default) then the order is random. If it is set to false, then the elements will always appear in the same order as in the original array. (Note: for huge arrays and a small subset this function is not optimized for efficiency.)
function getRandomSubset(array, num, randomOrder = true) {
	// Check input.
	array = ensureArray(array)
	num = ensureInt(num)

	// Create a mapping of the right size and apply it.
	const mapping = getRandomIndices(array.length, num, randomOrder)
	return mapping.map(index => array[index])
}
module.exports.getRandomSubset = getRandomSubset

// selectRandomCorrect gives a random correct text.
function selectRandomCorrect() {
	return selectRandomly([
		'Dat is goed!',
		'Indrukwekkend gedaan.',
		'Geweldig, het is je gelukt!',
		'Dat is de juiste oplossing.',
		'Klopt helemaal.',
		'Prachtig! Ga zo door.',
		'Gaat lekker zo.',
		'Correct! Goed gedaan.',
		'Je hebt hem opgelost!',
		'Mooi zo!',
		'Helemaal perfect.',
		'Ziet er goed uit.',
		'Top! Het klopt.',
		'Ja, dat is hem.',
		'Dat is het goede antwoord.',
		'Dat is helemaal correct.',
	])
}
module.exports.selectRandomCorrect = selectRandomCorrect

// selectRandomIncorrect gives a random incorrect text.
function selectRandomIncorrect() {
	return selectRandomly([
		'Dat is niet de juiste oplossing.',
		'Helaas, dat klopt niet.',
		'Dat is niet correct.',
		'Nog eens proberen?',
		'Die is mis.',
		'Je zit er helaas naast.',
		'Nee, niet het juiste antwoord.',
		'Tja ... net niet.',
		'Sorry, dat is fout.',
		'Nee, dat is hem niet.',
		'Oops, dat is een verkeerd antwoord.',
	])
}
module.exports.selectRandomIncorrect = selectRandomIncorrect

// selectRandomEmpty gives a random text that a field is empty.
function selectRandomEmpty() {
	return selectRandomly([
		'Je hebt niets ingevuld.',
		'Dit veld is nog leeg.',
		'Je bent hier iets vergeten in te vullen.',
		'Je moet hier iets invullen.',
		'Hier mist nog wat.',
	])
}
module.exports.selectRandomEmpty = selectRandomEmpty

// selectRandomNegative gives a random text that a number is negative.
function selectRandomNegative() {
	return selectRandomly([
		'Dit is een negatief getal.',
		'Dit getal is niet positief.',
		'Dat minteken hoort daar niet.',
		'Dit getal hoort positief te zijn.',
		'Wat doet dat minteken daar?',
	])
}
module.exports.selectRandomNegative = selectRandomNegative

// selectRandomInvalidUnit gives a random text that a unit is faulty.
function selectRandomInvalidUnit() {
	return selectRandomly([
		'Dit is geen geldige eenheid.',
		'Check je eenheid nog eens.',
		'Deze eenheid ziet er niet correct uit.',
		'Er is iets mis met je eenheid.',
		'Er zitten niet kloppende delen in je eenheid.',
	])
}
module.exports.selectRandomInvalidUnit = selectRandomInvalidUnit