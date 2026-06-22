const { sample } = require('@step-wise/utils')
const { gasProperties } = require('@step-wise/physics-data')
const { getSimpleExerciseProcessor, performComparison } = require('../../../../../eduTools')

const metaData = {
	skill: 'specificHeats',
	comparison: {
		default: {
			float: {
				relativeTolerance: 0.02,
			},
		},
	}
}

function generateState() {
	return { medium: sample(['air', 'argon', 'carbonMonoxide', 'helium', 'hydrogen', 'methane', 'nitrogen', 'oxygen']) }
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
