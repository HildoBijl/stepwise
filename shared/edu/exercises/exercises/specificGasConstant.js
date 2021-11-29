const { selectRandomly } = require('../../../util/random')
const gasProperties = require('../../../data/gasProperties')
const { getSimpleExerciseProcessor } = require('../util/simpleExercise')
const { performComparison } = require('../util/check')

const data = {
	skill: 'specificGasConstant',
	equalityOptions: {
		relativeMargin: 0.015,
	}
}

function generateState() {
	return { medium: selectRandomly(['air', 'argon', 'carbonMonoxide', 'helium', 'hydrogen', 'methane', 'nitrogen', 'oxygen']) }
}

function checkInput(state, input) {
	const solution = getSolution(state)
	return performComparison('Rs', input, solution, data.equalityOptions)
}

function getSolution({ medium }) {
	return gasProperties[medium].Rs
}

module.exports = {
	data,
	generateState,
	processAction: getSimpleExerciseProcessor(checkInput, data),
	checkInput,
	getSolution,
}