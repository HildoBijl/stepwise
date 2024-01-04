const { selectRandomly } = require('../../../../../util')
const gasProperties = require('../../../../../data/gasProperties')
const { getSimpleExerciseProcessor, performComparison } = require('../../../../../eduTools')

const metaData = {
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
	return { Rs: gasProperties[medium].Rs }
}

function checkInput(exerciseData) {
	return performComparison(exerciseData, 'Rs')
}

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getSimpleExerciseProcessor(exercise),
}
