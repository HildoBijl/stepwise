const { deg2rad } = require('../../../util/numbers')
const { getRandomBoolean, getRandomInteger } = require('../../../util/random')
const { Vector } = require('../../../geometry')
const { Variable } = require('../../../CAS')

const { getSimpleExerciseProcessor } = require('../util/simpleExercise')
const { loadSources, getDefaultForce, FBDComparison, areLoadsMatching } = require('../util/engineeringMechanics')

const { reaction, external } = loadSources

const data = {
	skill: 'demo',
	comparison: FBDComparison,
}

function generateState() {
	return {
		l1: getRandomInteger(2, 4),
		l2: getRandomInteger(2, 4),
		theta: getRandomInteger(30, 80),
		fixA: getRandomBoolean(),
	}
}

function getSolution(state) {
	const { l1, l2, theta, fixA } = state

	const A = new Vector(0, 0)
	const B = new Vector(l1, 0)
	const C = new Vector(l1 + l2, 0)
	const points = { A, B, C }

	const loads = [
		getDefaultForce(B, deg2rad(theta), external),
		getDefaultForce(fixA ? A : C, Math.PI, reaction, fixA),
		getDefaultForce(A, -Math.PI / 2, reaction),
		getDefaultForce(C, -Math.PI / 2, reaction),
	]
	const prenamedLoads = [{ name: new Variable('P'), load: loads[0] }]

	return { ...state, points, loads, prenamedLoads, comparison: data.comparison }
}

function checkInput(state, input) {
	const solution = getSolution(state)
	return areLoadsMatching(input.loads, solution.loads, data.comparison)
}

module.exports = {
	data,
	generateState,
	processAction: getSimpleExerciseProcessor(checkInput, data),
	checkInput,
	getSolution,
}
