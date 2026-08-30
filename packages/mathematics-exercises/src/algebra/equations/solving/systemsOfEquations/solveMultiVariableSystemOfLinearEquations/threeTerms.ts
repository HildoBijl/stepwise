import { sample, randomInteger } from '@step-wise/js-utils'
import { and } from '@step-wise/skill-setup'
import { Expression, asExpression, asEquation, expressionComparisons, expressionChecks, equationComparisons } from '@step-wise/cas'
import { compareInputs } from '@step-wise/exercise-grading'

import { buildStepExercise, createStepExerciseMetadata } from '#mathematicsExerciseBuilding'
import { selectRandomVariables, selectExpressionParameters } from '#generationTools'

// ax + by + cz = d.
// ex + fy + gz = h.
const availableVariableSets = [['a', 'b', 'c'], ['x', 'y', 'z'], ['p', 'q', 'r']]
const usedVariables = ['x', 'y', 'z']
const constants = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']

export default buildStepExercise({
	metadata: {
		skill: 'solveMultiVariableSystemOfLinearEquations',
		...createStepExerciseMetadata(['solveMultiVariableLinearEquation', 'substituteAnExpression', 'solveMultiVariableLinearEquation', and('substituteAnExpression', 'simplifyFractionOfFractionSumsWithMultipleVariables')]),
		comparisons: {
			eq1Solution: expressionComparisons.areEquivalent,
			eq2Substituted: equationComparisons.areEquivalent,
			x: (input: Expression, correct: Expression) => expressionComparisons.areEquivalent(input, correct) && !expressionChecks.hasFractionWithinFraction(input),
			y: (input: Expression, correct: Expression) => expressionComparisons.areEquivalent(input, correct) && !expressionChecks.hasFractionWithinFraction(input),
		},
	},

	generateParameters() {
		const variableSet = sample(availableVariableSets)
		let a = 0, b = 0, e = 0, f = 0

		// On a non-invertible system, redo the generation.
		for (let attempt = 0; attempt < 100; attempt++) {
			a = randomInteger(-6, 6, { exclude: [0, 1] })
			b = randomInteger(-6, 6, { exclude: [0, 1] })
			e = randomInteger(-6, 6, { exclude: [0, 1] })
			f = randomInteger(-6, 6, { exclude: [0, 1] })
			if (a * f - b * e !== 0) break
		}
		if (a * f - b * e === 0) throw new Error('Failed to generate an invertible multi-variable linear system after 100 attempts.')

		const c = randomInteger(-6, 6, { exclude: [0, 1] })
		const d = randomInteger(-16, 16)
		const g = randomInteger(-6, 6, { exclude: [0, 1] })
		const h = randomInteger(-16, 16)
		return { ...selectRandomVariables(variableSet, usedVariables), a, b, c, d, e, f, g, h }
	},

	getSolution(parameters) {
		// Set up the equations.
		const variables = selectExpressionParameters(parameters, usedVariables, constants)
		const eq1 = asEquation('ax + by + cz = d', { interpretEAsConstant: false }).substitute(variables).removeTrivial()
		const eq2 = asEquation('ex + fy + gz = h', { interpretEAsConstant: false }).substitute(variables).removeTrivial()

		// Solve it step by step.
		const eq1Solution = asExpression('(d - by - cz)/a', { interpretEAsConstant: false }).substitute(variables).normalize()
		const eq2Substituted = eq2.substitute(variables.x, eq1Solution)
		const eq2SubstitutedStep1 = asEquation('e*(d - by - cz) + afy + agz = ah', { interpretEAsConstant: false }).substitute(variables).cancel()
		const eq2SubstitutedStep2 = asEquation('ed - eby - ecz + afy + agz = ah', { interpretEAsConstant: false }).substitute(variables).cancel()
		const eq2SubstitutedStep3 = asEquation('-eby + afy = ah - ed + ecz - agz', { interpretEAsConstant: false }).substitute(variables).cancel()
		const eq2SubstitutedStep4 = eq2SubstitutedStep3.combine()
		const y = asExpression('(ah - ed + ecz - agz)/(-eb + af)', { interpretEAsConstant: false }).substitute(variables).normalize()
		const xRaw = eq1Solution.substitute(variables.y, y)
		const x = xRaw.normalize()

		// Find the solution.
		return { ...parameters, variables, eq1, eq2, eq1Solution, eq2Substituted, eq2SubstitutedStep1, eq2SubstitutedStep2, eq2SubstitutedStep3, eq2SubstitutedStep4, x, xRaw, y }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compareInputs('eq1Solution', data)
			case 2: return compareInputs('eq2Substituted', data)
			case 3: return compareInputs('y', data)
			case 4: return compareInputs('x', data)
			default: return compareInputs(['x', 'y'], data)
		}
	},
})
