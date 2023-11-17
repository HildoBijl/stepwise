const { selectRandomly, getRandom, getRandomBoolean, getRandomInteger } = require('../../../util')
const { asExpression, asEquation, equationComparisons, Variable, Integer } = require('../../../CAS')
const { getStepExerciseProcessor, selectRandomVariables, performComparison } = require('../../../eduTools')

const sampleTriangles = [[1, 1, 'sqrt(2)'], [1, 'sqrt(3)', 2], [1, 2, 'sqrt(5)'], [3, 4, 5], [5, 12, 13]]
const availableVariableSets = [['a', 'b', 'c'], ['x', 'y', 'z'], ['p', 'q', 'r']]
const usedVariables = ['a', 'b', 'c']

const data = {
	skill: 'applySimilarTriangles',
	steps: [null, null, null, null],
	comparison: {
		default: {},
		equation1: (input, correct) => equationComparisons.equivalent(input, correct) || equationComparisons.equivalent(input.invert(), correct),
		equation2: (input, correct) => equationComparisons.equivalent(input, correct) || equationComparisons.equivalent(input.invert(), correct),
	},
}

function generateState() {
	// Generate random data.
	const given = getRandomInteger(0, 2) // Is a, b or c already given?
	const triangle = selectRandomly(sampleTriangles).map(exp => asExpression(exp))
	const variableSet = selectRandomly(availableVariableSets)
	const variables = selectRandomVariables(variableSet, usedVariables)

	// Gather all data into a state.
	return {
		a: given === 0 ? new Integer(getRandomInteger(2, 20)) : new Variable(variables.a),
		b: given === 1 ? new Integer(getRandomInteger(2, 20)) : new Variable(variables.b),
		c: given === 2 ? new Integer(getRandomInteger(2, 30)) : new Variable(variables.c),
		La: triangle[0],
		Lb: triangle[1],
		rotation: getRandom(0, 2 * Math.PI),
		reflection: getRandomBoolean(),
	}
}

function getSolution(state) {
	// Extract all the variables.
	let { a, b, c, La, Lb } = state
	const Lc = asExpression('sqrt(L_a^2 + L_b^2)').substituteVariables({ La, Lb }).regularClean()
	const variables = { a, b, c, La, Lb, Lc }

	// Determine the solution.
	let given, equation1, equation2, ans1Raw, ans2Raw
	if (a.isNumeric()) {
		given = 0
		equation1 = asEquation('a/L_a=b/L_b').substituteVariables(variables)
		equation2 = asEquation('a/L_a=c/L_c').substituteVariables(variables)
		ans1Raw = asExpression('a*(L_b/L_a)').substituteVariables(variables)
		ans2Raw = asExpression('a*(L_c/L_a)').substituteVariables(variables)
	} else if (b.isNumeric()) {
		given = 1
		equation1 = asEquation('a/L_a=b/L_b').substituteVariables(variables)
		equation2 = asEquation('b/L_b=c/L_c').substituteVariables(variables)
		ans1Raw = asExpression('b*(L_a/L_b)').substituteVariables(variables)
		ans2Raw = asExpression('b*(L_c/L_b)').substituteVariables(variables)
	} else {
		given = 2
		equation1 = asEquation('a/L_a=c/L_c').substituteVariables(variables)
		equation2 = asEquation('b/L_b=c/L_c').substituteVariables(variables)
		ans1Raw = asExpression('c*(L_a/L_c)').substituteVariables(variables)
		ans2Raw = asExpression('c*(L_b/L_c)').substituteVariables(variables)
	}
	const ans1 = ans1Raw.regularClean()
	const ans2 = ans2Raw.regularClean()

	// Define the right variables.
	let x, y, z
	if (given === 0) {
		x = b
		y = c
		z = a
		b = ans1
		c = ans2
	} else if (given === 1) {
		x = a
		y = c
		z = b
		a = ans1
		c = ans2
	} else {
		x = a
		y = b
		z = c
		a = ans1
		b = ans2
	}

	return { ...state, ...given, a, b, c, La, Lb, Lc, x, y, z, equation1, equation2, ans1Raw, ans2Raw, ans1, ans2 }
}

function checkInput(state, input, step) {
	const solution = getSolution(state)
	if (step === 0)
		return performComparison(['ans1', 'ans2'], input, solution, data.comparison)
	if (step === 1)
		return performComparison('equation1', input, solution, data.comparison)
	if (step === 2)
		return performComparison('ans1', input, solution, data.comparison)
	if (step === 3)
		return performComparison('equation2', input, solution, data.comparison)
	if (step === 4)
		return performComparison('ans2', input, solution, data.comparison)
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	getSolution,
	checkInput,
}