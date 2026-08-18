import { sample, randomNumber, randomBoolean, randomInteger } from '@step-wise/js-utils'
import { type Equation, asExpression, asEquation, equationComparisons } from '@step-wise/cas'
import { buildStepExercise, stepsToSetup } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'

const variableSet = ['x', 'y', 'z']

export default buildStepExercise({
	metaData: {
		skill: 'calculateTriangle',
		...stepsToSetup([undefined, undefined, undefined, 'solveQuadraticEquation']),
		compare: { equation: (input: Equation, correct: Equation) => equationComparisons.equivalent(input, correct) },
	},

	generateState() {
		return {
			α: asExpression(randomInteger(5, 24, { exclude: [18] }) * 5), // Ensure there is no 90 degree angle.
			a: asExpression(sample(variableSet)),
			b: asExpression(randomInteger(2, 12)),
			c: asExpression(randomInteger(2, 12)),
			rotation: randomNumber(0, 2 * Math.PI),
			reflection: randomBoolean(),
		}
	},

	getSolution(state) {
		let { α, a, b, c } = state
		const variables = { α, a, b, c }

		// Define solution method data.
		const rule = 1 // Use the cosine rule.
		const equationRaw = asEquation('a^2 = b^2 + c^2 - 2*b*c*cos(α)', undefined, { degrees: true }).substitute(variables)
		const equation = equationRaw.combine()
		const numSolutions = 1

		// Determine the remaining side a.
		const aRaw = equation.right.sqrt()
		a = aRaw.combine()
		return { ...state, variables, rule, equationRaw, equation, numSolutions, aRaw, a }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compare('rule', data)
			case 2: return compare('equation', data)
			case 3: return compare('numSolutions', data)
			case 4: return compare('a', data)
			default: return compare(['numSolutions', 'a'], data)
		}
	},
})
