const { epsilon, deg2rad, getRandom, getRandomBoolean, getRandomInteger } = require('../../../../../util')
const { asExpression, asEquation, equationComparisons, Integer, Arcsin } = require('../../../../../CAS')
const { getStepExerciseProcessor, addSetupFromSteps, selectRandomVariables, performComparison, performListComparison } = require('../../../../../eduTools')

const variableSet = ['α', 'β', 'γ']

const metaData = {
	steps: ['calculateTriangle', 'determine2DAngles'],
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
		α: new Integer(α),
		...selectRandomVariables(variableSet, ['β', 'γ']),
		a: new Integer(a),
		c: new Integer(c),
		rotation: getRandomNumber(0, 2 * Math.PI),
		reflection: getRandomBoolean(),
	}
}

function getSolution(state) {
	let { α, β, γ, a, c } = state
	const variables = { α, β, γ, a, c }

	// Determine γ.
	const rule = 0 // Use the sine rule.
	const equation = asEquation('a/sin(α) = c/sin(γ)', { useDegrees: true }).substituteVariables(variables)
	const intermediateEquation = asEquation('sin(γ) = c/a*sin(α)', { useDegrees: true }).substituteVariables(variables).regularClean()
	const γ1 = new Arcsin(intermediateEquation.right).applySettings({ useDegrees: true })
	const γ2 = new Integer(180).subtract(γ1).regularClean()
	const numSolutions = 2

	// Determine β.
	const β1 = new Integer(180).subtract(α).subtract(γ1).regularClean()
	const β2 = new Integer(180).subtract(α).subtract(γ2).regularClean()

	// Determine corresponding b values.
	const b1 = asExpression('c*cos(α) + sqrt((c*cos(α))^2 - (c^2-a^2))', { useDegrees: true }).substituteVariables(variables)
	const b2 = asExpression('c*cos(α) - sqrt((c*cos(α))^2 - (c^2-a^2))', { useDegrees: true }).substituteVariables(variables)

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

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getStepExerciseProcessor(exercise),
}
