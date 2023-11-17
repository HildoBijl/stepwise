const { getRandom } = require('../../../util')
const { FloatUnit, getRandomFloatUnit } = require('../../../inputTypes/FloatUnit')
const { air: { k } } = require('../../../data/gasProperties')
const { getStepExerciseProcessor, addSetupFromSteps } = require('../../../eduTools')
const { performComparison } = require('../util/comparison')

const data = {
	skill: 'calculateSpecificHeatAndMechanicalWork',
	steps: ['recognizeProcessTypes', null, 'specificHeatRatio', ['calculateWithVolume', 'calculateWithPressure'], 'calculateWithSpecificQuantities'],

	comparison: {
		k: {
			relativeMargin: 0.015,
		},
		v1: {
			relativeMargin: 0.001,
			significantDigitMargin: 1,
			checkUnitSize: true,
		},
		v2: {
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
		q: {
			relativeMargin: 0.02,
			significantDigitMargin: 1,
		},
		wt: {
			relativeMargin: 0.02,
			significantDigitMargin: 1,
		},
	},
}
addSetupFromSteps(data)

function generateState() {
	// Determine volumes, ensuring they are nice round numbers.
	let v2 = getRandomFloatUnit({
		min: 1.5,
		max: 1.8,
		decimals: 1,
		unit: 'm^3/kg',
	})
	const pressureRatio = getRandom(7, 11)
	const v1 = v2.multiply(Math.pow(1 / pressureRatio, 1 / k)).roundToPrecision()

	// Determine corresponding pressures.
	const p2 = new FloatUnit('1.0 bar')
	const p1 = p2.multiply(Math.pow(v2.number / v1.number, k)).setDecimals(1).roundToPrecision()

	return { p1, p2, v1, v2 }
}

function getSolution({ p1, p2, v1, v2 }) {
	p1 = p1.simplify()
	p2 = p2.simplify()
	const q = new FloatUnit('0 J/kg')
	const wt = p2.multiply(v2).subtract(p1.multiply(v1)).multiply(-k.number / (k.number - 1)).setUnit('J/kg')
	return { process: 3, eq: 6, k, p1, p2, v1, v2, q, wt }
}

function checkInput(state, input, step, substep) {
	const solution = getSolution(state)
	switch (step) {
		case 1:
			return input.process === solution.process
		case 2:
			return input.eq === solution.eq
		case 3:
			return performComparison('k', input, solution, data.comparison)
		case 4:
			switch (substep) {
				case 1: return performComparison(['v1', 'v2'], input, solution, data.comparison)
				case 2: return performComparison(['p1', 'p2'], input, solution, data.comparison)
			}
		default:
			return performComparison(['q', 'wt'], input, solution, data.comparison)
	}
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	checkInput,
	getSolution,
}
