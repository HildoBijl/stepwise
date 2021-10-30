import { getRandomInteger, getRandomBoolean } from '../../../util/random'
import { getStepExerciseProcessor } from '../util/stepExercise'

// Testing code.
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

export function getCorrect(state) {
	const { a, switchXY } = state

	// Get the original equation.
	const equation = getEquation(state)

	// Find the intermediate step.
	const term = asExpression(switchXY ? 'ay' : 'ax').substitute('a', a)
	const termAbs = (a < 0 ? term.applyMinus() : term)
	const intermediate = equation.subtract(term)

	// Simplify to the final solution.
	const ans = intermediate.simplify(Expression.simplifyOptions.basicClean)
	return { ...state, equation, term, termAbs, intermediate, ans }
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
