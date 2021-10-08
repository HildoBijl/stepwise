const { getRandomInteger } = require('../../../util/random')
const { getStepExerciseProcessor } = require('../util/stepExercise')

const { Expression } = require('../../../inputTypes/Expression')
const { Equation } = require('../../../inputTypes/Equation')
const { asExpression, asEquation } = require('../../../inputTypes/Expression/interpreter/fromString')

const data = {
	skill: 'moveATerm',
	steps: [null, null],
	equalityOptions: {
		default: {
			expression: Expression.equalityLevels.onlyOrderChanges,
			equation: Equation.equalityLevels.keepSides,
		}
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
	const ans = intermediate.simplify(Expression.simplifyOptions.basicClean)
	return { ...state, equation, term, left, subtract, intermediate, ans }
}

function checkInput(state, input, step) {
	const { intermediate, ans } = getCorrect(state)
	if (step === 0 || step === 2)
		return ans.equals(input.ans, data.equalityOptions.default)
	if (step === 1)
		return intermediate.equals(input.intermediate, data.equalityOptions.default)
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	getEquation,
	getCorrect,
	checkInput,
}