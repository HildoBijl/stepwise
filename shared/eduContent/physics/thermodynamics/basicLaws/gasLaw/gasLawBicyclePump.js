const { getRandomFloat, FloatUnit, getRandomFloatUnit } = require('../../../../../inputTypes')
const { air: { Rs } } = require('../../../../../data/gasProperties')
const { getStepExerciseProcessor, addSetupFromSteps, performComparison } = require('../../../../../eduTools')

const metaData = {
	steps: ['gasLaw', 'gasLaw'],
	comparison: {
		default: {
			relativeMargin: 0.01,
			significantDigitMargin: 1,
		},
	},
}
addSetupFromSteps(metaData)

function generateState() {
	// Define first situation.
	const p1 = new FloatUnit('1.0 bar')
	const V1 = getRandomFloatUnit({
		min: 0.2,
		max: 1.2,
		significantDigits: 2,
		unit: 'l',
	})
	const T1 = getRandomFloatUnit({
		min: 3,
		max: 18,
		significantDigits: 2,
		unit: 'dC',
	})

	// Define process.
	const n = getRandomFloat({
		min: 1.1,
		max: 1.4,
	}).number
	const p2 = getRandomFloatUnit({
		min: 2,
		max: 5,
		significantDigits: 2,
		unit: 'bar',
	})

	// Find end-point.
	const V2 = V1.multiply(Math.pow(p2.number / p1.number, -1 / n)).roundToPrecision()

	return { p1, p2, V1, V2, T1 }
}

function getSolution({ p1, p2, V1, V2, T1 }) {
	const p1s = p1.simplify()
	const p2s = p2.simplify()
	const V1s = V1.simplify()
	const V2s = V2.simplify()
	const T1s = T1.simplify()
	const m = p1s.multiply(V1s).divide(Rs.multiply(T1s)).setUnit('kg')
	const T2 = T1s.multiply(p2s).multiply(V2s).divide(p1s.multiply(V1s)).setUnit('K')
	return { p1s, p2s, V1s, V2s, T1s, T2, m, Rs }
}

function checkInput(exerciseData, step) {
	switch (step) {
		case 1:
			return performComparison(exerciseData, 'm')
		default:
			return performComparison(exerciseData, 'T2')
	}
}

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getStepExerciseProcessor(exercise),
}
