const { epsilon, deg2rad, sample, getRandomNumber, getRandomBoolean, getRandomInteger } = require('@step-wise/utils')
const { and } = require('@step-wise/skill-setup')
const { asExpression, asEquation, equationComparisons } = require('@step-wise/cas')
const { getStepExerciseProcessor, addSetupFromSteps, performComparison, performListComparison } = require('../../../../../eduTools')

const variableSet = ['α', 'β', 'γ']

const metaData = {
	skill: 'calculateTriangle',
	steps: [null, null, null, and('solveLinearEquation', 'applySineCosineTangent')],
	comparison: {
		default: {},
		equation: (input, correct) => equationComparisons.equivalent(input, correct) || equationComparisons.equivalent(input.invert(), correct),
	},
}
addSetupFromSteps(metaData)

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
		γ: asExpression(sample(variableSet)),
		a: asExpression(a),
		c: asExpression(c),
		rotation: getRandomNumber(0, 2 * Math.PI),
		reflection: getRandomBoolean(),
	}
}

function getSolution(state) {
	let { α, γ, a, c } = state
	const variables = { α, γ, a, c }

	// Determine the solution.
	const rule = 0 // Use the sine rule.
	const equation = asEquation('a/sin(α) = c/sin(γ)', undefined, { degrees: true }).substitute(variables)
	const intermediateEquation = asEquation('sin(γ) = c/a*sin(α)', undefined, { degrees: true }).substitute(variables).combine()
	const γ1 = intermediateEquation.right.arcsin()
	const γ2 = asExpression(180, undefined, { degrees: true }).subtract(γ1).combine()
	const numSolutions = 2

	// Determine corresponding b values.
	const b1 = asExpression('c*cos(α) + sqrt((c*cos(α))^2 - (c^2-a^2))', undefined, { degrees: true }).substitute(variables)
	const b2 = asExpression('c*cos(α) - sqrt((c*cos(α))^2 - (c^2-a^2))', undefined, { degrees: true }).substitute(variables)

	return { ...state, variables, rule, equation, intermediateEquation, γ1, γ2, b1, b2, numSolutions }
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
			return performListComparison(exerciseData, ['γ1', 'γ2'])
		default:
			return performComparison(exerciseData, 'numSolutions') && performListComparison(exerciseData, ['γ1', 'γ2'])
	}
}

module.exports = buildStepExercise({ metaData, generateState, getSolution, checkInput })
