const { getRandom } = require('../../util')
const { getRandomFloatUnit } = require('../../inputTypes')
const { air } = require('../../data/gasProperties')
const { getStepExerciseProcessor, addSetupFromSteps, performComparison } = require('../../eduTools')

const data = {
	skill: 'calculateClosedCycle',
	steps: ['calculateProcessStep', 'calculateProcessStep', 'calculateProcessStep'],

	comparison: {
		default: {
			relativeMargin: 0.015,
			significantDigitMargin: 1,
		},
	},
}
addSetupFromSteps(data)

function generateState() {
	const p1 = getRandomFloatUnit({
		min: 0.9,
		max: 1.0,
		decimals: 2,
		unit: 'bar',
	})
	const V1 = getRandomFloatUnit({
		min: 300,
		max: 600,
		significantDigits: 2,
		unit: 'cm^3',
	}).setDecimals(0)
	const T1 = getRandomFloatUnit({
		min: 1,
		max: 30,
		decimals: 0,
		unit: 'dC',
	})
	const volumeFactor = getRandom(15, 25) // = V1/V2
	const p2 = p1.multiply(Math.pow(volumeFactor, air.k.number)).setDecimals(0).roundToPrecision() // Poisson's law
	const pressureFactor = getRandom(1.3, 1.6) // Increase in pressure due to heating.
	const p3 = p2.multiply(pressureFactor).setDecimals(0).roundToPrecision()

	return { p1, V1, T1, p2, p3 }
}

function getSolution({ p1, V1, T1, p2, p3 }) {
	const { Rs, k } = air
	p1 = p1.simplify()
	V1 = V1.simplify()
	T1 = T1.simplify()
	p2 = p2.simplify()
	p3 = p3.simplify()
	const m = p1.multiply(V1).divide(Rs.multiply(T1)).setUnit('kg')
	const mRs = m.multiply(Rs)
	const V2 = V1.multiply(Math.pow(p1.number / p2.number, 1 / k.number))
	const T2 = p2.multiply(V2).divide(mRs).setUnit('K')
	const V3 = V2
	const T3 = p3.multiply(V3).divide(mRs).setUnit('K')
	const V4 = V1
	const p4 = p3.multiply(Math.pow(V3.number / V4.number, k.number))
	const T4 = p4.multiply(V4).divide(mRs).setUnit('K')
	return { m, Rs, k, p1, V1, T1, p2, V2, T2, p3, V3, T3, p4, V4, T4 }
}

function checkInput(state, input, step, substep) {
	const solution = getSolution(state)
	switch (step) {
		case 1:
			return performComparison(['p1', 'V1', 'T1', 'p2', 'V2', 'T2'], input, solution, data.comparison)
		case 2:
			return performComparison(['p3', 'V3', 'T3'], input, solution, data.comparison)
		case 3:
			return performComparison(['p4', 'V4', 'T4'], input, solution, data.comparison)
		default:
			return performComparison(['p1', 'V1', 'T1', 'p2', 'V2', 'T2', 'p3', 'V3', 'T3', 'p4', 'V4', 'T4'], input, solution, data.comparison)
	}
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	checkInput,
	getSolution,
}
