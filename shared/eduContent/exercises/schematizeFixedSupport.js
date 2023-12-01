const { deg2rad, getRandomInteger } = require('../../util')
const { Vector } = require('../../geometry/Vector')
const { getStepExerciseProcessor, performComparison } = require('../../eduTools')

const { loadSources, loadTypes, getDefaultForce, getDefaultMoment, isLoadAtPoint } = require('../util/engineeringMechanics')

const { reaction } = loadSources

const data = {
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

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	getSolution,
	checkInput,
}