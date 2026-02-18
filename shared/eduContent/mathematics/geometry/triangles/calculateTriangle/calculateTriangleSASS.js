const { selectRandomly, getRandomNumber, getRandomBoolean, getRandomInteger } = require('../../../../../util')
const { asEquation, equationComparisons, Integer, Variable, Sqrt } = require('../../../../../CAS')
const { getStepExerciseProcessor, performComparison } = require('../../../../../eduTools')

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
	return {
		α: new Integer(getRandomInteger(5, 24, [18]) * 5), // Ensure there is no 90 degree angle.
		a: new Variable(selectRandomly(variableSet)),
		b: new Integer(getRandomInteger(2, 12)),
		c: new Integer(getRandomInteger(2, 12)),
		rotation: getRandomNumber(0, 2 * Math.PI),
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

function checkInput(exerciseData, step) {
	switch (step) {
		case 1:
			return performComparison(exerciseData, 'rule')
		case 2:
			return performComparison(exerciseData, 'equation')
		case 3:
			return performComparison(exerciseData, 'numSolutions')
		case 4:
			return performComparison(exerciseData, 'a')
		default:
			return performComparison(exerciseData, ['numSolutions', 'a'])
	}
}

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getStepExerciseProcessor(exercise),
}
