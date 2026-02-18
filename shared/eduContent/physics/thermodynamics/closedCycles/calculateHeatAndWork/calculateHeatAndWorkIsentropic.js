const { getRandomNumber } = require('../../../../../util')
const { FloatUnit, getRandomFloatUnit } = require('../../../../../inputTypes')
const { air: { k } } = require('../../../../../data/gasProperties')
const { getStepExerciseProcessor, addSetupFromSteps, performComparison } = require('../../../../../eduTools')

const metaData = {
	skill: 'calculateHeatAndWork',
	steps: ['recognizeProcessTypes', null, 'specificHeatRatio', ['calculateWithVolume', 'calculateWithPressure'], null],
	comparison: {
		default: {
			relativeMargin: 0.01,
			significantDigitMargin: 2,
			accuracyFactor: 2,
		},
		V1s: {
			relativeMargin: 0.001,
			significantDigitMargin: 1,
			checkUnitSize: true,
		},
		V2s: {
			relativeMargin: 0.001,
			significantDigitMargin: 1,
			checkUnitSize: true,
		},
		p1s: {
			relativeMargin: 0.001,
			significantDigitMargin: 1,
			checkUnitSize: true,
		},
		p2s: {
			relativeMargin: 0.001,
			significantDigitMargin: 1,
			checkUnitSize: true,
		},
	},
}
addSetupFromSteps(metaData)

function generateState() {
	// Determine volumes, ensuring they are nice round numbers.
	let V1 = getRandomFloatUnit({
		min: 150,
		max: 900,
		decimals: -1,
		unit: 'm^3',
	})
	const pressureRatio = getRandomNumber(7, 11)
	const V2 = V1.multiply(Math.pow(pressureRatio, 1 / k)).roundToPrecision()
	V1 = V1.setDecimals(0)

	// Determine corresponding pressures.
	const p2 = new FloatUnit('1.0 bar')
	const p1 = p2.multiply(Math.pow(V2.number / V1.number, k)).setDecimals(1).roundToPrecision()

	return { p1, p2, V1, V2 }
}

function getSolution({ p1, p2, V1, V2 }) {
	const V1s = V1
	const V2s = V2
	const p1s = p1.simplify()
	const p2s = p2.simplify()
	const Q = new FloatUnit('0 J')
	const W = p2s.multiply(V2s).subtract(p1s.multiply(V1s)).multiply(-1 / (k.number - 1)).setUnit('J')
	return { process: 3, eq: 6, k, p1s, p2s, V1s, V2s, Q, W }
}

function checkInput(exerciseData, step, substep) {
	switch (step) {
		case 1:
			return performComparison(exerciseData, 'process')
		case 2:
			return performComparison(exerciseData, 'eq')
		case 3:
			return performComparison(exerciseData, 'k')
		case 4:
			switch (substep) {
				case 1:
					return performComparison(exerciseData, ['V1s', 'V2s'])
				case 2:
					return performComparison(exerciseData, ['p1s', 'p2s'])
			}
		default:
			return performComparison(exerciseData, ['Q', 'W'])
	}
}

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getStepExerciseProcessor(exercise),
}
