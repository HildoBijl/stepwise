const { deg2rad, getRandomInteger } = require('@step-wise/utils')
const { Vector } = require('@step-wise/geometry')
const { buildStepExercise, stepsToSetup } = require('@step-wise/input-exercises')
const { compare } = require('@step-wise/exercise-grading')

const { loadSources, getDefaultForce, getDefaultMoment, areLoadsMatching, FBDComparison } = require('../../tools')

const { reaction } = loadSources

const metaData = {
	skill: 'schematizeSupport',
	...stepsToSetup([undefined, undefined, undefined, undefined]),
	compare: {
		loads: (input, correct) => areLoadsMatching(input, correct, FBDComparison),
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

function checkInput(data, step) {
	switch (step) {
		case 1:
			return compare('forcePerpendicular', data)
		case 2:
			return compare('forceParallel', data)
		case 3:
			return compare('moment', data)
		default:
			return compare('loads', data)
	}
}

module.exports = buildStepExercise({ metaData, generateState, getSolution, checkInput })
