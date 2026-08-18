import { sample, randomNumber, randomBoolean, randomInteger } from '@step-wise/js-utils'
import { type Equation, asExpression, asEquation, equationComparisons } from '@step-wise/cas'
import { buildStepExercise, stepsToSetup } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'

const variableSet = ['x', 'y', 'z']

export default buildStepExercise({
	metaData: {
		skill: 'calculateTriangle',
		...stepsToSetup(['determine2DAngles', undefined, undefined, undefined, 'solveLinearEquation']),
		compare: { equation: (input: Equation, correct: Equation) => equationComparisons.equivalent(input, correct) || equationComparisons.equivalent(input.invert(), correct) },
	},

	generateState() {
		// Determine the angles and check if they match the conditions.
		let α, β
		do {
			α = randomInteger(5, 12) * 5
			β = randomInteger(5, 24, [18, 18 - α / 5]) * 5 // Ensure there is no 90 degree angle.
		} while (α + β > 155)

		// Gather all data into a state.
		return { α: asExpression(α), β: asExpression(β), a: asExpression(sample(variableSet)), c: asExpression(randomInteger(2, 12)), rotation: randomNumber(0, 2 * Math.PI), reflection: randomBoolean() }
	},

	getSolution(state) {
		let { α, β, a, c } = state
		const variables = { α, β, a, c }

		// Determine gamma.
		const γRaw = asExpression('180-α-β', undefined, { degrees: true }).substitute(variables)
		const γ = γRaw.combine()
		const allVariables = { ...variables, γ }

		// Define solution method data.
		const rule = 0 // Use the sine rule.
		const equation = asEquation('a/sin(α)=c/sin(γ)', undefined, { degrees: true }).substitute(allVariables)
		const numSolutions = 1

		// Determine a and b.
		const aRaw = asExpression('c*sin(α)/sin(γ)', undefined, { degrees: true }).substitute(allVariables)
		a = aRaw.combine()
		const bRaw = asExpression('c*sin(β)/sin(γ)', undefined, { degrees: true }).substitute(allVariables)
		const b = bRaw.combine()
		return { ...state, variables: allVariables, γRaw, γ, rule, numSolutions, equation, aRaw, a, bRaw, b }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compare('γ', data)
			case 2: return compare('rule', data)
			case 3: return compare('equation', data)
			case 4: return compare('numSolutions', data)
			case 5: return compare('a', data)
			default: return compare(['numSolutions', 'a'], data)
		}
	},
})
