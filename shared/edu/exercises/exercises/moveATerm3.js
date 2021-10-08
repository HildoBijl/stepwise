const { getRandomInteger } = require('../../../util/random')
const { getStepExerciseProcessor } = require('../util/stepExercise')

// Testing code.
const { Expression, getExpressionTypes } = require('../../../inputTypes/Expression')
const { Sum, Product, Variable } = getExpressionTypes()
const { Equation } = require('../../../inputTypes/Equation')

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

function getTerms() {
	return {
		U: new Variable('U'),
		BvL: new Product('B', 'v', 'L'),
		IR: new Product('I', 'R'),
	}
}

function getEquation({ start }) {
	const { U, BvL, IR } = getTerms()

	switch (start) {
		case 0:
			return new Equation({
				left: U,
				right: new Sum(BvL, IR),
			})
		case 1:
			return new Equation({
				left: new Sum(U, BvL.applyMinus()),
				right: IR,
			})
		default:
			return new Equation({
				left: new Sum(U, IR.applyMinus()),
				right: BvL,
			})
	}
}

function getCorrect(state) {
	const { start, move } = state

	// Determine starting point.
	const equation = getEquation(state)

	// Determine what to move.
	const { U, BvL, IR } = getTerms()
	const term = [U, BvL, IR][move]
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