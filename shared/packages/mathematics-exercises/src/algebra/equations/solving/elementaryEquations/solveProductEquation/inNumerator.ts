import { sample, getRandomInteger, getRandomBoolean } from '@step-wise/utils'
import { gcd } from '@step-wise/math-tools'
import { asEquation, expressionComparisons } from '@step-wise/cas'
import { buildStepExercise, stepsToSetup } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'

import { filterVariables } from '#generationTools'

const { onlyOrderChanges, equivalent } = expressionComparisons

// a*x/b = c/d.
const variableSet = ['x', 'y', 'z']
const usedVariables = ['x']
const constants = ['a', 'b', 'c', 'd']

export default buildStepExercise({
	metaData: {
		skill: 'solveProductEquation',
		...stepsToSetup(['moveEquationFactor', 'simplifyFraction', 'checkEquationSolution']),
		compare: {
			isolated: { compareSide: equivalent, allowSwitch: true },
			ans: onlyOrderChanges,
			checkLeft: onlyOrderChanges,
			checkRight: onlyOrderChanges,
		},
	},

	generateState(example) {
		const a = getRandomInteger(-8, 8, [-1, 0, 1])
		const b = example ? 1 : getRandomInteger(-8, 8, [-1, 0, 1, a, -a])
		const c = getRandomInteger(-8, 8, [-1, 0, 1, a, -a, b, -b])
		const d = getRandomInteger(-8, 8, [-1, 0, 1, a, -a, b, -b, c, -c])
		return {
			x: sample(variableSet),
			a, b, c, d,
			switchSides: getRandomBoolean(), // Do we switch equation sides?
		}
	},

	getSolution(state) {
		const { switchSides } = state
		const variables = filterVariables(state, usedVariables, constants)
		const baseEquation = asEquation('ax/b=c/d').substitute(variables).removeTrivial()
		const equation = switchSides ? baseEquation.switch() : baseEquation.self()
		const baseIsolated = asEquation('x = (cb)/(da)').substitute(variables).flatten()
		const isolated = switchSides ? baseIsolated.switch() : baseIsolated.self()
		const isolatedSolution = switchSides ? isolated.left : isolated.right
		const isolatedSolutionSimplified = isolatedSolution.mergeNumbers(['mergeFractionMinuses'], ['mergeFractionNumbers'])
		const fractionGcd = gcd(isolatedSolutionSimplified.numerator.toNumber(), isolatedSolutionSimplified.denominator.toNumber())
		const canSimplifyFraction = fractionGcd !== 1
		const ans = isolatedSolution.normalize()
		const equationWithSolution = equation.substitute({ [state.x]: ans })
		const checkLeft = equationWithSolution.left.normalize()
		const checkRight = equationWithSolution.right.normalize()
		const canNumberSideBeSimplified = !onlyOrderChanges(switchSides ? equationWithSolution.left : equationWithSolution.right, switchSides ? checkLeft : checkRight)
		return { ...state, variables, equation, isolated, isolatedSolution, isolatedSolutionSimplified, fractionGcd, canSimplifyFraction, ans, equationWithSolution, checkLeft, checkRight, canNumberSideBeSimplified }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compare('isolated', data)
			case 3: return compare(['checkLeft', 'checkRight'], data)
			default: return compare('ans', data)
		}
	},
})
