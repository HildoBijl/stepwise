import { getRandomInteger, getRandomBoolean } from '../../../util/random'
import { getStepExerciseProcessor } from '../util/stepExercise'

import Expression, { getExpressionTypes } from '../../../inputTypes/Expression'
const { Sum } = getExpressionTypes()
import Equation from '../../../inputTypes/Equation'
import { asExpression } from '../../../inputTypes/Expression/interpreter/fromString'

export const data = {
	skill: 'moveATerm',
	steps: [null, null],
	equalityOptions: {
		default: {
			expression: Expression.equalityLevels.onlyOrderChanges,
			equation: Equation.equalityLevels.keepSides,
		}
	},
}

export function generateState() {
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

export function getEquation(state) {
	const { aLeft, bLeft, cLeft } = state
	const { FA, FB, FC } = getTerms(state)

	return new Equation({
		left: new Sum(aLeft ? FA : 0, bLeft ? FB : 0, cLeft ? FC : 0),
		right: new Sum(aLeft ? 0 : FA, bLeft ? 0 : FB, cLeft ? 0 : FC),
	}).simplify(Expression.simplifyOptions.removeUseless)
}

export function getCorrect(state) {
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
	const ans = intermediate.simplify(Expression.simplifyOptions.basicClean)

	return { ...state, equation, term, termAbs, positive, left, intermediate, ans }
}

export function checkInput(state, input, step) {
	const { intermediate, ans } = getCorrect(state)
	if (step === 0 || step === 2)
		return ans.equals(input.ans, data.equalityOptions.default)
	if (step === 1)
		return intermediate.equals(input.intermediate, data.equalityOptions.default)
}

export const processAction = getStepExerciseProcessor(checkInput, data)
