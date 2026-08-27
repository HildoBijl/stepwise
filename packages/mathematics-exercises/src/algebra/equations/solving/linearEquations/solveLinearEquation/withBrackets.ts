import { sample, randomInteger, randomBoolean } from '@step-wise/js-utils'
import { type Equation, asExpression, asEquation, expressionComparisons, equationChecks, equationComparisons } from '@step-wise/cas'
import { buildStepExercise, createStepExerciseMetadata } from '@step-wise/input-exercises'
import { compareInputs } from '@step-wise/exercise-grading'

import { selectExpressionParameters } from '#generationTools'

const { areEqualExceptOrder, areEquivalent } = expressionComparisons

// a*(x+b)+e=c*(x+d).
const variableSet = ['x', 'y', 'z']
const usedVariables = ['x']
const constants = ['a', 'b', 'c', 'd', 'e']

export default buildStepExercise({
	metadata: {
		weight: 2,
		skill: 'solveLinearEquation',
		...createStepExerciseMetadata(['expandBrackets', 'moveEquationTerm', 'mergeSimilarTerms', 'solveProductEquation']),
		comparisons: {
			expanded: (input: Equation, correct: Equation) => !equationChecks.hasSumWithinProduct(input) && equationComparisons.areEquivalent(input, correct),
			moved: { compareSide: areEquivalent, allowSideSwitch: true, allowNegatingBothSides: true },
			cleaned: { compareSide: areEqualExceptOrder, allowSideSwitch: true, allowNegatingBothSides: true },
			ans: areEqualExceptOrder,
		},
	},

	generateParameters() {
		const a = randomInteger(-8, 8, { exclude: [-1, 0, 1] })
		const b = randomInteger(-8, 8, { exclude: [0, a, -a] })
		const c = randomInteger(-8, 8, { exclude: [-1, 0, 1, a] })
		const d = randomInteger(-8, 8, { exclude: [0] })
		const e = randomInteger(-8, 8, { exclude: [0] })
		return { x: sample(variableSet), a, b, c, d, e, switchSides: randomBoolean(), bracketsRight: randomBoolean() }
	},

	getSolution(parameters) {
		const { a, b, c, d, e, switchSides, bracketsRight } = parameters
		const variables = selectExpressionParameters(parameters, usedVariables, constants)
		const baseEquation = asEquation(bracketsRight ? 'a*(x+b)+e=c*(x+d)' : 'a*(x+b)+e=c*x+d', { interpretEAsConstant: false }).substitute(variables).removeTrivial()
		const equation = switchSides ? baseEquation.switchSides() : baseEquation.self()
		const baseMoved = asEquation(`a*x-c*x=${bracketsRight ? c * d : d}-(${a * b + e})`).substitute(variables).removeTrivial(['expandMinusSums'])
		const moved = switchSides ? baseMoved.negate().removeTrivial(['expandMinusSums', 'removeDoubleNegatives']) : baseMoved.self()
		const cleaned = moved.combine()
		const factor = asExpression(switchSides ? c - a : a - c)
		const solution = asExpression(`${(bracketsRight ? c * d : d) - (a * b + e)}/${a - c}`)
		const ans = solution.normalize()
		const canCleanSolution = !areEqualExceptOrder(solution, ans)
		const equationInserted = equation.substitute({ [variables.x.toString()]: ans })
		const sideValue = equationInserted.left.normalize()
		return { ...parameters, variables, equation, expanded: equation.combine(['expandProductsOfSums']), moved, cleaned, factor, solution, ans, canCleanSolution, equationInserted, sideValue }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compareInputs('expanded', data)
			case 2: return compareInputs('moved', data)
			case 3: return compareInputs('cleaned', data)
			default: return compareInputs('ans', data)
		}
	},
})
