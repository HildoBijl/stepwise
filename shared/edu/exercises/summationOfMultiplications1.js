const { getRandomInteger } = require('../../util/random')

module.exports = {
	data: {},
	generateState: () => {
		const a = getRandomInteger(1, 10)
		const b = getRandomInteger(1, 10)
		const c = getRandomInteger(1, 100)
		return {
			a,
			b,
			c,
		}
	},
	checkInput: ({ a, b, c }, { ans }) => {
		return a * b + c === ans
	},
	processResult(result, prevProgress) {

		return {} // Progress; ToDo.
	},
}