import { sample, randomNumber, randomBoolean, randomInteger } from '@step-wise/js-utils'
import { type Equation, type Expression, asExpression, asEquation, expressionComparisons, equationComparisons } from '@step-wise/cas'
import { buildStepExercise, createStepExerciseMetadata } from '@step-wise/input-exercises'
import { compareInputs } from '@step-wise/exercise-grading'

const variableSet = ['α', 'β', 'γ']

export default buildStepExercise({
	metadata: {
		skill: 'applySineCosineTangent',
		...createStepExerciseMetadata([undefined, undefined, undefined]),
		comparisons: { equation: (input: Equation, correct: Equation) => equationComparisons.equivalent(input, correct) },
	},

	generateParameters() {
		// Determine the sides.
		const notGiven = randomInteger(0, 2) // Is a, b or c not given?
		const sides: Partial<Record<'a' | 'b' | 'c', Expression>> = {}
		if (notGiven === 0) {
			const b = randomInteger(2, 10)
			sides.b = asExpression(b)
			sides.c = asExpression(randomInteger(b + 1, 12))
		} else if (notGiven === 1) {
			const a = randomInteger(2, 10)
			sides.a = asExpression(a)
			sides.c = asExpression(randomInteger(a + 1, 12))
		} else {
			sides.a = asExpression(randomInteger(2, 10))
			sides.b = asExpression(randomInteger(2, 10))
		}

		// Gather all data into a parameters.
		return { ...sides, beta: asExpression(sample(variableSet)), rotation: randomNumber(0, 2 * Math.PI), reflection: randomBoolean() }
	},

	getSolution(parameters) {
		// Determine which case we are dealing with.
		let { a, b, c } = parameters
		const notGiven = a === undefined ? 0 : b === undefined ? 1 : 2

		// Set up a variables object for substitutions.
		const variables: Record<string, Expression> = { β: parameters.beta }
		if (a !== undefined) variables.a = a
		if (b !== undefined) variables.b = b
		if (c !== undefined) variables.c = c

		// Determine which rule to apply: sine (0), cosine (1) or tangent (2).
		const rule = notGiven
		const equation = asEquation(['sin(β) = b/c', 'cos(β) = a/c', 'tan(β) = b/a'][rule], undefined, { degrees: true }).substitute(variables)
		const ansRaw = asExpression(['asin(b/c)', 'acos(a/c)', 'atan(b/a)'][rule], undefined, { degrees: true }).substitute(variables)
		const ans = ansRaw.combine()
		const canSimplifyAns = !expressionComparisons.exactEqual(ans, ansRaw)

		// Calculate the remaining side.
		if (notGiven === 0) a = asExpression('sqrt(c^2 - b^2)').substitute(variables)
		else if (notGiven === 1) b = asExpression('sqrt(c^2 - a^2)').substitute(variables)
		else c = asExpression('sqrt(a^2 + b^2)').substitute(variables)
		return { ...parameters, a, b, c, notGiven, variables, rule, equation, ansRaw, ans, canSimplifyAns }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compareInputs('rule', data)
			case 2: return compareInputs('equation', data)
			default: return compareInputs('ans', data)
		}
	},
})
