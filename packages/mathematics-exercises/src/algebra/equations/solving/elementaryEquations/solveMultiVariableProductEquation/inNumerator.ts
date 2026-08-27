import { sample, randomInteger, randomBoolean } from '@step-wise/js-utils'
import { gcd } from '@step-wise/math-tools'
import { asExpression, asEquation, expressionComparisons } from '@step-wise/cas'
import { buildStepExercise, createStepExerciseMetadata } from '@step-wise/input-exercises'
import { compareInputs } from '@step-wise/exercise-grading'

import { selectRandomVariables, selectExpressionParameters } from '#generationTools'

const { areEqualExceptOrder, areEquivalent } = expressionComparisons

// (axy)/(bz) = cz.
const availableVariableSets = [['a', 'b', 'c'], ['x', 'y', 'z'], ['p', 'q', 'r']]
const usedVariables = ['x', 'y', 'z']
const constants = ['a', 'b', 'c']

export default buildStepExercise({
	metadata: {
		skill: 'solveMultiVariableProductEquation',
		...createStepExerciseMetadata(['moveEquationFactor', 'simplifyFractionWithVariables', 'checkMultiVariableEquationSolution']),
		comparisons: {
			isolated: { compareSide: areEquivalent, allowSideSwitch: true },
			ans: areEqualExceptOrder,
			checkLeft: areEqualExceptOrder,
			checkRight: areEqualExceptOrder,
		},
	},

	generateParameters(example) {
		return {
			...selectRandomVariables(sample(availableVariableSets), usedVariables),
			a: example ? 1 : randomInteger(-12, 12, { exclude: [0] }),
			b: example ? 1 : randomInteger(1, 12, { exclude: [0] }),
			c: randomInteger(-12, 12, { exclude: [0] }),
			switchSides: randomBoolean(),
		}
	},

	getSolution(parameters) {
		const { a, b, c, switchSides } = parameters
		const variables = selectExpressionParameters(parameters, usedVariables, constants)
		const baseEquation = asEquation('(a*x*y)/(b*z) = c*z').substitute(variables).removeTrivial()
		const equation = switchSides ? baseEquation.switchSides() : baseEquation.self()
		const factor1 = asExpression('b*z').substitute(variables).removeTrivial()
		const factor2 = asExpression('a*y').substitute(variables).removeTrivial()
		const baseIsolated = asEquation('x = (c*z*b*z)/(a*y)').substitute(variables).removeTrivial()
		const isolated = switchSides ? baseIsolated.switchSides() : baseIsolated.self()
		const isolatedSolution = switchSides ? isolated.left : isolated.right
		const fractionGcd = gcd(a, b * c)
		const canSimplifyFraction = fractionGcd !== 1
		const ans = isolatedSolution.combine()
		const equationWithSolution = equation.substitute({ [variables.x.toString()]: ans })
		const equationWithSolutionCleaned = equationWithSolution.combine()
		const checkLeft = equationWithSolution.left.combine()
		const checkRight = equationWithSolution.right.combine()
		return { ...parameters, variables, equation, factor1, factor2, isolated, isolatedSolution, canSimplifyFraction, ans, equationWithSolution, equationWithSolutionCleaned, checkLeft, checkRight }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compareInputs('isolated', data)
			case 3: return compareInputs(['checkLeft', 'checkRight'], data)
			default: return compareInputs('ans', data)
		}
	},
})
