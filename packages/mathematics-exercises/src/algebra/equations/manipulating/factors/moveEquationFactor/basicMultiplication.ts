import { sample, getRandomInteger, getRandomBoolean } from '@step-wise/utils'
import { asEquation, expressionComparisons } from '@step-wise/cas'
import { buildStepExercise, stepsToSetup } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'

import { filterVariables } from '#generationTools'

// a = b/x => ax = b.
const variableSet = ['x', 'y', 'z']
const usedVariables = ['x']
const constants = ['a', 'b']

export default buildStepExercise({
	metaData: {
		skill: 'moveEquationFactor',
		...stepsToSetup(['multiplyBothEquationSides', 'cancelFractionFactors']),
		compare: {
			bothSidesChanged: { compareSide: expressionComparisons.equivalent },
			ans: {},
		},
	},

	generateState() {
		const a = getRandomInteger(-8, 8, [-1, 0, 1])
		const b = getRandomInteger(-8, 8, [-1, 0, 1, a, -a])
		return {
			x: sample(variableSet),
			a, b,
			switchSides: getRandomBoolean(), // Do we switch equation sides?
		}
	},

	getSolution(state) {
		const variables = filterVariables(state, usedVariables, constants)
		const factor = variables.x
		const baseEquation = asEquation('a=b/x')
		const equation = (state.switchSides ? baseEquation.switch() : baseEquation.self()).substitute(variables).removeTrivial()
		const bothSidesChanged = equation.multiply(factor).removeTrivial(['mergeFractionProducts'])
		const ans = bothSidesChanged.cancel(['mergeProductFactors', 'cancelFractionFactors'])
		return { ...state, variables, factor, equation, bothSidesChanged, ans }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compare('bothSidesChanged', data)
			default: return compare('ans', data)
		}
	},
})
