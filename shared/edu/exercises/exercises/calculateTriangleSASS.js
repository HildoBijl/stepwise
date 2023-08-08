const { selectRandomly, getRandom, getRandomBoolean, getRandomInteger } = require('../../../util')
const { asEquation, equationComparisons, Integer, Variable, Sqrt } = require('../../../CAS')

const { getStepExerciseProcessor } = require('../util/stepExercise')
const { performComparison } = require('../util/comparison')

const variableSet = ['x', 'y', 'z']

const data = {
	skill: 'calculateTriangle',
	setup: 'applyQuadraticFormula',
	steps: [null, null, null, 'applyQuadraticFormula'],
	comparison: {
		default: {},
		equation: (input, correct) => equationComparisons.equivalent(input, correct),
	},
}

function generateState() {
	return {
		α: new Integer(getRandomInteger(5, 24, [18]) * 5), // Ensure there is no 90 degree angle.
		a: new Variable(selectRandomly(variableSet)),
		b: new Integer(getRandomInteger(2, 12)),
		c: new Integer(getRandomInteger(2, 12)),
		rotation: getRandom(0, 2 * Math.PI),
		reflection: getRandomBoolean(),
	}
}

function getSolution(state) {
	let { α, a, b, c } = state
	const variables = { α, a, b, c }

	// Define solution method data.
	const rule = 1 // Use the cosine rule.
	const equationRaw = asEquation('a^2 = b^2 + c^2 - 2*b*c*cos(α)', { useDegrees: true }).substituteVariables(variables)
	const equation = equationRaw.regularClean()
	const numSolutions = 1

	// Determine the remaining side a.
	const aRaw = new Sqrt(equation.right)
	a = aRaw.regularClean()

	return { ...state, variables, rule, equationRaw, equation, numSolutions, aRaw, a }
}

function checkInput(state, input, step) {
	const solution = getSolution(state)
	if (step === 0)
		return input.numSolutions === solution.numSolutions && performComparison('a', input, solution, data.comparison)
	if (step === 1)
		return performComparison('rule', input, solution, data.comparison)
	if (step === 2)
		return performComparison('equation', input, solution, data.comparison)
	if (step === 3)
		return performComparison('numSolutions', input, solution, data.comparison)
	if (step === 4)
		return performComparison('a', input, solution, data.comparison)
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	getSolution,
	checkInput,
}