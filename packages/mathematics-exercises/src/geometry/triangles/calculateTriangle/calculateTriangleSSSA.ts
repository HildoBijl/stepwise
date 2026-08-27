import { sample, randomNumber, randomBoolean, randomInteger } from '@step-wise/js-utils'
import { and } from '@step-wise/skill-setup'
import { type Equation, asExpression, asEquation, equationComparisons } from '@step-wise/cas'
import { buildStepExercise, createStepExerciseMetadata } from '@step-wise/input-exercises'
import { compareInputs } from '@step-wise/exercise-grading'

const variableSet = ['α', 'β', 'γ']

export default buildStepExercise({
	metadata: {
		skill: 'calculateTriangle',
		...createStepExerciseMetadata([undefined, undefined, undefined, and('solveLinearEquation', 'applySineCosineTangent')]),
		comparisons: { equation: (input: Equation, correct: Equation) => equationComparisons.areEquivalent(input, correct) },
	},

	generateParameters() {
		for (let attempt = 0; attempt < 100; attempt++) {
			const a = randomInteger(2, 12)
			const b = randomInteger(2, 12)
			const c = randomInteger(2, 12)
			if (a + b <= c || a + c <= b || b + c <= a) continue
			return { α: asExpression(sample(variableSet)), a: asExpression(a), b: asExpression(b), c: asExpression(c), rotation: randomNumber(0, 2 * Math.PI), reflection: randomBoolean() }
		}
		throw new Error('Failed to generate valid side-side-side triangle parameters after 100 attempts.')
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
		const intermediateEquation = asEquation('cos(α) = (b^2 + c^2 - a^2)/(2*b*c)', undefined, { angleUnit: 'degrees' }).substitute(variables).combine()
		α = intermediateEquation.right.arccos()
		return { ...parameters, variables, rule, equationRaw, equation, numSolutions, intermediateEquation, α }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compareInputs('rule', data)
			case 2: return compareInputs('equation', data)
			case 3: return compareInputs('numSolutions', data)
			case 4: return compareInputs('α', data)
			default: return compareInputs(['numSolutions', 'α'], data)
		}
	},
})
