const { getRandomInteger } = require('../../util/random')

module.exports = {
	data: {
		canSplit: true,
		numSteps: 3,
		difficulty: null, // ToDo: include prerequisites to predict difficulty.
	},
	data: {},
	generateState: () => {
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
	},
	checkInput: ({ a, b, c, d }, { ans }) => {
		return a * b + c * d === ans
	},
	processResult(result, prevProgress) {

		return {} // Progress; ToDo.
	},
}