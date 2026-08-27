import { sample, randomNumber, randomBoolean, randomInteger } from '@step-wise/js-utils'
import { type Equation, asExpression, asEquation, equationComparisons } from '@step-wise/cas'
import { buildStepExercise, createStepExerciseMetadata } from '@step-wise/input-exercises'
import { compareInputs } from '@step-wise/exercise-grading'

const variableSet = ['x', 'y', 'z']

export default buildStepExercise({
	metadata: {
		skill: 'calculateTriangle',
		...createStepExerciseMetadata([undefined, undefined, undefined, 'solveQuadraticEquation']),
		comparisons: { equation: (input: Equation, correct: Equation) => equationComparisons.areEquivalent(input, correct) },
	},

	generateParameters() {
		return {
			α: asExpression(randomInteger(5, 24, { exclude: [18] }) * 5), // Ensure there is no 90 degree angle.
			a: asExpression(sample(variableSet)),
			b: asExpression(randomInteger(2, 12)),
			c: asExpression(randomInteger(2, 12)),
			rotation: randomNumber(0, 2 * Math.PI),
			reflection: randomBoolean(),
		}
	},

	getSolution(parameters) {
		let { α, a, b, c } = parameters
		const variables = { α, a, b, c }

		// Define solution method data.
		const rule = 1 // Use the cosine rule.
		const equationRaw = asEquation('a^2 = b^2 + c^2 - 2*b*c*cos(α)', undefined, { angleUnit: 'degrees' }).substitute(variables)
		const equation = equationRaw.combine()
		const numSolutions = 1

		// Determine the remaining side a.
		const aRaw = equation.right.sqrt()
		a = aRaw.combine()
		return { ...parameters, variables, rule, equationRaw, equation, numSolutions, aRaw, a }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compareInputs('rule', data)
			case 2: return compareInputs('equation', data)
			case 3: return compareInputs('numSolutions', data)
			case 4: return compareInputs('a', data)
			default: return compareInputs(['numSolutions', 'a'], data)
		}
	},
})
