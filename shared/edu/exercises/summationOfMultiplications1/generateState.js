const { getRandomInteger } = require('../../../util/random')

function generateState() {
	const a = getRandomInteger(1,10)
	const b = getRandomInteger(1,10)
	const c = getRandomInteger(1,10)
	const d = getRandomInteger(1,10)
	return {
		a,
		b,
		c,
		d,
	}
}
module.exports = generateState
