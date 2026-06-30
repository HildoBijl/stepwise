const { deg2rad, getRandomInteger } = require('@step-wise/utils')
const { Vector } = require('@step-wise/geometry')
const { getStepExerciseProcessor, performComparison } = require('../../../../eduTools')

const { loadSources, getDefaultForce, areLoadsMatching, FBDComparison } = require('../../tools')

const { reaction } = loadSources

const metaData = {
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
	const { wallRotation } = state
	const A = Vector.zero
	return {
		...state,
		points: [A],
		loads: [
			getDefaultForce(A, deg2rad(wallRotation), reaction),
		],
		forcePerpendicular: 0,
		forceParallel: 3,
		moment: 3,
	}
}

function checkInput(exerciseData, step) {
	switch (step) {
		case 1:
			return performComparison(exerciseData, 'forcePerpendicular')
		case 2:
			return performComparison(exerciseData, 'forceParallel')
		case 3:
			return performComparison(exerciseData, 'moment')
		default:
			return performComparison(exerciseData, 'loads')
	}
}

module.exports = buildStepExercise({ metaData, generateState, getSolution, checkInput })
