import { sample, getRandomNumber, getRandomBoolean, getRandomInteger } from '@step-wise/js-utils'
import { and } from '@step-wise/skill-setup'
import { type Equation, asExpression, asEquation, equationComparisons } from '@step-wise/cas'
import { buildStepExercise, stepsToSetup } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'

const variableSet = ['α', 'β', 'γ']

export default buildStepExercise({
	metaData: {
		skill: 'calculateTriangle',
		...stepsToSetup([undefined, undefined, undefined, and('solveLinearEquation', 'applySineCosineTangent')]),
		compare: { equation: (input: Equation, correct: Equation) => equationComparisons.equivalent(input, correct) },
	},

	generateState() {
		// Determine sides and check the triangle inequality.
		let a, b, c
		do {
			a = getRandomInteger(2, 12)
			b = getRandomInteger(2, 12)
			c = getRandomInteger(2, 12)
		} while (a + b <= c || a + c <= b || b + c <= a)

		// Assemble the state.
		return { α: asExpression(sample(variableSet)), a: asExpression(a), b: asExpression(b), c: asExpression(c), rotation: getRandomNumber(0, 2 * Math.PI), reflection: getRandomBoolean() }
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
		const intermediateEquation = asEquation('cos(α) = (b^2 + c^2 - a^2)/(2*b*c)', undefined, { degrees: true }).substitute(variables).combine()
		α = intermediateEquation.right.arccos()
		return { ...state, variables, rule, equationRaw, equation, numSolutions, intermediateEquation, α }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compare('rule', data)
			case 2: return compare('equation', data)
			case 3: return compare('numSolutions', data)
			case 4: return compare('α', data)
			default: return compare(['numSolutions', 'α'], data)
		}
	},
})
