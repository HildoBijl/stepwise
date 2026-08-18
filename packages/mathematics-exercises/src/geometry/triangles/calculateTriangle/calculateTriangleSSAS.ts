import { epsilon, degreesToRadians, sample, getRandomNumber, getRandomBoolean, getRandomInteger } from '@step-wise/js-utils'
import { type Equation, asExpression, asEquation, equationComparisons } from '@step-wise/cas'
import { buildStepExercise, stepsToSetup } from '@step-wise/input-exercises'
import { compare, compareList } from '@step-wise/exercise-grading'

const variableSet = ['x', 'y', 'z']

export default buildStepExercise({
	metaData: {
		skill: 'calculateTriangle',
		...stepsToSetup([undefined, undefined, undefined, 'solveQuadraticEquation']),
		compare: { equation: (input: Equation, correct: Equation) => equationComparisons.equivalent(input, correct) },
	},

	generateState() {
		// Generate numbers and ensure that there are two solutions.
		let α, a, c
		do {
			α = getRandomInteger(5, 17) * 5
			c = getRandomInteger(6, 12)
			a = getRandomInteger(2, c - 1)
		} while (a <= c * Math.sin(degreesToRadians(α)) + epsilon)

		// Assemble the state.
		return { α: asExpression(α), a: asExpression(a), b: asExpression(sample(variableSet)), c: asExpression(c), rotation: getRandomNumber(0, 2 * Math.PI), reflection: getRandomBoolean() }
	},

	getSolution(state) {
		const { α, a, b, c } = state
		const variables = { α, a, b, c }

		// Define solution method data.
		const rule = 1 // Use the cosine rule.
		const equationRaw = asEquation('a^2 = b^2 + c^2 - 2*c*b*cos(α)', undefined, { degrees: true }).substitute(variables)
		const equation = equationRaw.combine()
		const equationInStandardForm = equation.mapSides(side => side.subtract(equation.left)).switch().combine()
		const numSolutions = 2

		// Determine the solution.
		const b1Raw = asExpression('c*cos(α) + sqrt((c*cos(α))^2 - (c^2-a^2))', undefined, { degrees: true }).substitute(variables)
		const b1 = b1Raw.combine()
		const b2Raw = asExpression('c*cos(α) - sqrt((c*cos(α))^2 - (c^2-a^2))', undefined, { degrees: true }).substitute(variables)
		const b2 = b2Raw.combine()
		return { ...state, variables, rule, equationRaw, equation, equationInStandardForm, numSolutions, b1Raw, b1, b2Raw, b2 }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compare('rule', data)
			case 2: return compare('equation', data)
			case 3: return compare('numSolutions', data)
			case 4: return compareList(['b1', 'b2'], data)
			default: return compare('numSolutions', data) && compareList(['b1', 'b2'], data)
		}
	},
})
