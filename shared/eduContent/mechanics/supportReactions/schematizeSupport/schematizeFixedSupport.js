const { deg2rad, getRandomInteger } = require('../../../../util')
const { Vector } = require('../../../../geometry/Vector')
const { getStepExerciseProcessor, performComparison } = require('../../../../eduTools')

const { loadSources, loadTypes, getDefaultForce, getDefaultMoment, isLoadAtPoint } = require('../../tools')

const { reaction } = loadSources

const metaData = {
	skill: 'schematizeSupport',
	steps: [null, null, null, null],
	comparison: {
		loads: checkFixedSupport,
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
			getDefaultForce(A, deg2rad(wallRotation + 90), reaction),
			getDefaultMoment(A, true, deg2rad(wallRotation + beamRotation), reaction),
		],
		forcePerpendicular: 0,
		forceParallel: 0,
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

function checkFixedSupport(input, _, solution) {
	const { points } = solution
	const A = points[0]

	// Check that there are three loads all connected to point A.
	if (input.length !== 3)
		return false
	if (input.some(load => !isLoadAtPoint(load, A)))
		return false

	// Check that there are two forces not along the same line.
	const forces = input.filter(load => load.type === loadTypes.force)
	if (forces.length !== 2)
		return false
	if (forces[0].span.alongEqualLine(forces[1].span))
		return false

	// Check that there is a moment.
	const moment = input.find(load => load.type === loadTypes.moment)
	if (!moment)
		return false

	// All in order.
	return true
}

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getStepExerciseProcessor(exercise),
}
