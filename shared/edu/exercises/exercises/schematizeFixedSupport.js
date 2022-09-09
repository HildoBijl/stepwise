const { getRandomInteger } = require('../../../util/random')
const { Vector } = require('../../../geometry/Vector')

const { getStepExerciseProcessor } = require('../util/stepExercise')
const { performComparison } = require('../util/comparison')

const data = {
	skill: 'schematizeFixedSupport',
	steps: [null, null, null, null],
	comparison: {
		default: {},
	},
}

function generateState() {
	// Determine the angles and check if they match the conditions.
	return {
		wallRotation: getRandomInteger(0, 11) * 30,
		beamRotation: getRandomInteger(-1, 1) * 30,
	}
}

function getSolution(state) {
	return {
		...state,
		points: [new Vector(0, 0)],
		force1: 0,
		force2: 0,
		moment: 0,
		// ToDo: forces.
	}
}

function checkInput(state, input, step) {
	const solution = getSolution(state)
	if (step === 0)
		return true // ToDo
	if (step === 1)
		return performComparison('force1', input, solution, data.comparison)
	if (step === 2)
		return performComparison('force2', input, solution, data.comparison)
	if (step === 3)
		return performComparison('moment', input, solution, data.comparison)
	if (step === 4)
		return true // ToDo
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	getSolution,
	checkInput,
}