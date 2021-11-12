const { getRandomInteger } = require('../../../util/random')
const { asExpression, asEquation, equationChecks, simplifyOptions } = require('../../../CAS')

const { getStepExerciseProcessor } = require('../util/stepExercise')

const { onlyOrderChanges } = equationChecks

const data = {
	skill: 'moveATerm',
	steps: [null, null],
	check: {
		ans: onlyOrderChanges,
		intermediate: onlyOrderChanges,
	},
}

function generateState() {
	return {
		start: getRandomInteger(0, 2), // Do we start with (0) U = BvL + IR, with (1) U - BvL = IR or (2) U - IR = BvL?
		move: getRandomInteger(0, 2), // Do we move (0) U, (1) BvL or (2) IR?
	}
}

function getEquation({ start }) {
	switch (start) {
		case 0:
			return asEquation('U=BvL+IR')
		case 1:
			return asEquation('U-BvL=IR')
		default:
			return asEquation('U-IR=BvL')
	}
}

function getCorrect(state) {
	const { start, move } = state

	// Determine starting point.
	const equation = getEquation(state)

	// Determine what to move.
	const term = [asExpression('U'), asExpression('BvL'),	asExpression('IR')][move]
	const left = move === 0 || move === start
	const subtract = start === 0 || start !== move
	const intermediate = equation[subtract ? 'subtract' : 'add'](term)

	// Determine the answer.
	const ans = intermediate.simplify(simplifyOptions.basicClean)
	return { ...state, equation, term, left, subtract, intermediate, ans }
}

function checkInput(state, input, step) {
	const correct = getCorrect(state)
	if (step === 0 || step === 2)
		return performCheck('ans', correct, input, data.check)
	if (step === 1)
		return performCheck('intermediate', correct, input, data.check)
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	getEquation,
	getCorrect,
	checkInput,
}