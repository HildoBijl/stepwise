import { sample, getRandomInteger } from '@step-wise/utils'
import { asExpression, asEquation, expressionComparisons, equationComparisons } from '@step-wise/cas'
import { buildStepExercise, stepsToSetup } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'

import { selectRandomVariables, filterVariables } from '../../../../../generationTools'

// ax + by = c.
// dx + ey = f.
const availableVariableSets = [['a', 'b', 'c'], ['x', 'y', 'z'], ['p', 'q', 'r']]
const usedVariables = ['x', 'y']
const constants = ['a', 'b', 'c', 'd', 'e', 'f']

export default buildStepExercise({
	metaData: {
		skill: 'solveSystemOfLinearEquations',
		...stepsToSetup(['solveMultiVariableLinearEquation', 'substituteAnExpression', 'solveLinearEquation', 'substituteANumber']),
		compare: { eq1Solution: expressionComparisons.equivalent, eq2Substituted: equationComparisons.equivalent, Expression: expressionComparisons.onlyOrderChanges },
	},

	generateState(example) {
		const variableSet = sample(availableVariableSets)
		const x = getRandomInteger(example ? -8 : -12, example ? 8 : 12, [0])
		const y = getRandomInteger(example ? -8 : -12, example ? 8 : 12, [0])
		let a, b, d, e

		// On a non-invertible system, redo the generation.
		do {
			a = getRandomInteger(example ? -8 : -12, example ? 8 : 12, [0])
			b = getRandomInteger(example ? -8 : -12, example ? 8 : 12, [0])
			d = getRandomInteger(example ? -8 : -12, example ? 8 : 12, [0])
			e = getRandomInteger(example ? -8 : -12, example ? 8 : 12, [0])
		} while (a * e - b * d === 0)

		// Set up state.
		const c = a * x + b * y
		const f = d * x + e * y
		return { ...selectRandomVariables(variableSet, usedVariables), a, b, c, d, e, f }
	},

	getSolution(state) {
		// Extract state variables.
		const variables = filterVariables(state, usedVariables, constants)
		const eq1 = asEquation('ax + by = c', { eAsConstant: false }).substitute(variables).removeTrivial()
		const eq2 = asEquation('dx + ey = f', { eAsConstant: false }).substitute(variables).removeTrivial()

		// Solve the steps.
		const eq1Solution = asExpression('(c-b*y)/a', { eAsConstant: false }).substitute(variables).removeTrivial()
		const eq2Substituted = eq2.substitute(variables.x, eq1Solution)
		const eq2SubstitutedStep1 = asEquation('d*(c-b*y)+a*e*y=a*f', { eAsConstant: false }).substitute(variables).removeTrivial()
		const eq2SubstitutedStep2 = asEquation('d*c-d*b*y+a*e*y=a*f', { eAsConstant: false }).substitute(variables).cancel()
		const eq2SubstitutedStep3 = asEquation('-d*b*y+a*e*y=a*f-d*c', { eAsConstant: false }).substitute(variables).combine()
		const eq2SubstitutedStep4 = asExpression('a*f-d*c', { eAsConstant: false }).substitute(variables).cancel().divide(asExpression('a*e-d*b', { eAsConstant: false }).substitute(variables).cancel())

		// Find the solution.
		const { a, b, c, d, e, f } = state
		const x = asExpression((b * f - e * c) / (b * d - a * e), { eAsConstant: false })
		const y = asExpression((a * f - d * c) / (a * e - b * d), { eAsConstant: false })
		return { ...state, variables, eq1, eq2, eq1Solution, eq2Substituted, eq2SubstitutedStep1, eq2SubstitutedStep2, eq2SubstitutedStep3, eq2SubstitutedStep4, x, y }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compare('eq1Solution', data)
			case 2: return compare('eq2Substituted', data)
			case 3: return compare('y', data)
			case 4: return compare('x', data)
			default: return compare(['x', 'y'], data)
		}
	},
})
