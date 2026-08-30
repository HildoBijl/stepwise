import { sample, randomInteger } from '@step-wise/js-utils'
import { type Expression, asExpression, expressionComparisons, expressionChecks } from '@step-wise/cas'
import { compareInputs } from '@step-wise/exercise-grading'

import { buildStepExercise, createStepExerciseMetadata } from '#mathematicsExerciseBuilding'
import { selectExpressionParameters } from '#generationTools'

const { areEquivalent, areEqualExceptOrder } = expressionComparisons
const { hasPowerWithinPowerBase } = expressionChecks

// ax^b(x^c)^d = ax^(b+cd).
const variableSet = ['x', 'y', 'z']
const usedVariables = ['x']
const constants = ['a', 'b', 'c', 'd']

export default buildStepExercise({
	metadata: {
		skill: 'simplifyProductOfPowers',
		...createStepExerciseMetadata(['rewritePower', 'rewritePower']),
		comparisons: {
			powersReduced: (input: Expression, correct: Expression) => !hasPowerWithinPowerBase(input) && areEquivalent(input, correct),
			ans: areEqualExceptOrder,
		},
	},

	generateParameters(example) {
		const a = randomInteger(example ? 2 : -8, 8, { exclude: [-1, 0, 1] })
		return {
			x: sample(variableSet),
			a,
			b: randomInteger(2, 6),
			c: randomInteger(2, 5),
			d: randomInteger(2, 5),
		}
	},

	getSolution(parameters) {
		const variables = selectExpressionParameters(parameters, usedVariables, constants)
		const expression = asExpression('a*x^b(x^c)^d').substitute(variables).removeTrivial()
		const powersReducedStep = expression.removeTrivial(['flattenNestedPowers'])
		const powersReduced = powersReducedStep.removeTrivial(['combineNumbersInProducts', 'evaluateNumericPowers'])
		const powersMergedStep = powersReduced.removeTrivial(['combineLikeFactors'])
		const ans = powersMergedStep.combine()
		return { ...parameters, variables, expression, powersReducedStep, powersReduced, powersMergedStep, ans }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compareInputs('powersReduced', data)
			default: return compareInputs('ans', data)
		}
	},
})
