const { applyMapping, selectRandomly, getRandom, getRandomBoolean, getRandomInteger } = require('../../../../../util')
const { asExpression, asEquation, expressionComparisons, equationComparisons, Integer, Variable } = require('../../../../../CAS')
const { getStepExerciseProcessor, addSetupFromSteps, performComparison } = require('../../../../../eduTools')

const variableSet = ['α', 'β', 'γ']

const metaData = {
	skill: 'applySineCosineTangent',
	steps: [null, null, null],
	comparison: {
		default: {},
		equation: (input, correct) => equationComparisons.equivalent(input, correct),
	},
}
addSetupFromSteps(metaData)

function generateState() {
	// Determine the sides.
	const notGiven = getRandomInteger(0, 2) // Is a, b or c not given?
	const sides = {}
	if (notGiven === 0) {
		sides.b = getRandomInteger(2, 10)
		sides.c = getRandomInteger(sides.b + 1, 12)
	} else if (notGiven === 1) {
		sides.a = getRandomInteger(2, 10)
		sides.c = getRandomInteger(sides.a + 1, 12)
	} else {
		sides.a = getRandomInteger(2, 10)
		sides.b = getRandomInteger(2, 10)
	}

	// Gather all data into a state.
	return {
		...applyMapping(sides, side => new Integer(side)),
		beta: new Variable(selectRandomly(variableSet)),
		rotation: getRandom(0, 2 * Math.PI),
		reflection: getRandomBoolean(),
	}
}

function getSolution(state) {
	// Determine which case we are dealing with.
	let { a, b, c } = state
	const notGiven = (a === undefined ? 0 : (b === undefined ? 1 : 2))

	// Set up a variables object for substitutions.
	const variables = {}
	const sides = ['a', 'b', 'c']
	sides.forEach(variable => {
		if (state[variable] !== undefined)
			variables[variable] = state[variable]
	})
	variables['β'] = state.beta

	// Determine which rule to apply: sine (0), cosine (1) or tangent (2).
	const rule = notGiven
	const equation = asEquation([
		'sin(β) = b/c',
		'cos(β) = a/c',
		'tan(β) = b/a',
	][rule], { useDegrees: true }).substituteVariables(variables)
	const ansRaw = asExpression([
		'asin(b/c)',
		'acos(a/c)',
		'atan(b/a)',
	][rule], { useDegrees: true }).substituteVariables(variables)
	const ans = ansRaw.regularClean()
	const canSimplifyAns = !expressionComparisons.exactEqual(ans, ansRaw)

	// Calculate the remaining side.
	if (notGiven === 0)
		a = asExpression('sqrt(c^2 - b^2)').substituteVariables(variables)
	else if (notGiven === 1)
		b = asExpression('sqrt(c^2 - a^2)').substituteVariables(variables)
	else
		c = asExpression('sqrt(a^2 + b^2)').substituteVariables(variables)

	return { ...state, a, b, c, notGiven, variables, rule, equation, ansRaw, ans, canSimplifyAns }
}

function checkInput(exerciseData, step) {
	switch (step) {
		case 1:
			return performComparison(exerciseData, 'rule')
		case 2:
			return performComparison(exerciseData, 'equation')
		default:
			return performComparison(exerciseData, 'ans')
	}
}

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getStepExerciseProcessor(exercise),
}
