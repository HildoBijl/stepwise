const { sample, getRandomNumber, getRandomBoolean, getRandomInteger } = require('@step-wise/utils')
const { asExpression, asEquation, equationComparisons } = require('@step-wise/cas')
const { buildStepExercise, stepsToSetup } = require('@step-wise/input-exercises')
const { compare } = require('@step-wise/exercise-grading')

const variableSet = ['x', 'y', 'z']

const metaData = {
	skill: 'calculateTriangle',
	...stepsToSetup([undefined, undefined, undefined, 'solveQuadraticEquation']),
	compare: {
		equation: (input, correct) => equationComparisons.equivalent(input, correct),
	},
}

function generateState() {
	return {
		α: asExpression(getRandomInteger(5, 24, [18]) * 5), // Ensure there is no 90 degree angle.
		a: asExpression(sample(variableSet)),
		b: asExpression(getRandomInteger(2, 12)),
		c: asExpression(getRandomInteger(2, 12)),
		rotation: getRandomNumber(0, 2 * Math.PI),
		reflection: getRandomBoolean(),
	}
}

function getSolution(state) {
	let { α, a, b, c } = state
	const variables = { α, a, b, c }

	// Define solution method data.
	const rule = 1 // Use the cosine rule.
	const equationRaw = asEquation('a^2 = b^2 + c^2 - 2*b*c*cos(α)', undefined, { degrees: true }).substitute(variables)
	const equation = equationRaw.combine()
	const numSolutions = 1

	// Determine the remaining side a.
	const aRaw = equation.right.sqrt()
	a = aRaw.combine()

	return { ...state, variables, rule, equationRaw, equation, numSolutions, aRaw, a }
}

function checkInput(data, step) {
	switch (step) {
		case 1:
			return compare('rule', data)
		case 2:
			return compare('equation', data)
		case 3:
			return compare('numSolutions', data)
		case 4:
			return compare('a', data)
		default:
			return compare(['numSolutions', 'a'], data)
	}
}

module.exports = buildStepExercise({ metaData, generateState, getSolution, checkInput })
