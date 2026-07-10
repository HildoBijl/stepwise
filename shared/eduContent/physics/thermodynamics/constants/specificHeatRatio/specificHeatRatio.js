const { sample } = require('@step-wise/utils')
const { gasProperties } = require('@step-wise/physics-data')
const { buildSimpleExercise } = require('@step-wise/input-exercises')
const { compare } = require('@step-wise/exercise-grading')

const metaData = {
	skill: 'specificHeatRatio',
	compare: {
		FloatUnit: {
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
	return { k: gasProperties[medium].k }
}

function checkInput(data) {
	return compare('k', data)
}

module.exports = buildSimpleExercise({ metaData, generateState, getSolution, checkInput })
