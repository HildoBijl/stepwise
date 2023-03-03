const { getRandomFloat } = require('../../../inputTypes/Float')
const { FloatUnit, getRandomFloatUnit } = require('../../../inputTypes/FloatUnit')
const { air: { Rs } } = require('../../../data/gasProperties')

const { getStepExerciseProcessor, addSetupFromSteps } = require('../util/stepExercise')

const data = {
	steps: ['gasLaw', 'gasLaw'],

	comparison: {
		relativeMargin: 0.01,
		significantDigitMargin: 1,
	},
}
addSetupFromSteps(data)

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
	p1 = p1.simplify()
	p2 = p2.simplify()
	V1 = V1.simplify()
	V2 = V2.simplify()
	T1 = T1.simplify()
	const m = p1.multiply(V1).divide(Rs.multiply(T1)).setUnit('kg')
	const T2 = T1.multiply(p2).multiply(V2).divide(p1.multiply(V1)).setUnit('K')
	return { p1, p2, V1, V2, T1, T2, m, Rs }
}

function checkInput(state, input, step, substep) {
	const { m, T2 } = getSolution(state)

	switch (step) {
		case 1:
			return m.equals(input.m, data.comparison)
		default:
			return T2.equals(input.T2, data.comparison)
	}
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	checkInput,
	getSolution,
}
