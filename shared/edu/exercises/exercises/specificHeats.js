const { selectRandomly } = require('../../../util/random')
const gasProperties = require('../../../data/gasProperties')
const { getSimpleExerciseProcessor } = require('../util/simpleExercise')
const { checkParameter } = require('../util/check')

const data = {
	skill: 'specificHeats',
	equalityOptions: {
		default: {
			relativeMargin: 0.02,
		},
	}
}

function generateState() {
	return { medium: selectRandomly(['air', 'argon', 'carbonMonoxide', 'helium', 'hydrogen', 'methane', 'nitrogen', 'oxygen']) }
}

function checkInput(state, input) {
	const solution = getSolution(state)
	return checkParameter(['cv', 'cp'], solution, input, data.equalityOptions)
}

function getSolution({ medium }) {
	return gasProperties[medium]
}

module.exports = {
	data,
	generateState,
	processAction: getSimpleExerciseProcessor(checkInput, data),
	checkInput,
	getSolution,
}