const { Float } = require('../edu/util/inputTypes/Float')

// getRandomInteger returns a random integer between the given minimum and maximum (both inclusive).
function getRandomInteger(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min
}
module.exports.getRandomInteger = getRandomInteger

/* getRandomFloat returns a random float between the given minimum and maximum. You can either set:
 * - the number of decimals. Use "1" for "23.4" and "-1" for "2.34 * 10^3".
 * - the number of significant digits. Use "3" for "23.4" and "2.34 * 10^3".
 * If none is given then infinite precision will be assumed.
 * If rounded is true (default) the number will be rounded to be precisely "23.4" and not be "23.4321" or so behind the scenes.
 */
function getRandomFloat({ min = 0, max = 1, decimals, significantDigits, round = true }) {
	if (decimals !== undefined && significantDigits !== undefined)
		throw new Error(`Invalid input: cannot set both the number of decimals and number of significant digits.`)

	// Determine the number and set its precision accordingly.
	const number = min + (max - min) * Math.random()
	let float
	if (decimals !== undefined) {
		float = new Float({ number, significantDigits: Math.floor(Math.log10(Math.abs(number))) + 1 + decimals })
	} else if (significantDigits !== undefined) {
		float = new Float({ number, significantDigits })
	} else {
		float = new Float({ number, significantDigits: Infinity })
	}
	if (round)
		float.roundToPrecision()
	return float
}
module.exports.getRandomFloat = getRandomFloat

// selectRandomly takes an array and returns a random element from it.
function selectRandomly(arr) {
	return arr[getRandomInteger(0, arr.length - 1)]
}
module.exports.selectRandomly = selectRandomly

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