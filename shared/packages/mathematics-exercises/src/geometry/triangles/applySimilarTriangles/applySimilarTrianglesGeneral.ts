import { sample, getRandomNumber, getRandomBoolean, getRandomInteger } from '@step-wise/utils'
import { type Equation, asExpression, asEquation, expressionComparisons, equationComparisons } from '@step-wise/cas'
import { buildStepExercise, stepsToSetup } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'

import { selectRandomVariables } from '#generationTools'

const sampleTriangles = [[1, 1, 'sqrt(2)'], [1, 'sqrt(3)', 2], [1, 2, 'sqrt(5)'], [3, 4, 5], [5, 12, 13]]
const availableVariableSets = [['a', 'b', 'c'], ['x', 'y', 'z'], ['p', 'q', 'r']]
const usedVariables = ['a', 'b', 'c']

export default buildStepExercise({
	metaData: {
		skill: 'applySimilarTriangles',
		...stepsToSetup([undefined, undefined, undefined, undefined]),
		compare: {
			Equation: (input: Equation, correct: Equation) => equationComparisons.equivalent(input, correct) || equationComparisons.equivalent(input.invert(), correct),
			Expression: expressionComparisons.equivalent,
		},
	},

	generateState() {
		// Generate random data.
		const given = getRandomInteger(0, 2) // Is a, b or c already given?
		const triangle = sample(sampleTriangles).map(expression => asExpression(expression))
		const variableSet = sample(availableVariableSets)
		const variables = selectRandomVariables(variableSet, usedVariables)

		// Gather all data into a state.
		return {
			a: given === 0 ? asExpression(getRandomInteger(2, 20)) : variables.a,
			b: given === 1 ? asExpression(getRandomInteger(2, 20)) : variables.b,
			c: given === 2 ? asExpression(getRandomInteger(2, 30)) : variables.c,
			La: triangle[0],
			Lb: triangle[1],
			rotation: getRandomNumber(0, 2 * Math.PI),
			reflection: getRandomBoolean(),
		}
	},

	getSolution(state) {
		// Extract all the variables.
		let { a, b, c, La, Lb } = state
		const Lc = asExpression('sqrt(L_a^2 + L_b^2)').substitute({ L_a: La, L_b: Lb }).combine()
		const variables = { a, b, c, L_a: La, L_b: Lb, L_c: Lc }

		// Determine the solution.
		let given, equation1, equation2, ans1Raw, ans2Raw
		if (a.isNumeric()) {
			given = 0
			equation1 = asEquation('a/L_a=b/L_b').substitute(variables)
			equation2 = asEquation('a/L_a=c/L_c').substitute(variables)
			ans1Raw = asExpression('a*(L_b/L_a)').substitute(variables)
			ans2Raw = asExpression('a*(L_c/L_a)').substitute(variables)
		} else if (b.isNumeric()) {
			given = 1
			equation1 = asEquation('a/L_a=b/L_b').substitute(variables)
			equation2 = asEquation('b/L_b=c/L_c').substitute(variables)
			ans1Raw = asExpression('b*(L_a/L_b)').substitute(variables)
			ans2Raw = asExpression('b*(L_c/L_b)').substitute(variables)
		} else {
			given = 2
			equation1 = asEquation('a/L_a=c/L_c').substitute(variables)
			equation2 = asEquation('b/L_b=c/L_c').substitute(variables)
			ans1Raw = asExpression('c*(L_a/L_c)').substitute(variables)
			ans2Raw = asExpression('c*(L_b/L_c)').substitute(variables)
		}
		const ans1 = ans1Raw.combine()
		const ans2 = ans2Raw.combine()

		// Define the right variables.
		let x, y, z
		if (given === 0) {
			x = b
			y = c
			z = a
			b = ans1
			c = ans2
		} else if (given === 1) {
			x = a
			y = c
			z = b
			a = ans1
			c = ans2
		} else {
			x = a
			y = b
			z = c
			a = ans1
			b = ans2
		}
		return { ...state, given, a, b, c, La, Lb, Lc, x, y, z, equation1, equation2, ans1Raw, ans2Raw, ans1, ans2 }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compare('equation1', data)
			case 2: return compare('ans1', data)
			case 3: return compare('equation2', data)
			case 4: return compare('ans2', data)
			default: return compare(['ans1', 'ans2'], data)
		}
	},
})
