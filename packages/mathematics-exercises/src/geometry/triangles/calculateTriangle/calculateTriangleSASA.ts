import { approximatelyEqual, sample, getRandomNumber, getRandomBoolean, getRandomInteger } from '@step-wise/js-utils'
import { type Expression, asExpression, asEquation } from '@step-wise/cas'
import { buildStepExercise, stepsToSetup } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'

const sideVariableSet = ['x', 'y', 'z']
const angleVariableSet = ['α', 'β', 'γ']

export default buildStepExercise({
	metaData: {
		...stepsToSetup(['calculateTriangle', 'calculateTriangle', undefined]),
		compare: {
			βRaw: (input: Expression, correct: Expression, { variables, a }: { variables: Record<string, Expression>, a: Expression }) => approximatelyEqual(...[input, correct].map(value => value.substitute(variables.a, a).toNumber()) as [number, number]), // Plug in the value of a and compare numbers. This is the easiest way to allow for alternate solutions.
		},
	},

	generateState() {
		const b = getRandomInteger(3, 12)
		return {
			α: asExpression(getRandomInteger(5, 24, [18]) * 5), // Ensure there is no 90 degree angle.
			β: asExpression(sample(angleVariableSet)),
			a: asExpression(sample(sideVariableSet)),
			b: asExpression(b),
			c: asExpression(getRandomInteger(3, 12, [b])), // Don't have a triangle with two equal sides; that's too easy.
			rotation: getRandomNumber(0, 2 * Math.PI),
			reflection: getRandomBoolean(),
		}
	},

	getSolution(state) {
		let { α, β, a, b, c } = state
		const variables = { α, β, a, b, c }

		// Determine a through the cosine rule.
		const numSolutions = 1
		const equation1Raw = asEquation('a^2 = b^2 + c^2 - 2*b*c*cos(α)', undefined, { degrees: true }).substitute(variables)
		const equation1 = equation1Raw.combine()
		const aRaw = equation1.right.sqrt()
		a = aRaw.combine()

		// Determine beta through the cosine rule.
		const equation2Raw = asEquation('b^2 = c^2 + a^2 - 2*c*a*cos(β)', undefined, { degrees: true }).substitute(variables)
		const equation2 = equation2Raw.combine()
		const intermediateEquation = asEquation('cos(β) = (c^2 + a^2 - b^2)/(2*c*a)', undefined, { degrees: true }).substitute(variables).combine()
		const βRaw = intermediateEquation.right.arccos()
		β = asExpression('acos((c-b*cos(α))/a)', undefined, { degrees: true }).substitute({ ...variables, a }).combine()
		return { ...state, variables, numSolutions, equation1Raw, equation1, aRaw, a, equation2Raw, equation2, intermediateEquation, βRaw, β }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compare(['numSolutions', 'a'], data)
			case 2: return compare('βRaw', data)
			case 3: return compare('β', data)
			default: return compare(['numSolutions', 'β'], data)
		}
	},
})
