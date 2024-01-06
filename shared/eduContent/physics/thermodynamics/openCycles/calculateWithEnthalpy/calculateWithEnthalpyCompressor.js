const { getRandom } = require('../../../../../util')
const { getRandomFloatUnit } = require('../../../../../inputTypes')
let { air: { Rs, k, cp } } = require('../../../../../data/gasProperties')
const { getStepExerciseProcessor, addSetupFromSteps, performComparison } = require('../../../../../eduTools')

const metaData = {
	skill: 'calculateWithEnthalpy',
	steps: ['solveLinearEquation', 'solveLinearEquation'],
	comparison: {
		default: {
			relativeMargin: 0.01,
			significantDigitMargin: 1,
		},
	},
}
addSetupFromSteps(metaData)

function generateState() {
	const n = getRandom(1.2, 1.38)
	const pressureRatio = getRandom(6, 9)
	const T1 = getRandomFloatUnit({
		min: 5,
		max: 25,
		decimals: 0,
		unit: 'dC',
	})
	const T2 = T1.simplify().multiply(Math.pow(pressureRatio, 1 - 1 / k.number)).setUnit('dC').roundToPrecision()
	const wt = Rs.multiply(-n / (n - 1)).multiply(T2.subtract(T1)).setUnit('kJ/kg')

	return { T1, T2, wt }
}

function getSolution({ T1, T2, wt }) {
	const wts = wt.simplify()
	cp = cp.simplify()
	const dh = cp.multiply(T2.subtract(T1)).setUnit('J/kg')
	const q = dh.add(wts)
	return { cp, wts, dh, q }
}

function checkInput(exerciseData, step) {
	switch (step) {
		case 1:
			return performComparison(exerciseData, 'dh')
		default:
			return performComparison(exerciseData, 'q')
	}
}

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getStepExerciseProcessor(exercise),
}
