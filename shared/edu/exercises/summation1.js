const { getRandomInteger } = require('../../util/random')

module.exports = {
	data: {
		canSplit: false,
	},
	generateState: () => {
		const a = getRandomInteger(1, 100)
		const b = getRandomInteger(1, 100)
		return {
			a,
			b,
		}
	},
	checkInput: ({ a, b }, { ans }) => {
		return a + b === ans
	},
	processResult(result, prevProgress, adjustSkill) {

		return {} // Progress; ToDo.
	},
}