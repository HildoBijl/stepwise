import { sample, randomInteger } from '@step-wise/js-utils'
import { and } from '@step-wise/skill-setup'
import { Expression, asExpression, asEquation, expressionComparisons, expressionChecks, equationComparisons } from '@step-wise/cas'
import { compareInputs } from '@step-wise/exercise-grading'

import { buildStepExercise, createStepExerciseMetadata } from '#mathematicsExerciseBuilding'
import { selectRandomVariables, selectExpressionParameters } from '#generationTools'

// ax + wy = b.
// zx + cy = d.
const availableVariableSets = [['a', 'b', 'c', 'd'], ['w', 'x', 'y', 'z'], ['p', 'q', 'r', 's']]
const usedVariables = ['w', 'x', 'y', 'z']
const constants = ['a', 'b', 'c', 'd']

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
		const a = randomInteger(-6, 6, { exclude: [0, 1] })
		const b = randomInteger(-16, 16)
		const c = randomInteger(-6, 6, { exclude: [0, 1] })
		const d = randomInteger(-16, 16)
		return { ...selectRandomVariables(variableSet, usedVariables), a, b, c, d }
	},

	getSolution(parameters) {
		// Set up the equations.
		const variables = selectExpressionParameters(parameters, usedVariables, constants)
		const eq1 = asEquation('ax + wy = b').substitute(variables).removeTrivial()
		const eq2 = asEquation('zx + cy = d').substitute(variables).removeTrivial()

		// Solve it step by step.
		const eq1Solution = asExpression('(b - wy)/a').substitute(variables).normalize()
		const eq2Substituted = eq2.substitute(variables.x, eq1Solution)
		const eq2SubstitutedStep1 = asEquation('z*(b - wy) + acy = ad').substitute(variables).cancel()
		const eq2SubstitutedStep2 = asEquation('bz - zwy + acy = ad').substitute(variables).cancel()
		const eq2SubstitutedStep3 = asEquation('-zwy + acy = ad - bz').substitute(variables).cancel()
		const eq2SubstitutedStep4 = asEquation('(-zw + ac)*y = ad - bz').substitute(variables).cancel()
		const y = asExpression('(ad - bz)/(-zw + ac)').substitute(variables).normalize()
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
