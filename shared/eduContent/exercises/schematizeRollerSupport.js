const { deg2rad, getRandomInteger } = require('../../util')
const { Vector } = require('../../geometry/Vector')
const { getStepExerciseProcessor, performComparison } = require('../../eduTools')

const { loadSources, getDefaultForce, getDefaultMoment, areLoadsMatching, FBDComparison } = require('../util/engineeringMechanics')

const { reaction } = loadSources

const data = {
	skill: 'schematizeSupport',
	steps: [null, null, null, null],
	comparison: {
		loads: (input, correct) => areLoadsMatching(input, correct, FBDComparison),
		default: {},
	},
}

function generateState() {
	return {
		wallRotation: getRandomInteger(0, 11) * 30,
		beamRotation: getRandomInteger(-1, 1) * 30,
	}
}

function getSolution(state) {
	const { wallRotation, beamRotation } = state
	const A = Vector.zero
	return {
		...state,
		points: [A],
		loads: [
			getDefaultForce(A, deg2rad(wallRotation), reaction),
			getDefaultMoment(A, true, deg2rad(wallRotation + beamRotation), reaction),
		],
		forcePerpendicular: 0,
		forceParallel: 3,
		moment: 0,
	}
}

function checkInput(state, input, step) {
	const solution = getSolution(state)
	if (step === 0)
		return performComparison('loads', input, solution, data.comparison)
	if (step === 1)
		return performComparison('forcePerpendicular', input, solution, data.comparison)
	if (step === 2)
		return performComparison('forceParallel', input, solution, data.comparison)
	if (step === 3)
		return performComparison('moment', input, solution, data.comparison)
	if (step === 4)
		return performComparison('loads', input, solution, data.comparison)
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	getSolution,
	checkInput,
}