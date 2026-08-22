import { sample, randomInteger } from '@step-wise/js-utils'
import { type Expression, asExpression, expressionComparisons, expressionChecks } from '@step-wise/cas'
import { buildStepExercise, createStepExerciseMetadata } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'

import { filterVariables } from '#generationTools'

const { equivalent, onlyOrderChanges } = expressionComparisons
const { hasPowerWithinPowerBase } = expressionChecks

// ax^b(x^c)^d = ax^(b+cd).
const variableSet = ['x', 'y', 'z']
const usedVariables = ['x']
const constants = ['a', 'b', 'c', 'd']

export default buildStepExercise({
	metaData: {
		skill: 'simplifyProductOfPowers',
		...createStepExerciseMetadata(['rewritePower', 'rewritePower']),
		compare: {
			powersReduced: (input: Expression, correct: Expression) => !hasPowerWithinPowerBase(input) && equivalent(input, correct),
			ans: onlyOrderChanges,
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
		const variables = filterVariables(parameters, usedVariables, constants)
		const expression = asExpression('a*x^b(x^c)^d').substitute(variables).removeTrivial()
		const powersReducedStep = expression.removeTrivial(['removePowersWithinPowers'])
		const powersReduced = powersReducedStep.removeTrivial(['mergeProductNumbers', 'reduceNumberPowers'])
		const powersMergedStep = powersReduced.removeTrivial(['mergeProductFactors'])
		const ans = powersMergedStep.combine()
		return { ...parameters, variables, expression, powersReducedStep, powersReduced, powersMergedStep, ans }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compare('powersReduced', data)
			default: return compare('ans', data)
		}
	},
})
