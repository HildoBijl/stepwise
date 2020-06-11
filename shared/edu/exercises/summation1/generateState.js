const { getRandomInteger } = require('../../../util/random')

function generateState() {
	const a = getRandomInteger(1,100)
	const b = getRandomInteger(1,100)
	return {
		a,
		b,
	}
}
module.exports = generateState
