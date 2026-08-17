import { sample, getRandomInteger } from '@step-wise/js-utils'
import { and } from '@step-wise/skill-setup'
import { Expression, asExpression, asEquation, expressionComparisons, expressionChecks, equationComparisons } from '@step-wise/cas'
import { buildStepExercise, stepsToSetup } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'

import { selectRandomVariables, filterVariables } from '#generationTools'

// ax + by + cz = d.
// ex + fy + gz = h.
const availableVariableSets = [['a', 'b', 'c'], ['x', 'y', 'z'], ['p', 'q', 'r']]
const usedVariables = ['x', 'y', 'z']
const constants = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']

export default buildStepExercise({
	metaData: {
		skill: 'solveMultiVariableSystemOfLinearEquations',
		...stepsToSetup(['solveMultiVariableLinearEquation', 'substituteAnExpression', 'solveMultiVariableLinearEquation', and('substituteAnExpression', 'simplifyFractionOfFractionSumsWithMultipleVariables')]),
		compare: {
			eq1Solution: expressionComparisons.equivalent,
			eq2Substituted: equationComparisons.equivalent,
			x: (input: Expression, correct: Expression) => expressionComparisons.equivalent(input, correct) && !expressionChecks.hasFractionWithinFraction(input),
			y: (input: Expression, correct: Expression) => expressionComparisons.equivalent(input, correct) && !expressionChecks.hasFractionWithinFraction(input),
		},
	},

	generateState() {
		const variableSet = sample(availableVariableSets)
		let a, b, e, f

		// On a non-invertible system, redo the generation.
		do {
			a = getRandomInteger(-6, 6, [0, 1])
			b = getRandomInteger(-6, 6, [0, 1])
			e = getRandomInteger(-6, 6, [0, 1])
			f = getRandomInteger(-6, 6, [0, 1])
		} while (a * f - b * e === 0)

		const c = getRandomInteger(-6, 6, [0, 1])
		const d = getRandomInteger(-16, 16)
		const g = getRandomInteger(-6, 6, [0, 1])
		const h = getRandomInteger(-16, 16)
		return { ...selectRandomVariables(variableSet, usedVariables), a, b, c, d, e, f, g, h }
	},

	getSolution(state) {
		// Set up the equations.
		const variables = filterVariables(state, usedVariables, constants)
		const eq1 = asEquation('ax + by + cz = d', { eAsConstant: false }).substitute(variables).removeTrivial()
		const eq2 = asEquation('ex + fy + gz = h', { eAsConstant: false }).substitute(variables).removeTrivial()

		// Solve it step by step.
		const eq1Solution = asExpression('(d - by - cz)/a', { eAsConstant: false }).substitute(variables).normalize()
		const eq2Substituted = eq2.substitute(variables.x, eq1Solution)
		const eq2SubstitutedStep1 = asEquation('e*(d - by - cz) + afy + agz = ah', { eAsConstant: false }).substitute(variables).cancel()
		const eq2SubstitutedStep2 = asEquation('ed - eby - ecz + afy + agz = ah', { eAsConstant: false }).substitute(variables).cancel()
		const eq2SubstitutedStep3 = asEquation('-eby + afy = ah - ed + ecz - agz', { eAsConstant: false }).substitute(variables).cancel()
		const eq2SubstitutedStep4 = eq2SubstitutedStep3.combine()
		const y = asExpression('(ah - ed + ecz - agz)/(-eb + af)', { eAsConstant: false }).substitute(variables).normalize()
		const xRaw = eq1Solution.substitute(variables.y, y)
		const x = xRaw.normalize()

		// Find the solution.
		return { ...state, variables, eq1, eq2, eq1Solution, eq2Substituted, eq2SubstitutedStep1, eq2SubstitutedStep2, eq2SubstitutedStep3, eq2SubstitutedStep4, x, xRaw, y }
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
