const { selectRandomly } = require('../../../util')
const gasProperties = require('../../../data/gasProperties')
const { getSimpleExerciseProcessor } = require('../../../eduTools')
const { performComparison } = require('../util/comparison')

const data = {
	skill: 'specificHeats',
	comparison: {
		default: {
			relativeMargin: 0.02,
		},
	}
}

function generateState() {
	return { medium: selectRandomly(['air', 'argon', 'carbonMonoxide', 'helium', 'hydrogen', 'methane', 'nitrogen', 'oxygen']) }
}

function getSolution({ medium }) {
	return gasProperties[medium]
}

function checkInput(state, input) {
	const solution = getSolution(state)
	return performComparison(['cv', 'cp'], input, solution, data.comparison)
}

module.exports = {
	data,
	generateState,
	processAction: getSimpleExerciseProcessor(checkInput, data),
	checkInput,
	getSolution,
}