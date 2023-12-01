const { deg2rad, getRandomInteger } = require('../../util')
const { Vector } = require('../../geometry/Vector')
const { getStepExerciseProcessor, performComparison } = require('../../eduTools')

const { loadSources, loadTypes, getDefaultForce, isLoadAtPoint } = require('../mechanics')

const { reaction } = loadSources

const data = {
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

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	getSolution,
	checkInput,
}