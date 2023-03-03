const { getRandom } = require('../../../util/random')
const { Unit } = require('../../../inputTypes/Unit')
const { getRandomFloatUnit } = require('../../../inputTypes/FloatUnit')
let { air: { Rs, cv } } = require('../../../data/gasProperties')

const { getStepExerciseProcessor, addSetupFromSteps } = require('../util/stepExercise')
const { performComparison } = require('../util/comparison')

const data = {
	skill: 'calculateHeatAndWork',
	steps: ['recognizeProcessTypes', null, ['specificGasConstant', 'specificHeats'], null, ['calculateWithMass', 'calculateWithTemperature'], null],

	comparison: {
		m: {
			relativeMargin: 0.001,
			unitCheck: Unit.equalityTypes.exact,
		},
		T1: {
			absoluteMargin: 0.7,
			significantDigitMargin: 2,
		},
		T2: {
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
addSetupFromSteps(data)

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
	m = m.simplify()
	cv = cv.simplify()
	const c = cv.subtract(Rs.divide(n.number - 1))
	const mdT = m.multiply(T2.subtract(T1))
	const Q = mdT.multiply(c).setUnit('J')
	const W = mdT.multiply(Rs).divide(1 - n.number).setUnit('J')
	return { process: 4, eq: 9, Rs, cv, n, m, c, T1, T2, Q, W }
}

function checkInput(state, input, step, substep) {
	const solution = getSolution(state)
	switch (step) {
		case 1:
			return input.process === solution.process
		case 2:
			return input.eq === solution.eq
		case 3:
			switch (substep) {
				case 1: return performComparison('Rs', input, solution, data.comparison)
				case 2: return performComparison('cv', input, solution, data.comparison)
			}
		case 4:
				return performComparison('c', input, solution, data.comparison)
		case 5:
			switch (substep) {
				case 1: return performComparison('m', input, solution, data.comparison)
				case 2: return performComparison(['T1','T2'], input, solution, data.comparison)
			}
		default:
			return performComparison(['Q', 'W'], input, solution, data.comparison)
	}
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	checkInput,
	getSolution,
}
