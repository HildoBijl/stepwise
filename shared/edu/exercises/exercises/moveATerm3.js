import { getRandomInteger } from '../../../util/random'
import { getStepExerciseProcessor } from '../util/stepExercise'

import Expression from '../../../inputTypes/Expression'
import Equation from '../../../inputTypes/Equation'
import { asExpression, asEquation } from '../../../inputTypes/Expression/interpreter/fromString'

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

export function getCorrect(state) {
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

export function checkInput(state, input, step) {
	const { intermediate, ans } = getCorrect(state)
	if (step === 0 || step === 2)
		return ans.equals(input.ans, data.equalityOptions.default)
	if (step === 1)
		return intermediate.equals(input.intermediate, data.equalityOptions.default)
}

export default {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	getEquation,
	getCorrect,
	checkInput,
}
