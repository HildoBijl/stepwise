const { getRandomInteger } = require('../../util/random')

module.exports = {
	data: {
		canSplit: true,
		numSteps: 2,
		difficulty: null, // ToDo: include prerequisites to predict difficulty.
	},
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
	processResult(result, prevProgress, adjustSkill) {

		return {} // Progress; ToDo.
	},
}