const { selectRandomly, getRandomNumber, getRandomBoolean, getRandomInteger } = require('../../../../../util')
const { and } = require('../../../../../skillTracking')
const { asEquation, equationComparisons, Integer, Variable, Arccos } = require('../../../../../CAS')
const { getStepExerciseProcessor, addSetupFromSteps, performComparison } = require('../../../../../eduTools')

const variableSet = ['α', 'β', 'γ']

const metaData = {
	skill: 'calculateTriangle',
	steps: [null, null, null, and('solveLinearEquation', 'applySineCosineTangent')],
	comparison: {
		default: {},
		equation: (input, correct) => equationComparisons.equivalent(input, correct),
	},
}
addSetupFromSteps(metaData)

function generateState() {
	// Determine sides and check the triangle inequality.
	const a = getRandomInteger(2, 12)
	const b = getRandomInteger(2, 12)
	const c = getRandomInteger(2, 12)
	if (a + b <= c || a + c <= b || b + c <= a)
		return generateState()

	// Assemble the state.
	return {
		α: new Variable(selectRandomly(variableSet)),
		a: new Integer(a),
		b: new Integer(b),
		c: new Integer(c),
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
	const intermediateEquation = asEquation('cos(α) = (b^2 + c^2 - a^2)/(2*b*c)', { useDegrees: true }).substituteVariables(variables).regularClean()
	α = new Arccos(intermediateEquation.right).applySettings({ useDegrees: true })

	return { ...state, variables, rule, equationRaw, equation, numSolutions, intermediateEquation, α }
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
			return performComparison(exerciseData, 'α')
		default:
			return performComparison(exerciseData, ['numSolutions', 'α'])
	}
}

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getStepExerciseProcessor(exercise),
}
