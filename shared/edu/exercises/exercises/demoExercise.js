const { deg2rad } = require('../../../util/numbers')
const { getRandomBoolean, getRandomInteger } = require('../../../util/random')
const { Vector } = require('../../../geometry')

const { getSimpleExerciseProcessor } = require('../util/simpleExercise')
const { loadTypes, getDefaultForce, getDefaultMoment, FBDComparison, areLoadsMatching } = require('../util/engineeringMechanics')

const { reaction, external } = loadTypes

const data = {
	skill: 'test',
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
		getDefaultForce(fixA ? A : C, 0, reaction),
		getDefaultForce(A, -Math.PI / 2, reaction),
		getDefaultForce(B, deg2rad(theta), external),
		getDefaultForce(C, -Math.PI / 2, reaction),
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
