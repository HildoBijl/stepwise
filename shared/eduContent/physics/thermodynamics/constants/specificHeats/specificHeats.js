const { selectRandomly } = require('../../../../../util')
const gasProperties = require('../../../../../data/gasProperties')
const { getSimpleExerciseProcessor, performComparison } = require('../../../../../eduTools')

const metaData = {
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

function checkInput(exerciseData) {
	return performComparison(exerciseData, ['cv', 'cp'])
}

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getSimpleExerciseProcessor(exercise),
}
