const { FloatUnit, getRandomFloatUnit } = require('../../../../../inputTypes')
const { air: { cv, cp, Rs } } = require('../../../../../data/gasProperties')
const { getStepExerciseProcessor, addSetupFromSteps, performComparison } = require('../../../../../eduTools')

const metaData = {
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
addSetupFromSteps(metaData)

function generateState() {
	const n = getRandomFloatUnit({
		min: 1.26,
		max: 1.38,
		significantDigits: 3,
		unit: '',
	})
	const T1o = getRandomFloatUnit({
		min: 5,
		max: 30,
		decimals: 0,
		unit: 'dC',
	})
	const p1o = new FloatUnit('1.0 bar')
	const p2o = getRandomFloatUnit({
		min: 6,
		max: 11,
		significantDigits: 2,
		unit: 'bar',
	})

	return { p1o, T1o, p2o, n }
}

function getSolution({ p1o, T1o, p2o, n }) {
	const p1 = p1o
	const p2 = p2o
	const T1 = T1o.simplify()
	const T2 = T1.multiply(p2.divide(p1).float.toPower((n.number - 1) / n.number)).setDecimals(0)
	const ds = cp.multiply(Math.log(T2.number / T1.number)).subtract(Rs.multiply(Math.log(p2.number / p1.number))).setSignificantDigits(2)
	const c = cv.subtract(Rs.divide(n.number - 1)).setSignificantDigits(3)
	return { p1, p2, T1, T2, ds, cv, cp, Rs, c }
}

function checkInput(exerciseData, step, substep) {
	switch (step) {
		case 1:
			return performComparison(exerciseData, 'T2')
		case 2:
			switch (substep) {
				case 1:
					return performComparison(exerciseData, 'Rs')
				case 2:
					return performComparison(exerciseData, 'cp')

			}
		default:
			return performComparison(exerciseData, 'ds')
	}
}

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getStepExerciseProcessor(exercise),
}
