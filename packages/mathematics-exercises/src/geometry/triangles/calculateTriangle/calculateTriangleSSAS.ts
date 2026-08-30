import { epsilon, degreesToRadians, sample, randomNumber, randomBoolean, randomInteger } from '@step-wise/js-utils'
import { type Equation, asExpression, asEquation, equationComparisons } from '@step-wise/cas'
import { compareInputs, compareInputList } from '@step-wise/exercise-grading'

import { buildStepExercise, createStepExerciseMetadata } from '#mathematicsExerciseBuilding'

const variableSet = ['x', 'y', 'z']

export default buildStepExercise({
	metadata: {
		skill: 'calculateTriangle',
		...createStepExerciseMetadata([undefined, undefined, undefined, 'solveQuadraticEquation']),
		comparisons: { equation: (input: Equation, correct: Equation) => equationComparisons.areEquivalent(input, correct) },
	},

	generateParameters() {
		for (let attempt = 0; attempt < 100; attempt++) {
			const α = randomInteger(5, 17) * 5
			const c = randomInteger(6, 12)
			const a = randomInteger(2, c - 1)
			if (a <= c * Math.sin(degreesToRadians(α)) + epsilon) continue
			return { α: asExpression(α), a: asExpression(a), b: asExpression(sample(variableSet)), c: asExpression(c), rotation: randomNumber(0, 2 * Math.PI), reflection: randomBoolean() }
		}
		throw new Error('Failed to generate valid side-side-angle triangle parameters after 100 attempts.')
	},

	getSolution(parameters) {
		const { α, a, b, c } = parameters
		const variables = { α, a, b, c }

		// Define solution method data.
		const rule = 1 // Use the cosine rule.
		const equationRaw = asEquation('a^2 = b^2 + c^2 - 2*c*b*cos(α)', undefined, { angleUnit: 'degrees' }).substitute(variables)
		const equation = equationRaw.combine()
		const equationInStandardForm = equation.mapSides(side => side.subtract(equation.left)).switchSides().combine()
		const numSolutions = 2

		// Determine the solution.
		const b1Raw = asExpression('c*cos(α) + sqrt((c*cos(α))^2 - (c^2-a^2))', undefined, { angleUnit: 'degrees' }).substitute(variables)
		const b1 = b1Raw.combine()
		const b2Raw = asExpression('c*cos(α) - sqrt((c*cos(α))^2 - (c^2-a^2))', undefined, { angleUnit: 'degrees' }).substitute(variables)
		const b2 = b2Raw.combine()
		return { ...parameters, variables, rule, equationRaw, equation, equationInStandardForm, numSolutions, b1Raw, b1, b2Raw, b2 }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compareInputs('rule', data)
			case 2: return compareInputs('equation', data)
			case 3: return compareInputs('numSolutions', data)
			case 4: return compareInputList(['b1', 'b2'], data)
			default: return compareInputs('numSolutions', data) && compareInputList(['b1', 'b2'], data)
		}
	},
})
