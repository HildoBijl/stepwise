const { sample } = require('@step-wise/utils')
const { gasProperties } = require('@step-wise/physics-data')
const { buildSimpleExercise } = require('@step-wise/input-exercises')
const { compare } = require('@step-wise/exercise-grading')

const metaData = {
	skill: 'specificHeats',
	compare: {
		FloatUnit: {
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

function checkInput(data) {
	return compare(['cv', 'cp'], data)
}

module.exports = buildSimpleExercise({ metaData, generateState, getSolution, checkInput })
