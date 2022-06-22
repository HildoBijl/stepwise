const { selectRandomly } = require('../../../util/random')
const constants = require('../../../data/constants')
const { getSimpleExerciseProcessor } = require('../util/simpleExercise')
const { performComparison } = require('../util/comparison')

const data = {
	skill: 'lookUpConstant',
	comparison: {
		relativeMargin: 0.0001,
	}
}

function generateState() {
	return { constant: selectRandomly(['c', 'g', 'R', 'e', 'k', 'G']) }
}

function getSolution({ constant }) {
	return { ans: constants[constant] }
}

function checkInput(state, input) {
	const solution = getSolution(state)
	return performComparison('ans', input, solution, data.comparison)
}

module.exports = {
	data,
	generateState,
	processAction: getSimpleExerciseProcessor(checkInput, data),
	checkInput,
}