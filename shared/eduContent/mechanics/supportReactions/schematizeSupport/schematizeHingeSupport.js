const { deg2rad, getRandomInteger } = require('../../../../util')
const { Vector } = require('../../../../geometry/Vector')
const { getStepExerciseProcessor, performComparison } = require('../../../../eduTools')

const { loadSources, loadTypes, getDefaultForce, isLoadAtPoint } = require('../../tools')

const { reaction } = loadSources

const metaData = {
	skill: 'schematizeSupport',
	steps: [null, null, null, null],
	comparison: {
		loads: checkHingeSupport,
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
			getDefaultForce(A, deg2rad(wallRotation + 90), reaction),
		],
		forcePerpendicular: 0,
		forceParallel: 0,
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
	if (forces[0].span.alongEqualLine(forces[1].span))
		return false

	// All in order.
	return true
}

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getStepExerciseProcessor(exercise),
}
