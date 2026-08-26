import { sample, randomInteger, randomBoolean } from '@step-wise/js-utils'
import { gcd } from '@step-wise/math-tools'
import { asEquation, expressionComparisons } from '@step-wise/cas'
import { buildStepExercise, createStepExerciseMetadata } from '@step-wise/input-exercises'
import { compareInputs } from '@step-wise/exercise-grading'

import { selectExpressionParameters } from '#generationTools'

const { onlyOrderChanges, equivalent } = expressionComparisons

// a/b = c/(d*x).
const variableSet = ['x', 'y', 'z']
const usedVariables = ['x']
const constants = ['a', 'b', 'c', 'd']

export default buildStepExercise({
	metadata: {
		skill: 'solveProductEquation',
		...createStepExerciseMetadata(['moveEquationFactor', 'moveEquationFactor', 'simplifyFraction', 'checkEquationSolution']),
		comparisons: {
			moved: { compareSide: equivalent, allowSwitch: true },
			isolated: { compareSide: equivalent, allowSwitch: true },
			ans: onlyOrderChanges,
			checkLeft: onlyOrderChanges,
			checkRight: onlyOrderChanges,
		},
	},

	generateParameters(example) {
		const a = randomInteger(-8, 8, { exclude: [-1, 0, 1] })
		const b = example ? 1 : randomInteger(-8, 8, { exclude: [-1, 0, 1, a, -a] })
		const c = randomInteger(-8, 8, { exclude: [-1, 0, 1, a, -a, b, -b] })
		const d = example ? 1 : randomInteger(-8, 8, { exclude: [-1, 0, 1, a, -a, b, -b, c, -c] })
		return {
			x: sample(variableSet),
			a, b, c, d,
			switchSides: randomBoolean(), // Do we switch equation sides?
		}
	},

	getSolution(parameters) {
		const { switchSides } = parameters
		const variables = selectExpressionParameters(parameters, usedVariables, constants)
		const baseEquation = asEquation('a/b=c/(dx)').substitute(variables).removeTrivial()
		const equation = switchSides ? baseEquation.switch() : baseEquation.self()
		const baseMoved = asEquation('ax/b=c/d').substitute(variables).removeTrivial()
		const moved = switchSides ? baseMoved.switch() : baseMoved.self()
		const baseIsolated = asEquation('x = (cb)/(da)').substitute(variables).flatten()
		const isolated = switchSides ? baseIsolated.switch() : baseIsolated.self()
		const isolatedSolution = switchSides ? isolated.left : isolated.right
		const isolatedSolutionSimplified = isolatedSolution.mergeNumbers(['mergeFractionMinuses'], ['mergeFractionNumbers'])
		const fractionGcd = gcd(isolatedSolutionSimplified.numerator.toNumber(), isolatedSolutionSimplified.denominator.toNumber())
		const canSimplifyFraction = fractionGcd !== 1
		const ans = isolatedSolution.normalize()
		const equationWithSolution = equation.substitute({ [parameters.x]: ans })
		const checkLeft = equationWithSolution.left.normalize()
		const checkRight = equationWithSolution.right.normalize()
		const canNumberSideBeSimplified = !onlyOrderChanges(switchSides ? equationWithSolution.right : equationWithSolution.left, switchSides ? checkRight : checkLeft)
		return { ...parameters, variables, equation, moved, isolated, isolatedSolution, isolatedSolutionSimplified, fractionGcd, canSimplifyFraction, ans, equationWithSolution, checkLeft, checkRight, canNumberSideBeSimplified }
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
