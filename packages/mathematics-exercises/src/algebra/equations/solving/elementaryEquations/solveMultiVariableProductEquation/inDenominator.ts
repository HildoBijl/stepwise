import { sample, randomInteger, randomBoolean } from '@step-wise/js-utils'
import { gcd } from '@step-wise/math-tools'
import { asEquation, expressionComparisons } from '@step-wise/cas'
import { buildStepExercise, createStepExerciseMetadata } from '@step-wise/input-exercises'
import { compareInputs } from '@step-wise/exercise-grading'

import { selectRandomVariables, filterVariables } from '#generationTools'

const { onlyOrderChanges, equivalent } = expressionComparisons

// (ay)/(bx) = cz.
const availableVariableSets = [['a', 'b', 'c'], ['x', 'y', 'z'], ['p', 'q', 'r']]
const usedVariables = ['x', 'y', 'z']
const constants = ['a', 'b', 'c']

export default buildStepExercise({
	metadata: {
		skill: 'solveMultiVariableProductEquation',
		...createStepExerciseMetadata(['moveEquationFactor', 'moveEquationFactor', 'simplifyFractionWithVariables', 'checkMultiVariableEquationSolution']),
		compare: {
			moved: { compareSide: equivalent, allowSwitch: true },
			isolated: { compareSide: equivalent, allowSwitch: true },
			ans: onlyOrderChanges,
			checkLeft: onlyOrderChanges,
			checkRight: onlyOrderChanges,
		},
	},

	generateParameters(example) {
		return {
			...selectRandomVariables(sample(availableVariableSets), usedVariables),
			a: randomInteger(-12, 12, { exclude: [0] }),
			b: example ? 1 : randomInteger(1, 12, { exclude: [0] }),
			c: randomInteger(-12, 12, { exclude: [0] }),
			switchSides: randomBoolean(),
		}
	},

	getSolution(parameters) {
		const { a, b, c, switchSides } = parameters
		const variables = filterVariables(parameters, usedVariables, constants)
		const baseEquation = asEquation('(a*y)/(b*x) = c*z').substitute(variables).removeTrivial()
		const equation = switchSides ? baseEquation.switch() : baseEquation.self()
		const factor = switchSides ? equation.left : equation.right
		const baseMoved = asEquation('(a*y)/b = c*z*x').substitute(variables).removeTrivial()
		const moved = switchSides ? baseMoved.switch() : baseMoved.self()
		const baseIsolated = asEquation('(a*y)/(b*c*z) = x').substitute(variables).removeTrivial()
		const isolated = switchSides ? baseIsolated.switch() : baseIsolated.self()
		const isolatedSolution = switchSides ? isolated.right : isolated.left
		const fractionGcd = gcd(a, b * c)
		const canSimplifyFraction = fractionGcd !== 1
		const ans = isolatedSolution.combine()
		const equationWithSolution = equation.substitute({ [variables.x.toString()]: ans })
		const equationWithSolutionCleaned = equationWithSolution.combine()
		const checkLeft = equationWithSolution.left.combine()
		const checkRight = equationWithSolution.right.combine()
		return { ...parameters, variables, equation, factor, moved, isolated, isolatedSolution, fractionGcd, canSimplifyFraction, ans, equationWithSolution, equationWithSolutionCleaned, checkLeft, checkRight }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compareInputs('moved', data)
			case 2: return compareInputs('isolated', data)
			case 4: return compareInputs(['checkLeft', 'checkRight'], data)
			default: return compareInputs('ans', data)
		}
	},
})
