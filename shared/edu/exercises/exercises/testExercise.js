const { getRandomInteger } = require('../../../inputTypes/Integer')
const { Vector } = require('../../../CAS/linearAlgebra')

const { getSimpleExerciseProcessor } = require('../util/simpleExercise')
const { loadTypes, getDefaultForce, getDefaultMoment, FBDEqualityOptions, areLoadsMatching } = require('../util/engineeringMechanics')

const { reaction, external } = loadTypes

const data = {
	skill: 'test',
	equalityOptions: FBDEqualityOptions,
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
	const scale = 70
	const margin = 100
	const marginTop = 40
	const shift = 60
	const diagramSettings = {
		maxWidth: scale * (l1 + l2) + 2 * margin,
		width: scale * (l1 + l2) + 2 * margin,
		height: scale * h + margin + marginTop,
	}
	const A = new Vector(margin, marginTop + scale * h)
	const B = new Vector(A.x + scale * l1, A.y)
	const C = new Vector(B.x + scale * l2, B.y)
	const D = new Vector(C.x, C.y - scale * h)
	const points = { A, B, C, D }

	const beam = [
		getDefaultForce(A, 0, reaction),
		getDefaultForce(A, -Math.PI / 2, reaction),
		getDefaultForce(B, -Math.PI / 2, reaction),
		getDefaultMoment(C, false, Math.PI, external),
		getDefaultForce(D, 0, external),
	]

	return { ...state, diagramSettings, scale, margin, shift, points, beam }
}

function checkInput(state, input) {
	const solution = getSolution(state)
	return areLoadsMatching(input.beam, solution.beam, data.equalityOptions)
}

module.exports = {
	data,
	generateState,
	processAction: getSimpleExerciseProcessor(checkInput, data),
	checkInput,
	getSolution,
}
