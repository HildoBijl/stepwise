const { sample, getRandomNumber, getRandomBoolean, getRandomInteger } = require('@step-wise/utils')
const { asExpression, asEquation, equationComparisons } = require('@step-wise/cas')
const { buildStepExercise, stepsToSetup } = require('@step-wise/input-exercises')
const { compare } = require('@step-wise/exercise-grading')

const variableSet = ['x', 'y', 'z']

const metaData = {
	skill: 'calculateTriangle',
	...stepsToSetup(['determine2DAngles', undefined, undefined, undefined, 'solveLinearEquation']),
	compare: {
		equation: (input, correct) => equationComparisons.equivalent(input, correct) || equationComparisons.equivalent(input.invert(), correct),
	},
}

function generateState() {
	// Determine the angles and check if they match the conditions.
	const α = getRandomInteger(5, 12) * 5
	const β = getRandomInteger(5, 24, [18, 18 - α / 5]) * 5 // Ensure there is no 90 degree angle.
	if (α + β > 155)
		return generateState()

	// Gather all data into a state.
	return {
		α: asExpression(α),
		β: asExpression(β),
		a: asExpression(sample(variableSet)),
		c: asExpression(getRandomInteger(2, 12)),
		rotation: getRandomNumber(0, 2 * Math.PI),
		reflection: getRandomBoolean(),
	}
}

function getSolution(state) {
	let { α, β, a, c } = state
	const variables = { α, β, a, c }

	// Determine gamma.
	const γRaw = asExpression('180-α-β', undefined, { degrees: true }).substitute(variables)
	const γ = γRaw.combine()
	variables.γ = γ

	// Define solution method data.
	const rule = 0 // Use the sine rule.
	const equation = asEquation('a/sin(α)=c/sin(γ)', undefined, { degrees: true }).substitute(variables)
	const numSolutions = 1

	// Determine a and b.
	const aRaw = asExpression('c*sin(α)/sin(γ)', undefined, { degrees: true }).substitute(variables)
	a = aRaw.combine()
	const bRaw = asExpression('c*sin(β)/sin(γ)', undefined, { degrees: true }).substitute(variables)
	const b = bRaw.combine()

	return { ...state, variables, γRaw, γ, rule, numSolutions, equation, aRaw, a, bRaw, b }
}

function checkInput(data, step) {
	switch (step) {
		case 1:
			return compare('γ', data)
		case 2:
			return compare('rule', data)
		case 3:
			return compare('equation', data)
		case 4:
			return compare('numSolutions', data)
		case 5:
			return compare('a', data)
		default:
			return compare(['numSolutions', 'a'], data)
	}
}

module.exports = buildStepExercise({ metaData, generateState, getSolution, checkInput })
