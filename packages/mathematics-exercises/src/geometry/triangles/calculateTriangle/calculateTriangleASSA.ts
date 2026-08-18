import { epsilon, degreesToRadians, getRandomNumber, getRandomBoolean, getRandomInteger } from '@step-wise/js-utils'
import { type Equation, asExpression, asEquation, equationComparisons } from '@step-wise/cas'
import { buildStepExercise, stepsToSetup } from '@step-wise/input-exercises'
import { compare, compareList } from '@step-wise/exercise-grading'

import { selectRandomVariables } from '#generationTools'

const variableSet = ['α', 'β', 'γ']

export default buildStepExercise({
	metaData: {
		...stepsToSetup(['calculateTriangle', 'determine2DAngles']),
		compare: { equation: (input: Equation, correct: Equation) => equationComparisons.equivalent(input, correct) || equationComparisons.equivalent(input.invert(), correct) },
	},

	generateState() {
		// Generate numbers and ensure that there are two solutions.
		let α, a, c
		do {
			α = getRandomInteger(5, 17) * 5
			c = getRandomInteger(6, 12)
			a = getRandomInteger(2, c - 1)
		} while (a <= c * Math.sin(degreesToRadians(α)) + epsilon)

		// Assemble the state.
		const variables = selectRandomVariables(variableSet, ['β', 'γ'])
		return { α: asExpression(α), β: variables.β, γ: variables.γ, a: asExpression(a), c: asExpression(c), rotation: getRandomNumber(0, 2 * Math.PI), reflection: getRandomBoolean() }
	},

	getSolution(state) {
		const { α, β, γ, a, c } = state
		const variables = { α, β, γ, a, c }

		// Determine γ.
		const rule = 0 // Use the sine rule.
		const equation = asEquation('a/sin(α) = c/sin(γ)', undefined, { degrees: true }).substitute(variables)
		const intermediateEquation = asEquation('sin(γ) = c/a*sin(α)', undefined, { degrees: true }).substitute(variables).combine()
		const γ1 = intermediateEquation.right.arcsin()
		const γ2 = asExpression(180, undefined, { degrees: true }).subtract(γ1).combine()
		const numSolutions = 2

		// Determine β.
		const β1 = asExpression(180, undefined, { degrees: true }).subtract(α).subtract(γ1).combine()
		const β2 = asExpression(180, undefined, { degrees: true }).subtract(α).subtract(γ2).combine()

		// Determine corresponding b values.
		const b1 = asExpression('c*cos(α) + sqrt((c*cos(α))^2 - (c^2-a^2))', undefined, { degrees: true }).substitute(variables)
		const b2 = asExpression('c*cos(α) - sqrt((c*cos(α))^2 - (c^2-a^2))', undefined, { degrees: true }).substitute(variables)
		return { ...state, variables, rule, equation, intermediateEquation, γ1, γ2, β1, β2, b1, b2, numSolutions }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compare('numSolutions', data) && compareList(['γ1', 'γ2'], data)
			case 2: return compareList(['β1', 'β2'], data)
			default: return compare('numSolutions', data) && compareList(['β1', 'β2'], data)
		}
	},
})
