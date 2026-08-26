import { sample, randomInteger } from '@step-wise/js-utils'
import { type Equation, type Expression, asExpression, asEquation, expressionComparisons, equationChecks } from '@step-wise/cas'
import { buildStepExercise, createStepExerciseMetadata } from '@step-wise/input-exercises'
import { compareInputs } from '@step-wise/exercise-grading'

import { selectExpressionParameters } from '#generationTools'

const { onlyOrderChanges, equivalent } = expressionComparisons
const { hasVariableInDenominator, hasSumWithinProduct } = equationChecks

// (x+a)/(x+b)=(x+c)/(x+d).
const variableSet = ['x', 'y', 'z']
const usedVariables = ['x']
const constants = ['a', 'b', 'c', 'd']
const factorMovedComparison = { compareSide: equivalent, allowSwitch: true }
const expandedComparison = { compareSide: equivalent, allowSwitch: true }

export default buildStepExercise({
	metadata: {
		skill: 'solveLinearEquationWithFractions',
		...createStepExerciseMetadata(['moveEquationFactor', 'expandDoubleBrackets', 'solveLinearEquation']),
		...{ factorMovedComparison, expandedComparison },
		comparisons: {
			factorMoved: (input: Equation, correct: Equation, { variables }: { variables: Record<string, Expression> }) => !hasVariableInDenominator(input, variables.x) && correct.equals(input, factorMovedComparison),
			expanded: (input: Equation, correct: Equation) => !hasSumWithinProduct(input) && correct.equals(input, expandedComparison),
			ans: onlyOrderChanges,
		},
	},

	generateParameters() {
		const a = randomInteger(-8, 8, { exclude: [0] })
		const b = randomInteger(-8, 8, { exclude: [0, a, -a] })
		const c = randomInteger(-8, 8, { exclude: [0, a, -a, b, -b] })
		const d = randomInteger(-8, 8, { exclude: [0, a, -a, b, -b, c, -c, b + c - a] })
		return { x: sample(variableSet), a, b, c, d }
	},

	getSolution(parameters) {
		const { a, b, c, d } = parameters
		const variables = selectExpressionParameters(parameters, usedVariables, constants)
		const equation = asEquation('(x+a)/(x+b)=(x+c)/(x+d)').substitute(variables).removeTrivial()
		const factorMoved = asEquation('(x+a)(x+d)=(x+c)(x+b)').substitute(variables).removeTrivial()
		const expanded = factorMoved.combine(['expandProductsOfSums'])
		const termMoved = asEquation(`(${a + d})*x - (${b + c})*x = ${c * b}-(${a * d})`).substitute(variables).removeTrivial()
		const cleaned = termMoved.combine()
		const factor = asExpression(a + d - b - c)
		const solution = asExpression(`(${c * b - a * d})/${a + d - b - c}`)
		const ans = solution.combine()
		const canCleanSolution = !onlyOrderChanges(solution, ans)
		const equationInserted = equation.substitute({ [variables.x.toString()]: ans })
		const sideValue = equationInserted.left.normalize()
		return { ...parameters, variables, equation, factorMoved, expanded, termMoved, cleaned, factor, solution, ans, canCleanSolution, equationInserted, sideValue }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compareInputs('factorMoved', data)
			case 2: return compareInputs('expanded', data)
			default: return compareInputs('ans', data)
		}
	},
})
