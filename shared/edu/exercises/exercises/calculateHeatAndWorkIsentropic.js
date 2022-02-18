const { getRandomFloatUnit } = require('../../../inputTypes/FloatUnit')
const { FloatUnit } = require('../../../inputTypes/FloatUnit')
const { getStepExerciseProcessor } = require('../util/stepExercise')
const { combinerAnd, combinerOr } = require('../../../skillTracking')
const { performComparison } = require('../util/check')
const { getRandom } = require('../../../util/random')
const { air: { k } } = require('../../../data/gasProperties')

const data = {
	skill: 'calculateHeatAndWork',
	setup: combinerAnd('recognizeProcessTypes', 'specificHeatRatio', combinerOr('calculateWithVolume', 'calculateWithPressure')),
	steps: ['recognizeProcessTypes', null, 'specificHeatRatio', ['calculateWithVolume', 'calculateWithPressure'], 'solveLinearEquation'],

	equalityOptions: {
		default: {
			relativeMargin: 0.01,
			significantDigitMargin: 2,
			accuracyFactor: 2,
		},
		V1: {
			relativeMargin: 0.001,
			significantDigitMargin: 1,
			checkUnitSize: true,
		},
		V2: {
			relativeMargin: 0.001,
			significantDigitMargin: 1,
			checkUnitSize: true,
		},
		p1: {
			relativeMargin: 0.001,
			significantDigitMargin: 1,
			checkUnitSize: true,
		},
		p2: {
			relativeMargin: 0.001,
			significantDigitMargin: 1,
			checkUnitSize: true,
		},
	},
}

function generateState() {
	// Determine volumes, ensuring they are nice round numbers.
	let V1 = getRandomFloatUnit({
		min: 150,
		max: 900,
		decimals: -1,
		unit: 'm^3',
	})
	const pressureRatio = getRandom(7, 11)
	const V2 = V1.multiply(Math.pow(pressureRatio, 1 / k)).roundToPrecision()
	V1 = V1.setDecimals(0)

	// Determine corresponding pressures.
	const p2 = new FloatUnit('1.0 bar')
	const p1 = p2.multiply(Math.pow(V2.number / V1.number, k)).setDecimals(1).roundToPrecision()

	return { p1, p2, V1, V2 }
}

function getSolution({ p1, p2, V1, V2 }) {
	p1 = p1.simplify()
	p2 = p2.simplify()
	const Q = new FloatUnit('0 J')
	const W = p2.multiply(V2).subtract(p1.multiply(V1)).multiply(-1 / (k.number - 1)).setUnit('J')
	return { process: 3, eq: 6, k, p1, p2, V1, V2, Q, W }
}

function checkInput(state, input, step, substep) {
	const solution = getSolution(state)
	switch (step) {
		case 1:
			return input.process === solution.process
		case 2:
			return input.eq === solution.eq
		case 3:
			return performComparison('k', input, solution, data.equalityOptions)
		case 4:
			switch (substep) {
				case 1: return performComparison(['V1', 'V2'], input, solution, data.equalityOptions)
				case 2: return performComparison(['p1', 'p2'], input, solution, data.equalityOptions)
			}
		default:
			return performComparison(['Q', 'W'], input, solution, data.equalityOptions)
	}
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	checkInput,
	getSolution,
}
