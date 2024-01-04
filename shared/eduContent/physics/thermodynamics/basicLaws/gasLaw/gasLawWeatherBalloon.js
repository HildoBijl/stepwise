const { FloatUnit, getRandomFloatUnit } = require('../../../../../inputTypes')
const { helium: { Rs } } = require('../../../../../data/gasProperties')
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
		min: 20,
		max: 300,
		significantDigits: 2,
		unit: 'm^3',
	})
	const T1 = getRandomFloatUnit({
		min: 275,
		max: 295,
		significantDigits: 3,
		unit: 'K',
	})

	// Define end-point.
	const p2 = getRandomFloatUnit({
		min: 5,
		max: 20,
		significantDigits: 2,
		unit: 'mbar',
	})
	const T2 = getRandomFloatUnit({
		min: 200,
		max: 250,
		significantDigits: 3,
		unit: 'K',
	})

	return { p1, p2, T1, T2, V1 }
}

function getSolution({ p1, p2, T1, T2, V1 }) {
	const p1s = p1.simplify()
	const p2s = p2.simplify()
	const T1s = T1.simplify()
	const T2s = T2.simplify()
	const V1s = V1.simplify()
	const m = p1.multiply(V1).divide(Rs.multiply(T1)).setUnit('kg')
	const V2 = m.multiply(Rs).multiply(T2).divide(p2).setUnit('m^3')
	return { p1s, p2s, V1s, V2, T1s, T2s, m, Rs }
}

function checkInput(exerciseData, step) {
	switch (step) {
		case 1:
			return performComparison(exerciseData, 'm')
		default:
			return performComparison(exerciseData, 'V2')
	}
}

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getStepExerciseProcessor(exercise),
}
