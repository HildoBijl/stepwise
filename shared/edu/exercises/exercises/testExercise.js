const { getRandomInteger } = require('../../../inputTypes/Integer')
const { Vector } = require('../../../geometry')

const { getSimpleExerciseProcessor } = require('../util/simpleExercise')
const { loadSources, getDefaultForce, getDefaultMoment, FBDComparison, areLoadsMatching } = require('../util/engineeringMechanics')

const { reaction, external } = loadSources

const data = {
	skill: 'test',
	comparison: FBDComparison,
}

function generateState() {
	return {
		l1: getRandomInteger(3, 6),
		l2: getRandomInteger(2, 4),
		h: getRandomInteger(2, 4),
	}
}

function getSolution(state) {
	const { l1, l2, h } = state

	// Define points.
	const A = new Vector(0, 0)
	const B = new Vector(l1, 0)
	const C = new Vector(l1 + l2, 0)
	const D = new Vector(l1 + l2, -h)
	const points = { A, B, C, D }

	// Define loads.
	const loads = [
		getDefaultForce(A, 0, reaction),
		getDefaultForce(A, -Math.PI / 2, reaction),
		getDefaultForce(B, -Math.PI / 2, reaction),
		getDefaultMoment(C, false, Math.PI, external),
		getDefaultForce(D, 0, external),
	]

	return { ...state, points, loads }
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
