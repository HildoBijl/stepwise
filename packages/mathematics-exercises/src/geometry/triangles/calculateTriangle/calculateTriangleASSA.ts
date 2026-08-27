import { epsilon, degreesToRadians, randomNumber, randomBoolean, randomInteger } from '@step-wise/js-utils'
import { type Equation, asExpression, asEquation, equationComparisons } from '@step-wise/cas'
import { buildStepExercise, createStepExerciseMetadata } from '@step-wise/input-exercises'
import { compareInputs, compareInputList } from '@step-wise/exercise-grading'

import { selectRandomVariables } from '#generationTools'

const variableSet = ['α', 'β', 'γ']

export default buildStepExercise({
	metadata: {
		...createStepExerciseMetadata(['calculateTriangle', 'determine2DAngles']),
		comparisons: { equation: (input: Equation, correct: Equation) => equationComparisons.areEquivalent(input, correct) || equationComparisons.areEquivalent(input.invert(), correct) },
	},

	generateParameters() {
		for (let attempt = 0; attempt < 100; attempt++) {
			const α = randomInteger(5, 17) * 5
			const c = randomInteger(6, 12)
			const a = randomInteger(2, c - 1)
			if (a <= c * Math.sin(degreesToRadians(α)) + epsilon) continue
			const variables = selectRandomVariables(variableSet, ['β', 'γ'])
			return { α: asExpression(α), β: variables.β, γ: variables.γ, a: asExpression(a), c: asExpression(c), rotation: randomNumber(0, 2 * Math.PI), reflection: randomBoolean() }
		}
		throw new Error('Failed to generate valid angle-side-side triangle parameters after 100 attempts.')
	},

	getSolution(parameters) {
		const { α, β, γ, a, c } = parameters
		const variables = { α, β, γ, a, c }

		// Determine γ.
		const rule = 0 // Use the sine rule.
		const equation = asEquation('a/sin(α) = c/sin(γ)', undefined, { angleUnit: 'degrees' }).substitute(variables)
		const intermediateEquation = asEquation('sin(γ) = c/a*sin(α)', undefined, { angleUnit: 'degrees' }).substitute(variables).combine()
		const γ1 = intermediateEquation.right.arcsin()
		const γ2 = asExpression(180, undefined, { angleUnit: 'degrees' }).subtract(γ1).combine()
		const numSolutions = 2

		// Determine β.
		const β1 = asExpression(180, undefined, { angleUnit: 'degrees' }).subtract(α).subtract(γ1).combine()
		const β2 = asExpression(180, undefined, { angleUnit: 'degrees' }).subtract(α).subtract(γ2).combine()

		// Determine corresponding b values.
		const b1 = asExpression('c*cos(α) + sqrt((c*cos(α))^2 - (c^2-a^2))', undefined, { angleUnit: 'degrees' }).substitute(variables)
		const b2 = asExpression('c*cos(α) - sqrt((c*cos(α))^2 - (c^2-a^2))', undefined, { angleUnit: 'degrees' }).substitute(variables)
		return { ...parameters, variables, rule, equation, intermediateEquation, γ1, γ2, β1, β2, b1, b2, numSolutions }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compareInputs('numSolutions', data) && compareInputList(['γ1', 'γ2'], data)
			case 2: return compareInputList(['β1', 'β2'], data)
			default: return compareInputs('numSolutions', data) && compareInputList(['β1', 'β2'], data)
		}
	},
})
