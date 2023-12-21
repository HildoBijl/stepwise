const { selectRandomly } = require('../../../../../util')
const gasProperties = require('../../../../../data/gasProperties')
const { getSimpleExerciseProcessor, performComparison } = require('../../../../../eduTools')

const data = {
	skill: 'specificGasConstant',
	comparison: {
		default: {
			relativeMargin: 0.015,
		},
	}
}

function generateState() {
	return { medium: selectRandomly(['air', 'argon', 'carbonMonoxide', 'helium', 'hydrogen', 'methane', 'nitrogen', 'oxygen']) }
}

function getSolution({ medium }) {
	return gasProperties[medium].Rs
}

function checkInput(state, input) {
	const solution = getSolution(state)
	return performComparison('Rs', input, solution, data.comparison.default)
}

module.exports = {
	data,
	generateState,
	processAction: getSimpleExerciseProcessor(checkInput, data),
	checkInput,
	getSolution,
}