import { sample, getRandomInteger, getRandomBoolean } from '@step-wise/utils'
import { gcd } from '@step-wise/math-tools'
import { asExpression, asEquation, expressionComparisons } from '@step-wise/cas'
import { buildStepExercise, stepsToSetup } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'

import { selectRandomVariables, filterVariables } from '../../../../../generationTools'

const { onlyOrderChanges, equivalent } = expressionComparisons

// (axy)/(bz) = cz.
const availableVariableSets = [['a', 'b', 'c'], ['x', 'y', 'z'], ['p', 'q', 'r']]
const usedVariables = ['x', 'y', 'z']
const constants = ['a', 'b', 'c']

export default buildStepExercise({
	metaData: {
		skill: 'solveMultiVariableProductEquation',
		...stepsToSetup(['moveEquationFactor', 'simplifyFractionWithVariables', 'checkMultiVariableEquationSolution']),
		compare: {
			isolated: { compareSide: equivalent, allowSwitch: true },
			ans: onlyOrderChanges,
			checkLeft: onlyOrderChanges,
			checkRight: onlyOrderChanges,
		},
	},

	generateState(example) {
		return {
			...selectRandomVariables(sample(availableVariableSets), usedVariables),
			a: example ? 1 : getRandomInteger(-12, 12, [0]),
			b: example ? 1 : getRandomInteger(1, 12, [0]),
			c: getRandomInteger(-12, 12, [0]),
			switchSides: getRandomBoolean(),
		}
	},

	getSolution(state) {
		const { a, b, c, switchSides } = state
		const variables = filterVariables(state, usedVariables, constants)
		const baseEquation = asEquation('(a*x*y)/(b*z) = c*z').substitute(variables).removeTrivial()
		const equation = switchSides ? baseEquation.switch() : baseEquation.self()
		const factor1 = asExpression('b*z').substitute(variables).removeTrivial()
		const factor2 = asExpression('a*y').substitute(variables).removeTrivial()
		const baseIsolated = asEquation('x = (c*z*b*z)/(a*y)').substitute(variables).removeTrivial()
		const isolated = switchSides ? baseIsolated.switch() : baseIsolated.self()
		const isolatedSolution = switchSides ? isolated.left : isolated.right
		const fractionGcd = gcd(a, b * c)
		const canSimplifyFraction = fractionGcd !== 1
		const ans = isolatedSolution.combine()
		const equationWithSolution = equation.substitute({ [variables.x.toString()]: ans })
		const equationWithSolutionCleaned = equationWithSolution.combine()
		const checkLeft = equationWithSolution.left.combine()
		const checkRight = equationWithSolution.right.combine()
		return { ...state, variables, equation, factor1, factor2, isolated, isolatedSolution, canSimplifyFraction, ans, equationWithSolution, equationWithSolutionCleaned, checkLeft, checkRight }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compare('isolated', data)
			case 3: return compare(['checkLeft', 'checkRight'], data)
			default: return compare('ans', data)
		}
	},
})
