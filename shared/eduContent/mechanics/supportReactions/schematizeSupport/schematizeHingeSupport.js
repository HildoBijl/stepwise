const { deg2rad, getRandomInteger } = require('@step-wise/utils')
const { Vector } = require('@step-wise/geometry')
const { buildStepExercise, stepsToSetup } = require('@step-wise/input-exercises')
const { compare } = require('@step-wise/exercise-grading')

const { loadSources, loadTypes, getDefaultForce, isLoadAtPoint } = require('../../tools')

const { reaction } = loadSources

const metaData = {
	skill: 'schematizeSupport',
	...stepsToSetup([undefined, undefined, undefined, undefined]),
	compare: {
		loads: checkHingeSupport,
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
			getDefaultForce(A, deg2rad(wallRotation + 90), reaction),
		],
		forcePerpendicular: 0,
		forceParallel: 0,
		moment: 3,
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

function checkHingeSupport(input, _, solution) {
	const { points } = solution
	const A = points[0]

	// Check that there are two loads all connected to point A.
	if (input.length !== 2)
		return false
	if (input.some(load => !isLoadAtPoint(load, A)))
		return false

	// Check that there are two forces not along the same line.
	const forces = input.filter(load => load.type === loadTypes.force)
	if (forces.length !== 2)
		return false
	if (forces[0].force.alongEqualLine(forces[1].force))
		return false

	// All in order.
	return true
}

module.exports = buildStepExercise({ metaData, generateState, getSolution, checkInput })
