const { getRandomInteger } = require('../../util/random')

module.exports = {
	data: {
		canSplit: false,
	},
	generateState: () => {
		const a = getRandomInteger(1,10)
		const b = getRandomInteger(1,10)
		return {
			a,
			b,
		}
	},
	checkInput: ({ a, b }, { ans }) => {
		return a * b === ans
	},
	processResult(result, prevProgress, adjustSkill) {

		return {} // Progress; ToDo.
	},
}