import { sample, randomInteger } from '@step-wise/js-utils'
import { asExpression, asEquation, expressionComparisons } from '@step-wise/cas'
import { buildStepExercise, createStepExerciseMetadata } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'

import { filterVariables } from '#generationTools'

const { onlyOrderChanges, equivalent } = expressionComparisons

// a*x+b=c*x+d.
const variableSet = ['x', 'y', 'z']
const usedVariables = ['x']
const constants = ['a', 'b', 'c', 'd']

export default buildStepExercise({
	metaData: {
		skill: 'solveLinearEquation',
		...createStepExerciseMetadata(['moveEquationTerm', 'mergeSimilarTerms', 'solveProductEquation']),
		compare: {
			moved: { compareSide: equivalent, allowSwitch: true, allowMinus: true },
			cleaned: { compareSide: onlyOrderChanges, allowSwitch: true, allowMinus: true },
			ans: onlyOrderChanges,
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
		const variables = filterVariables(parameters, usedVariables, constants)
		const equation = asEquation('a*x+b=c*x+d').substitute(variables).removeTrivial()
		const moved = asEquation('a*x-c*x=d-b').substitute(variables).removeTrivial()
		const cleaned = moved.combine()
		const factor = asExpression(a - c)
		const solution = asExpression(`${d - b}/${a - c}`)
		const ans = solution.normalize()
		const canCleanSolution = !onlyOrderChanges(solution, ans)
		const equationInserted = equation.substitute({ [variables.x.toString()]: ans })
		const sideValue = equationInserted.left.normalize()
		return { ...parameters, variables, equation, moved, cleaned, factor, solution, ans, canCleanSolution, equationInserted, sideValue }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compare('moved', data)
			case 2: return compare('cleaned', data)
			default: return compare('ans', data)
		}
	},
})
