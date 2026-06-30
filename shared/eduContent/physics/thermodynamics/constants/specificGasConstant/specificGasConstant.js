const { sample } = require('@step-wise/utils')
const { gasProperties } = require('@step-wise/physics-data')
const { buildSimpleExercise } = require('@step-wise/input-exercises')
const { performComparison } = require('../../../../../eduTools')

const metaData = {
	skill: 'specificGasConstant',
	comparison: {
		default: {
			float: {
				relativeTolerance: 0.015,
			},
		},
	}
}

function generateState() {
	return { medium: sample(['air', 'argon', 'carbonMonoxide', 'helium', 'hydrogen', 'methane', 'nitrogen', 'oxygen']) }
}

function getSolution({ medium }) {
	return { Rs: gasProperties[medium].Rs }
}

function checkInput(exerciseData) {
	return performComparison(exerciseData, 'Rs')
}

module.exports = buildSimpleExercise({ metaData, generateState, getSolution, checkInput })
