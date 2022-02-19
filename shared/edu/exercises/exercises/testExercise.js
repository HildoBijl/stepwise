const { getRandomInteger } = require('../../../inputTypes/Integer')
const { getSimpleExerciseProcessor } = require('../util/simpleExercise')

const data = {
	skill: 'test',
	equalityOptions: {},
}

function generateState() {
	return {
		l1: getRandomInteger(3, 6),
		l2: getRandomInteger(1, 2),
		h: getRandomInteger(1, 3),
	}
}

function getSolution(state) {
	const { l1, l2, h } = state
	const diagramSettings = {
		maxWidth: 600,
		width: 100 * (l1 + l2 + 1),
		height: 100 * (h + 1),
	}
	const A = new Vector(50, 50 + 100 * h)
	const B = new Vector(A.x + 100 * l1, A.y)
	const C = new Vector(B.x + 100 * l2, B.y)
	const D = new Vector(C.x, C.y - 100 * h)
	const points = { A, B, C, D }
	return { ...state, diagramSettings, points }
}

function checkInput(state, input) {
	console.log(state)
	console.log(input)
	return false
}

module.exports = {
	data,
	generateState,
	processAction: getSimpleExerciseProcessor(checkInput, data),
	checkInput,
	getSolution,
}
