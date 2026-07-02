const { epsilon, deg2rad, getRandomNumber, getRandomBoolean, getRandomInteger } = require('@step-wise/utils')
const { asExpression, asEquation, equationComparisons } = require('@step-wise/cas')
const { buildStepExercise, stepsToSetup } = require('@step-wise/input-exercises')
const { selectRandomVariables, performComparison, performListComparison } = require('../../../../../eduTools')

const variableSet = ['α', 'β', 'γ']

const metaData = {
	...stepsToSetup(['calculateTriangle', 'determine2DAngles']),
	comparison: {
		default: {},
		equation: (input, correct) => equationComparisons.equivalent(input, correct) || equationComparisons.equivalent(input.invert(), correct),
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
		...selectRandomVariables(variableSet, ['β', 'γ']),
		a: asExpression(a),
		c: asExpression(c),
		rotation: getRandomNumber(0, 2 * Math.PI),
		reflection: getRandomBoolean(),
	}
}

function getSolution(state) {
	let { α, β, γ, a, c } = state
	const variables = { α, β, γ, a, c }

	// Determine γ.
	const rule = 0 // Use the sine rule.
	const equation = asEquation('a/sin(α) = c/sin(γ)', undefined, { degrees: true }).substitute(variables)
	const intermediateEquation = asEquation('sin(γ) = c/a*sin(α)', undefined, { degrees: true }).substitute(variables).combine()
	const γ1 = intermediateEquation.right.arcsin()
	const γ2 = asExpression(180, undefined, { degrees: true }).subtract(γ1).combine()
	const numSolutions = 2

	// Determine β.
	const β1 = asExpression(180, undefined, { degrees: true }).subtract(α).subtract(γ1).combine()
	const β2 = asExpression(180, undefined, { degrees: true }).subtract(α).subtract(γ2).combine()

	// Determine corresponding b values.
	const b1 = asExpression('c*cos(α) + sqrt((c*cos(α))^2 - (c^2-a^2))', undefined, { degrees: true }).substitute(variables)
	const b2 = asExpression('c*cos(α) - sqrt((c*cos(α))^2 - (c^2-a^2))', undefined, { degrees: true }).substitute(variables)

	return { ...state, variables, rule, equation, intermediateEquation, γ1, γ2, β1, β2, b1, b2, numSolutions }
}

function checkInput(exerciseData, step) {
	switch (step) {
		case 1:
			return performComparison(exerciseData, 'numSolutions') && performListComparison(exerciseData, ['γ1', 'γ2'])
		case 2:
			return performListComparison(exerciseData, ['β1', 'β2'])
		default:
			return performComparison(exerciseData, 'numSolutions') && performListComparison(exerciseData, ['β1', 'β2'])
	}
}

module.exports = buildStepExercise({ metaData, generateState, getSolution, checkInput })
