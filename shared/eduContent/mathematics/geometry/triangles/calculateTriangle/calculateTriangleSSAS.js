const { epsilon, deg2rad, sample, getRandomNumber, getRandomBoolean, getRandomInteger } = require('@step-wise/utils')
const { asExpression, asEquation, equationComparisons } = require('@step-wise/cas')
const { getStepExerciseProcessor, performComparison, performListComparison } = require('../../../../../eduTools')

const variableSet = ['x', 'y', 'z']

const metaData = {
	skill: 'calculateTriangle',
	setup: 'solveQuadraticEquation',
	steps: [null, null, null, 'solveQuadraticEquation'],
	comparison: {
		default: {},
		equation: (input, correct) => equationComparisons.equivalent(input, correct),
	},
}

function generateState() {
	// Generate numbers and ensure that there are two solutions.
	const α = getRandomInteger(5, 17) * 5
	const c = getRandomInteger(6, 12)
	const a = getRandomInteger(2, c - 1)
	if (a <= c * Math.sin(deg2rad(α)) + epsilon)
		return generateState()

	// Assemble the state.
	return {
		α: asExpression(α),
		a: asExpression(a),
		b: asExpression(sample(variableSet)),
		c: asExpression(c),
		rotation: getRandomNumber(0, 2 * Math.PI),
		reflection: getRandomBoolean(),
	}
}

function getSolution(state) {
	let { α, a, b, c } = state
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
}

function checkInput(exerciseData, step) {
	switch (step) {
		case 1:
			return performComparison(exerciseData, 'rule')
		case 2:
			return performComparison(exerciseData, 'equation')
		case 3:
			return performComparison(exerciseData, 'numSolutions')
		case 4:
			return performListComparison(exerciseData, ['b1', 'b2'])
		default:
			return performComparison(exerciseData, 'numSolutions') && performListComparison(exerciseData, ['b1', 'b2'])
	}
}

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getStepExerciseProcessor(exercise),
}
