const { getRandomInteger, getRandomBoolean } = require('../../../util/random')
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
	// ax + b = cy
	return {
		a: getRandomInteger(-12, 12, [0, 1]),
		b: getRandomInteger(-12, 12, [0]),
		c: getRandomInteger(-12, 12, [0, 1]),
		switchLeftRight: getRandomBoolean(),
		switchXY: getRandomBoolean(),
	}
}

function getEquation({ a, b, c, switchLeftRight, switchXY }) {
	const x = new Variable(switchXY ? 'y' : 'x')
	const y = new Variable(switchXY ? 'x' : 'y')

	const left = new Sum([new Product([a, x]), b])
	const right = new Product([c, y])

	return new Equation(switchLeftRight ? { left: right, right: left } : { left, right })
}

function getCorrect(state) {
	const { a, switchXY } = state
	const x = new Variable(switchXY ? 'y' : 'x')

	const equation = getEquation(state)
	const term = new Product([a, x])
	const termAbs = (a < 0 ? term.applyMinus() : term)
	const intermediate = equation.subtract(term)
	const ans = intermediate.simplify(Expression.simplifyOptions.basicClean)
	return { ...state, equation, term, termAbs, intermediate, ans }
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