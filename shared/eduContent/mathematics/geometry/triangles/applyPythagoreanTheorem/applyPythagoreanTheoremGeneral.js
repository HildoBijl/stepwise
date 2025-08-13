const { selectRandomly, getRandom, getRandomBoolean, getRandomInteger } = require('../../../../../util')
const { asExpression, asEquation, expressionComparisons, equationComparisons, Variable, Integer, Sqrt } = require('../../../../../CAS')
const { getStepExerciseProcessor, addSetupFromSteps, performComparison } = require('../../../../../eduTools')

const pythagoreanTriplets = [[3, 4, 5], [5, 12, 13], [6, 8, 10], [7, 24, 25], [8, 15, 17], [9, 12, 15], [10, 24, 26]]
const variableSet = ['x', 'y', 'z']

const metaData = {
	skill: 'applyPythagoreanTheorem',
	steps: [null, null, null],
	comparison: {
		default: {},
		equation: equationComparisons.equivalent,
	},
}

function generateState() {
	// Generate random data.
	const toFind = getRandomInteger(0, 2) // Find a, b or c?
	const usePythagoreanTriplet = getRandomBoolean() // Use a predefined triplet?
	const triplet = usePythagoreanTriplet ? selectRandomly(pythagoreanTriplets) : [
		getRandomInteger(1, 10), // a
		getRandomInteger(1, 10), // b
		getRandomInteger(1, 12), // c
	]
	const x = new Variable(selectRandomly(variableSet))

	// Check if it is valid.
	if ((toFind === 0 && triplet[1] >= triplet[2]) || (toFind === 1 && triplet[0] >= triplet[2]))
		return generateState()

	return {
		a: toFind === 0 ? x : new Integer(triplet[0]),
		b: toFind === 1 ? x : new Integer(triplet[1]),
		c: toFind === 2 ? x : new Integer(triplet[2]),
		rotation: getRandom(0, 2 * Math.PI),
		reflection: getRandomBoolean(),
	}
}

function getSolution(state) {
	// Determine the equation.
	let { a, b, c } = state
	const equation = asEquation(`a^2 + b^2 = c^2`).substitute('a', a).substitute('b', b).substitute('c', c)

	// Determine the solution.
	let toFind, ansSquared
	if (!a.isNumeric()) {
		toFind = 0
		ansSquared = asExpression('c^2 - b^2').substitute('b', b).substitute('c', c)
	} else if (!b.isNumeric()) {
		toFind = 1
		ansSquared = asExpression('c^2 - a^2').substitute('a', a).substitute('c', c)
	} else {
		toFind = 2
		ansSquared = asExpression('a^2 + b^2').substitute('a', a).substitute('b', b)
	}
	const ansSquaredSimplified = ansSquared.regularClean()
	const ansRaw = new Sqrt(ansSquaredSimplified)
	const ans = ansRaw.regularClean()
	const ansCanBeSimplified = !expressionComparisons.exactEqual(ans, ansRaw)

	// Define the right variables.
	let x
	if (toFind === 0) {
		x = a
		a = ans
	} else if (toFind === 1) {
		x = b
		b = ans
	} else {
		x = c
		c = ans
	}

	return { ...state, toFind, a, b, c, x, equation, ansSquared, ansSquaredSimplified, ansRaw, ans, ansCanBeSimplified }
}

function checkInput(exerciseData, step) {
	switch (step) {
		case 1:
			return performComparison(exerciseData, 'equation')
		case 2:
			return performComparison(exerciseData, 'ansSquared')
		default:
			return performComparison(exerciseData, 'ans')
	}
}

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getStepExerciseProcessor(exercise),
}
