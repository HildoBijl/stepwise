const { getRandomInteger } = require('../../../util/random')

function generateState() {
	const a = getRandomInteger(1,10)
	const x = getRandomInteger(1,10)
	return {
		a,
		b: a*x,
	}
}
module.exports = generateState
