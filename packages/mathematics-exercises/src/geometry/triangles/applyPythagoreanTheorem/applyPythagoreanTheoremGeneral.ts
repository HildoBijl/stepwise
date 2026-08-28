import { sample, randomNumber, randomBoolean, randomInteger } from '@step-wise/js-utils'
import { asExpression, asEquation, expressionComparisons, equationComparisons } from '@step-wise/cas'
import { buildStepExercise, createStepExerciseMetadata } from '@step-wise/input-exercises'
import { compareInputs } from '@step-wise/exercise-grading'

const pythagoreanTriplets = [[3, 4, 5], [5, 12, 13], [6, 8, 10], [7, 24, 25], [8, 15, 17], [9, 12, 15], [10, 24, 26]]
const variableSet = ['x', 'y', 'z']

export default buildStepExercise({
	metadata: {
		skill: 'applyPythagoreanTheorem',
		...createStepExerciseMetadata([undefined, undefined, undefined]),
		comparisons: {
			Expression: expressionComparisons.haveEqualNumericValue,
			Equation: equationComparisons.areEquivalent,
		},
	},

	generateParameters() {
		const toFind = randomInteger(0, 2) // Find a, b or c?
		const usePythagoreanTriplet = randomBoolean() // Use a predefined triplet?
		for (let attempt = 0; attempt < 100; attempt++) {
			const triplet = usePythagoreanTriplet ? sample(pythagoreanTriplets) : [
				randomInteger(1, 10), // a
				randomInteger(1, 10), // b
				randomInteger(1, 12), // c
			]
			if ((toFind === 0 && triplet[1] >= triplet[2]) || (toFind === 1 && triplet[0] >= triplet[2])) continue
			const x = asExpression(sample(variableSet))
			return {
				a: toFind === 0 ? x : asExpression(triplet[0]),
				b: toFind === 1 ? x : asExpression(triplet[1]),
				c: toFind === 2 ? x : asExpression(triplet[2]),
				rotation: randomNumber(0, 2 * Math.PI),
				reflection: randomBoolean(),
			}
		}
		throw new Error('Failed to generate valid Pythagorean-theorem parameters after 100 attempts.')
	},

	getSolution(parameters) {
		// Determine the equation.
		let { a, b, c } = parameters
		const equation = asEquation('a^2 + b^2 = c^2').substitute('a', a).substitute('b', b).substitute('c', c)

		// Determine the solution.
		let toFind, ansSquared
		if (!a.isNumeric()) {
			toFind = 0
			ansSquared = asExpression('c^2 - b^2').substitute('b', b).substitute('c', c)
		} else if (!b.isNumeric()) {
			toFind = 1
			ansSquared = asExpression('c^2 - a^2').substitute('a', a).substitute('c', c)
		} else {
			toFind = 2
			ansSquared = asExpression('a^2 + b^2').substitute('a', a).substitute('b', b)
		}
		const ansSquaredSimplified = ansSquared.combine()
		const ansRaw = ansSquaredSimplified.sqrt()
		const ans = ansRaw.combine()
		const ansCanBeSimplified = !expressionComparisons.areExactlyEqual(ans, ansRaw)

		// Define the right variables.
		let x
		if (toFind === 0) {
			x = a
			a = ans
		} else if (toFind === 1) {
			x = b
			b = ans
		} else {
			x = c
			c = ans
		}
		return { ...parameters, toFind, a, b, c, x, equation, ansSquared, ansSquaredSimplified, ansRaw, ans, ansCanBeSimplified }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compareInputs('equation', data)
			case 2: return compareInputs('ansSquared', data)
			default: return compareInputs('ans', data)
		}
	},
})
