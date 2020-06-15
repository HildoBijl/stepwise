const { getRandomInteger } = require('../../util/random')

module.exports = {
	generateState: () => {
		const a = getRandomInteger(1,10)
		const x = getRandomInteger(1,10)
		return {
			a,
			b: a*x,
		}
	},
	checkInput: ({ a, b }, { x }) => {
		return a * x === b
	},
	processResult(result, prevProgress) {

		return {} // Progress; ToDo.
	}
}