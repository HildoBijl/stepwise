const { getRandomInteger } = require('../../../inputTypes/Integer')
const { getSimpleExerciseProcessor } = require('../util/simpleExercise')

const data = {
	skill: 'test',
	equalityOptions: {},
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
	const scale = 80
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

	return { ...state, diagramSettings, scale, margin, shift, points }
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
