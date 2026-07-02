const { getRandomNumber } = require('@step-wise/utils')
const { getRandomFloatUnit } = require('@step-wise/physics-core')
const { gasProperties: { air: { Rs, cv } } } = require('@step-wise/physics-data')
const { buildStepExercise, stepsToSetup } = require('@step-wise/input-exercises')
const { performComparison } = require('../../../../../eduTools')

const metaData = {
	skill: 'calculateHeatAndWork',
	...stepsToSetup(['recognizeProcessTypes', undefined, ['specificGasConstant', 'specificHeats'], undefined, ['calculateWithMass', 'calculateWithTemperature'], undefined]),
	comparison: {
		ms: {
			float: {
				relativeTolerance: 0.001,
			},
			unit: {
				target: 'unchanged',
			}
		},
		T1s: {
			float: {
				absoluteTolerance: 0.7,
				significantDigitTolerance: 2,
			},
		},
		T2s: {
			float: {
				absoluteTolerance: 0.7,
				significantDigitTolerance: 2,
			},
		},
		Rs: {
			float: {
				relativeTolerance: 0.01,
			},
		},
		cv: {
			float: {
				relativeTolerance: 0.01,
			},
		},
		c: {
			float: {
				relativeTolerance: 0.02,
				significantDigitTolerance: 2,
			},
		},
		Q: {
			float: {
				relativeTolerance: 0.02,
				significantDigitTolerance: 2,
			},
		},
		W: {
			float: {
				relativeTolerance: 0.02,
				significantDigitTolerance: 2,
			},
		},
		process: {},
		eq: {},
	},
}

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
	const pressureRatio = getRandomNumber(2, 4)
	const T2 = T1.setUnit('K').multiply(Math.pow(pressureRatio, (1 - 1 / n.number))).setUnit('dC').roundToPrecision()

	return { m, T1, T2, n }
}

function getSolution({ m, T1, T2, n }) {
	const ms = m.simplify()
	const T1s = T1
	const T2s = T2
	const cvSimplified = cv.simplify()
	const c = cvSimplified.subtract(Rs.divide(n.number - 1))
	const mdT = m.multiply(T2s.subtract(T1s))
	const Q = mdT.multiply(c).setUnit('J')
	const W = mdT.multiply(Rs).divide(1 - n.number).setUnit('J')
	return { process: 4, eq: 9, Rs, cv: cvSimplified, n, ms, c, T1s, T2s, Q, W }
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

module.exports = buildStepExercise({ metaData, generateState, getSolution, checkInput })
