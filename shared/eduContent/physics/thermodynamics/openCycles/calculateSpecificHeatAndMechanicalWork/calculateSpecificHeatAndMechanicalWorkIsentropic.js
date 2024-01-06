const { getRandom } = require('../../../../../util')
const { FloatUnit, getRandomFloatUnit } = require('../../../../../inputTypes')
const { air: { k } } = require('../../../../../data/gasProperties')
const { getStepExerciseProcessor, addSetupFromSteps, performComparison } = require('../../../../../eduTools')

const metaData = {
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
addSetupFromSteps(metaData)

function generateState() {
	// Determine volumes, ensuring they are nice round numbers.
	let v2o = getRandomFloatUnit({
		min: 1.5,
		max: 1.8,
		decimals: 1,
		unit: 'm^3/kg',
	})
	const pressureRatio = getRandom(7, 11)
	const v1o = v2o.multiply(Math.pow(1 / pressureRatio, 1 / k)).roundToPrecision()

	// Determine corresponding pressures.
	const p2o = new FloatUnit('1.0 bar')
	const p1o = p2o.multiply(Math.pow(v2o.number / v1o.number, k)).setDecimals(1).roundToPrecision()

	return { p1o, p2o, v1o, v2o }
}

function getSolution({ p1o, p2o, v1o, v2o }) {
	const p1 = p1o.simplify()
	const p2 = p2o.simplify()
	const v1 = v1o
	const v2 = v2o
	const q = new FloatUnit('0 J/kg')
	const wt = p2.multiply(v2).subtract(p1.multiply(v1)).multiply(-k.number / (k.number - 1)).setUnit('J/kg')
	return { process: 3, eq: 6, k, p1, p2, v1, v2, q, wt }
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
					return performComparison(exerciseData, ['v1', 'v2'])
				case 2:
					return performComparison(exerciseData, ['p1', 'p2'])
			}
		default:
			return performComparison(exerciseData, ['q', 'wt'])
	}
}

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getStepExerciseProcessor(exercise),
}
