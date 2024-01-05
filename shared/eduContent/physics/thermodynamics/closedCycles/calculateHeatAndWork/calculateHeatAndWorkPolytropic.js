const { getRandom } = require('../../../../../util')
const { Unit, getRandomFloatUnit } = require('../../../../../inputTypes')
let { air: { Rs, cv } } = require('../../../../../data/gasProperties')
const { getStepExerciseProcessor, addSetupFromSteps, performComparison } = require('../../../../../eduTools')

const metaData = {
	skill: 'calculateHeatAndWork',
	steps: ['recognizeProcessTypes', null, ['specificGasConstant', 'specificHeats'], null, ['calculateWithMass', 'calculateWithTemperature'], null],
	comparison: {
		ms: {
			relativeMargin: 0.001,
			unitCheck: Unit.equalityTypes.exact,
		},
		T1s: {
			absoluteMargin: 0.7,
			significantDigitMargin: 2,
		},
		T2s: {
			absoluteMargin: 0.7,
			significantDigitMargin: 2,
		},
		Rs: {
			relativeMargin: 0.01,
			accuracyFactor: 2,
		},
		cv: {
			relativeMargin: 0.01,
			accuracyFactor: 2,
		},
		c: {
			relativeMargin: 0.02,
			significantDigitMargin: 2,
			accuracyFactor: 3,
		},
		Q: {
			relativeMargin: 0.02,
			significantDigitMargin: 2,
			accuracyFactor: 3,
		},
		W: {
			relativeMargin: 0.02,
			significantDigitMargin: 2,
			accuracyFactor: 3,
		},
	},
}
addSetupFromSteps(metaData)

function generateState() {
	const n = getRandomFloatUnit({
		min: 1.1,
		max: 1.35,
		decimals: 2,
		unit: '',
	})
	const m = getRandomFloatUnit({
		min: 0.3,
		max: 1.5,
		significantDigits: 2,
		unit: 'g',
	})
	const T1 = getRandomFloatUnit({
		min: 5,
		max: 30,
		significantDigits: 2,
		unit: 'dC',
	})
	const pressureRatio = getRandom(2, 4)
	const T2 = T1.setUnit('K').multiply(Math.pow(pressureRatio, (1 - 1 / n.number))).setUnit('dC').roundToPrecision()

	return { m, T1, T2, n }
}

function getSolution({ m, T1, T2, n }) {
	const ms = m.simplify()
	const T1s = T1
	const T2s = T2
	cv = cv.simplify()
	const c = cv.subtract(Rs.divide(n.number - 1))
	const mdT = m.multiply(T2s.subtract(T1s))
	const Q = mdT.multiply(c).setUnit('J')
	const W = mdT.multiply(Rs).divide(1 - n.number).setUnit('J')
	return { process: 4, eq: 9, Rs, cv, n, ms, c, T1s, T2s, Q, W }
}

function checkInput(exerciseData, step, substep) {
	switch (step) {
		case 1:
			return performComparison(exerciseData, 'process')
		case 2:
			return performComparison(exerciseData, 'eq')
		case 3:
			switch (substep) {
				case 1:
					return performComparison(exerciseData, 'Rs')
				case 2:
					return performComparison(exerciseData, 'cv')
			}
		case 4:
			return performComparison(exerciseData, 'c')
		case 5:
			switch (substep) {
				case 1:
					return performComparison(exerciseData, 'ms')
				case 2:
					return performComparison(exerciseData, ['T1s', 'T2s'])
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
