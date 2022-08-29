const { epsilon, deg2rad } = require('../../../util/numbers')
const { selectRandomly, getRandom, getRandomBoolean, getRandomInteger } = require('../../../util/random')
const { asExpression, asEquation, equationComparisons, Integer, Variable } = require('../../../CAS')

const { getStepExerciseProcessor } = require('../util/stepExercise')
const { performComparison, performListComparison } = require('../util/comparison')

const variableSet = ['x', 'y', 'z']

const data = {
	skill: 'calculateTriangle',
	setup: 'solveBasicQuadraticEquation',
	steps: [null, null, null, 'solveBasicQuadraticEquation'],
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
		α: new Integer(α),
		a: new Integer(a),
		b: new Variable(selectRandomly(variableSet)),
		c: new Integer(c),
		rotation: getRandom(0, 2 * Math.PI),
		reflection: getRandomBoolean(),
	}
}

function getSolution(state) {
	let { α, a, b, c } = state
	const variables = { α, a, b, c }

	// Define solution method data.
	const rule = 1 // Use the cosine rule.
	const equationRaw = asEquation('a^2 = b^2 + c^2 - 2*c*b*cos(α)', { useDegrees: true }).substituteVariables(variables)
	const equation = equationRaw.advancedClean()
	const equationInStandardForm = equation.applyToBothSides(side => side.subtract(equation.left)).switch().advancedClean()
	const numSolutions = 2

	// Determine the solution.
	const b1Raw = asExpression('c*cos(α) + sqrt((c*cos(α))^2 - (c^2-a^2))', { useDegrees: true }).substituteVariables(variables)
	const b1 = b1Raw.advancedClean()
	const b2Raw = asExpression('c*cos(α) - sqrt((c*cos(α))^2 - (c^2-a^2))', { useDegrees: true }).substituteVariables(variables)
	const b2 = b2Raw.advancedClean()

	return { ...state, variables, rule, equationRaw, equation, equationInStandardForm, numSolutions, b1Raw, b1, b2Raw, b2 }
}

function checkInput(state, input, step) {
	const solution = getSolution(state)
	if (step === 0)
		return input.numSolutions === solution.numSolutions && performListComparison(['b1', 'b2'], input, solution, data.comparison)
	if (step === 1)
		return performComparison('rule', input, solution, data.comparison)
	if (step === 2)
		return performComparison('equation', input, solution, data.comparison)
	if (step === 3)
		return performComparison('numSolutions', input, solution, data.comparison)
	if (step === 4)
		return performListComparison(['b1', 'b2'], input, solution, data.comparison)
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	getSolution,
	checkInput,
}