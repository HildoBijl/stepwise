const { deg2rad } = require('../../../util/numbers')
const { getRandomInteger } = require('../../../util/random')
const { Vector } = require('../../../geometry/Vector')

const { getStepExerciseProcessor } = require('../util/stepExercise')
const { performComparison } = require('../util/comparison')
const { loadSources, loadTypes, getDefaultForce, getDefaultMoment, isLoadAtPoint, areLoadsEqual, FBDComparison } = require('../util/engineeringMechanics')

const { reaction } = loadSources

const data = {
	skill: 'schematizeSupport',
	steps: [null, null, null, null],
	comparison: {
		loads: checkRollerSupport,
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

function checkRollerSupport(input, _, solution) {
	const { points, loads } = solution
	const [force, moment] = loads
	const A = points[0]

	// Check that there are two loads all connected to point A.
	if (input.length !== 2)
		return false
	if (input.some(load => !isLoadAtPoint(load, A)))
		return false

	// Check that there is one force equaling the solution.
	const forces = input.filter(load => load.type === loadTypes.force)
	if (forces.length !== 1)
		return false
	if (!areLoadsEqual(forces[0], force, FBDComparison))
		return false

	// Check that there is one moment equaling the solution.
	const moments = input.filter(load => load.type === loadTypes.moment)
	if (moments.length !== 1)
		return false
	if (!areLoadsEqual(moments[0], moment, FBDComparison))
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