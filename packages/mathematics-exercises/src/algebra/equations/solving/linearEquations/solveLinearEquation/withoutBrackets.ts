import { sample, randomInteger } from '@step-wise/js-utils'
import { asExpression, asEquation, expressionComparisons } from '@step-wise/cas'
import { buildStepExercise, createStepExerciseMetadata } from '@step-wise/input-exercises'
import { compareInputs } from '@step-wise/exercise-grading'

import { selectExpressionParameters } from '#generationTools'

const { areEqualExceptOrder, areEquivalent } = expressionComparisons

// a*x+b=c*x+d.
const variableSet = ['x', 'y', 'z']
const usedVariables = ['x']
const constants = ['a', 'b', 'c', 'd']

export default buildStepExercise({
	metadata: {
		skill: 'solveLinearEquation',
		...createStepExerciseMetadata(['moveEquationTerm', 'mergeSimilarTerms', 'solveProductEquation']),
		comparisons: {
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
		return { x: sample(variableSet), a, b, c, d }
	},

	getSolution(parameters) {
		const { a, b, c, d } = parameters
		const variables = selectExpressionParameters(parameters, usedVariables, constants)
		const equation = asEquation('a*x+b=c*x+d').substitute(variables).removeTrivial()
		const moved = asEquation('a*x-c*x=d-b').substitute(variables).removeTrivial()
		const cleaned = moved.combine()
		const factor = asExpression(a - c)
		const solution = asExpression(`${d - b}/${a - c}`)
		const ans = solution.normalize()
		const canCleanSolution = !areEqualExceptOrder(solution, ans)
		const equationInserted = equation.substitute({ [variables.x.toString()]: ans })
		const sideValue = equationInserted.left.normalize()
		return { ...parameters, variables, equation, moved, cleaned, factor, solution, ans, canCleanSolution, equationInserted, sideValue }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compareInputs('moved', data)
			case 2: return compareInputs('cleaned', data)
			default: return compareInputs('ans', data)
		}
	},
})
