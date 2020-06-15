const { getRandomInteger } = require('../../util/random')

module.exports = {
	data: {
		canBeSplit: false,
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
		return a * b === parseInt(ans)
	},
	processResult(result, prevProgress) {

		return {} // Progress; ToDo.
	},
}