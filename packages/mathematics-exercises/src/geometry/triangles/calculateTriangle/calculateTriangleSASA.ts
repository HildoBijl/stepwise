import { approximatelyEqual, sample, randomNumber, randomBoolean, randomInteger } from '@step-wise/js-utils'
import { type Expression, asExpression, asEquation } from '@step-wise/cas'
import { buildStepExercise, createStepExerciseMetadata } from '@step-wise/input-exercises'
import { compareInputs } from '@step-wise/exercise-grading'

const sideVariableSet = ['x', 'y', 'z']
const angleVariableSet = ['α', 'β', 'γ']

export default buildStepExercise({
	metadata: {
		...createStepExerciseMetadata(['calculateTriangle', 'calculateTriangle', undefined]),
		comparisons: {
			βRaw: (input: Expression, correct: Expression, { variables, a }: { variables: Record<string, Expression>, a: Expression }) => approximatelyEqual(...[input, correct].map(value => value.substitute(variables.a, a).toNumber()) as [number, number]), // Plug in the value of a and compare numbers. This is the easiest way to allow for alternate solutions.
		},
	},

	generateParameters() {
		const b = randomInteger(3, 12)
		return {
			α: asExpression(randomInteger(5, 24, { exclude: [18] }) * 5), // Ensure there is no 90 degree angle.
			β: asExpression(sample(angleVariableSet)),
			a: asExpression(sample(sideVariableSet)),
			b: asExpression(b),
			c: asExpression(randomInteger(3, 12, { exclude: [b] })), // Don't have a triangle with two equal sides; that's too easy.
			rotation: randomNumber(0, 2 * Math.PI),
			reflection: randomBoolean(),
		}
	},

	getSolution(parameters) {
		let { α, β, a, b, c } = parameters
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
		return { ...parameters, variables, numSolutions, equation1Raw, equation1, aRaw, a, equation2Raw, equation2, intermediateEquation, βRaw, β }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compareInputs(['numSolutions', 'a'], data)
			case 2: return compareInputs('βRaw', data)
			case 3: return compareInputs('β', data)
			default: return compareInputs(['numSolutions', 'β'], data)
		}
	},
})
