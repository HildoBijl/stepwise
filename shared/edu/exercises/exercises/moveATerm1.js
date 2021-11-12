const { getRandomInteger, getRandomBoolean } = require('../../../util/random')
const { asExpression, asEquation, equationChecks, simplifyOptions } = require('../../../CAS')

const { getStepExerciseProcessor } = require('../util/stepExercise')
const { performCheck } = require('../util/check')

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
	const equation = asEquation(switchXY ? 'ay+b=cx' : 'ax+b=cy').substitute('a', a).substitute('b', b).substitute('c', c)
	return switchLeftRight ? equation.flip() : equation
}

function getCorrect(state) {
	const { a, switchXY } = state

	// Get the original equation.
	const equation = getEquation(state)

	// Find the intermediate step.
	const term = asExpression(switchXY ? 'ay' : 'ax').substitute('a', a)
	const termAbs = (a < 0 ? term.applyMinus() : term)
	const intermediate = equation.subtract(term)

	// Simplify to the final solution.
	const ans = intermediate.simplify(simplifyOptions.basicClean)
	return { ...state, equation, term, termAbs, intermediate, ans }
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