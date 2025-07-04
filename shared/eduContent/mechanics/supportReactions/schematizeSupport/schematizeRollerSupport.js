const { deg2rad, getRandomInteger } = require('../../../../util')
const { Vector } = require('../../../../geometry/Vector')
const { getStepExerciseProcessor, addSetupFromSteps, performComparison } = require('../../../../eduTools')

const { loadSources, getDefaultForce, getDefaultMoment, areLoadsMatching, FBDComparison } = require('../../tools')

const { reaction } = loadSources

const metaData = {
	skill: 'schematizeSupport',
	steps: [null, null, null, null],
	comparison: {
		loads: (input, correct) => areLoadsMatching(input, correct, FBDComparison),
		default: {},
	},
}
addSetupFromSteps(metaData)

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

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getStepExerciseProcessor(exercise),
}
