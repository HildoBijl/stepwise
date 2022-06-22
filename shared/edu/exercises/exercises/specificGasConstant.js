const { selectRandomly } = require('../../../util/random')
const gasProperties = require('../../../data/gasProperties')
const { getSimpleExerciseProcessor } = require('../util/simpleExercise')
const { performComparison } = require('../util/comparison')

const data = {
	skill: 'specificGasConstant',
	comparison: {
		relativeMargin: 0.015,
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
	return performComparison('Rs', input, solution, data.comparison)
}

module.exports = {
	data,
	generateState,
	processAction: getSimpleExerciseProcessor(checkInput, data),
	checkInput,
	getSolution,
}