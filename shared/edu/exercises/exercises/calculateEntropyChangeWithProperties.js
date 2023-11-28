const { FloatUnit, getRandomFloatUnit } = require('../../../inputTypes')
const { air: { cv, cp, Rs } } = require('../../../data/gasProperties')
const { getStepExerciseProcessor, addSetupFromSteps, performComparison } = require('../../../eduTools')

const data = {
	skill: 'calculateEntropyChange',
	steps: ['calculateWithTemperature', ['specificGasConstant', 'specificHeats'], 'solveLinearEquation'],

	comparison: {
		default: {
			relativeMargin: 0.01,
			significantDigitMargin: 1,
			accuracyFactor: 2,
		},
		Rs: {
			relativeMargin: 0.02,
		},
		cp: {
			relativeMargin: 0.02,
		},
	},
}
addSetupFromSteps(data)

function generateState() {
	const n = getRandomFloatUnit({
		min: 1.26,
		max: 1.38,
		significantDigits: 3,
		unit: '',
	})
	const T1 = getRandomFloatUnit({
		min: 5,
		max: 30,
		decimals: 0,
		unit: 'dC',
	})
	const p1 = new FloatUnit('1.0 bar')
	const p2 = getRandomFloatUnit({
		min: 6,
		max: 11,
		significantDigits: 2,
		unit: 'bar',
	})

	return { p1, T1, p2, n }
}

function getSolution({ p1, T1, p2, n }) {
	T1 = T1.simplify()
	const T2 = T1.multiply(p2.divide(p1).float.toPower((n.number - 1) / n.number)).setDecimals(0)
	const ds = cp.multiply(Math.log(T2.number / T1.number)).subtract(Rs.multiply(Math.log(p2.number / p1.number))).setSignificantDigits(2)
	const c = cv.subtract(Rs.divide(n.number - 1)).setSignificantDigits(3)
	return { n, p1, p2, T1, T2, ds, cv, cp, Rs, c }
}

function checkInput(state, input, step, substep) {
	const solution = getSolution(state)
	switch (step) {
		case 1:
			return performComparison('T2', input, solution, data.comparison)
		case 2:
			switch (substep) {
				case 1:
					return performComparison('Rs', input, solution, data.comparison)
				case 2:
					return performComparison('cp', input, solution, data.comparison)
			}
		default:
			return performComparison('ds', input, solution, data.comparison)
	}
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	checkInput,
	getSolution,
}
