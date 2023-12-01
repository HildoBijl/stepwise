const { selectRandomly, getRandom } = require('../../util')
const { getRandomFloatUnit } = require('../../inputTypes')
const gasProperties = require('../../data/gasProperties')
const { getStepExerciseProcessor, addSetupFromSteps, performComparison } = require('../../eduTools')

const data = {
	skill: 'calculateClosedCycle',
	steps: ['calculateProcessStep', 'calculateProcessStep'],

	comparison: {
		default: {
			relativeMargin: 0.01,
			significantDigitMargin: 1,
			accuracyFactor: 2,
		},
	},
}
addSetupFromSteps(data)

function generateState() {
	const medium = selectRandomly(['air', 'argon', 'carbonMonoxide', 'helium', 'hydrogen', 'methane', 'nitrogen', 'oxygen'])
	const V1 = getRandomFloatUnit({
		min: 20,
		max: 80,
		significantDigits: 2,
		unit: 'l',
	})
	const T1 = getRandomFloatUnit({
		min: 1,
		max: 30,
		decimals: 0,
		unit: 'dC',
	})
	const p1 = getRandomFloatUnit({
		min: 2,
		max: 3,
		significantDigits: 2,
		unit: 'bar',
	})
	const scale = getRandom(2, 4) // Increase in volume, temperature and pressure.
	const V3 = V1.multiply(scale).roundToPrecision()

	const { Rs } = gasProperties[medium]
	const m = p1.setUnit('Pa').multiply(V1.setUnit('m^3')).divide(Rs.multiply(T1.setUnit('K'))).setUnit('g').roundToPrecision()

	return { medium, m, p1, T1, V3 }
}

function getSolution({ medium, m, p1, T1, V3 }) {
	const { Rs } = gasProperties[medium]
	m = m.simplify()
	p1 = p1.simplify()
	T1 = T1.simplify()
	V3 = V3.simplify()
	const mRs = m.multiply(Rs)
	const V1 = mRs.multiply(T1).divide(p1).setUnit('m^3')
	const p3 = p1
	const T3 = p3.multiply(V3).divide(mRs).setUnit('K')
	const T2 = T3
	const V2 = V1
	const p2 = m.multiply(Rs).multiply(T2).divide(V2).setUnit('Pa')
	return { m, Rs, p1, V1, T1, p2, V2, T2, p3, V3, T3 }
}

function checkInput(state, input, step, substep) {
	const solution = getSolution(state)
	switch (step) {
		case 1:
			return performComparison(['p1', 'V1', 'T1', 'p3', 'V3', 'T3'], input, solution, data.comparison)
		case 2:
			return performComparison(['p2', 'V2', 'T2'], input, solution, data.comparison)
		default:
			return performComparison(['p1', 'V1', 'T1', 'p2', 'V2', 'T2', 'p3', 'V3', 'T3'], input, solution, data.comparison)
	}
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	checkInput,
	getSolution,
}
