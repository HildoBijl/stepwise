const { getRandomInteger, getRandomBoolean } = require('../../../util/random')
const { asExpression, Sum, equationChecks, simplifyOptions } = require('../../../CAS')

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
	// a*F_A + b*F_B + c*F_C = 0, where terms may start on the other side too.
	const getCoefficient = () => getRandomInteger(-12, 12, [0, 1])
	return {
		a: getCoefficient(),
		b: getCoefficient(),
		c: getCoefficient(),
		aLeft: getRandomBoolean(),
		bLeft: getRandomBoolean(),
		cLeft: getRandomBoolean(),
		move: getRandomInteger(0, 2), // Do we move (0) a, (1) b or (2) c?
	}
}

function getTerms({ a, b, c }) {
	return {
		FA: asExpression('aF_A').substitute('a', a),
		FB: asExpression('bF_B').substitute('b', b),
		FC: asExpression('cF_C').substitute('c', c),
	}
}

function getEquation(state) {
	const { aLeft, bLeft, cLeft } = state
	const { FA, FB, FC } = getTerms(state)

	return new Equation({
		left: new Sum(aLeft ? FA : 0, bLeft ? FB : 0, cLeft ? FC : 0),
		right: new Sum(aLeft ? 0 : FA, bLeft ? 0 : FB, cLeft ? 0 : FC),
	}).removeUseless()
}

function getCorrect(state) {
	const { a, b, c, aLeft, bLeft, cLeft, move } = state

	// Determine starting point.
	const equation = getEquation(state)

	// Determine what to move.
	const { FA, FB, FC } = getTerms(state)
	const term = [FA, FB, FC][move]
	const intermediate = equation.subtract(term)

	// Determine data for displaying solutions.
	const positive = [a > 0, b > 0, c > 0][move]
	const left = [aLeft, bLeft, cLeft][move]
	const termAbs = positive ? term : term.applyMinus()

	// Determine the answer.
	const ans = intermediate.simplify(simplifyOptions.basicClean)

	return { ...state, equation, term, termAbs, positive, left, intermediate, ans }
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