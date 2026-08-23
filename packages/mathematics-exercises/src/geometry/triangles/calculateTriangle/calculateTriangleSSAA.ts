import { epsilon, degreesToRadians, sample, randomNumber, randomBoolean, randomInteger } from '@step-wise/js-utils'
import { and } from '@step-wise/skill-setup'
import { type Equation, asExpression, asEquation, equationComparisons } from '@step-wise/cas'
import { buildStepExercise, createStepExerciseMetadata } from '@step-wise/input-exercises'
import { compareInputs, compareInputList } from '@step-wise/exercise-grading'

const variableSet = ['α', 'β', 'γ']

export default buildStepExercise({
	metadata: {
		skill: 'calculateTriangle',
		...createStepExerciseMetadata([undefined, undefined, undefined, and('solveLinearEquation', 'applySineCosineTangent')]),
		compare: { equation: (input: Equation, correct: Equation) => equationComparisons.equivalent(input, correct) || equationComparisons.equivalent(input.invert(), correct) },
	},

	generateParameters() {
		// Generate numbers and ensure that there are two solutions.
		let α, a, c
		do {
			α = randomInteger(5, 17) * 5
			c = randomInteger(6, 12)
			a = randomInteger(2, c - 1)
		} while (a <= c * Math.sin(degreesToRadians(α)) + epsilon)

		// Assemble the parameters.
		return { α: asExpression(α), γ: asExpression(sample(variableSet)), a: asExpression(a), c: asExpression(c), rotation: randomNumber(0, 2 * Math.PI), reflection: randomBoolean() }
	},

	getSolution(parameters) {
		const { α, γ, a, c } = parameters
		const variables = { α, γ, a, c }

		// Determine the solution.
		const rule = 0 // Use the sine rule.
		const equation = asEquation('a/sin(α) = c/sin(γ)', undefined, { degrees: true }).substitute(variables)
		const intermediateEquation = asEquation('sin(γ) = c/a*sin(α)', undefined, { degrees: true }).substitute(variables).combine()
		const γ1 = intermediateEquation.right.arcsin()
		const γ2 = asExpression(180, undefined, { degrees: true }).subtract(γ1).combine()
		const numSolutions = 2

		// Determine corresponding b values.
		const b1 = asExpression('c*cos(α) + sqrt((c*cos(α))^2 - (c^2-a^2))', undefined, { degrees: true }).substitute(variables)
		const b2 = asExpression('c*cos(α) - sqrt((c*cos(α))^2 - (c^2-a^2))', undefined, { degrees: true }).substitute(variables)
		return { ...parameters, variables, rule, equation, intermediateEquation, γ1, γ2, b1, b2, numSolutions }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compareInputs('rule', data)
			case 2: return compareInputs('equation', data)
			case 3: return compareInputs('numSolutions', data)
			case 4: return compareInputList(['γ1', 'γ2'], data)
			default: return compareInputs('numSolutions', data) && compareInputList(['γ1', 'γ2'], data)
		}
	},
})
