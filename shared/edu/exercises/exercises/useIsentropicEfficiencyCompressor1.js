const { getStepExerciseProcessor } = require('../util/stepExercise')
const { combinerAnd } = require('../../../skillTracking')
const { checkParameter } = require('../util/check')
const { air: { k, cp } } = require('../../../data/gasProperties')
const { getCycle } = require('./support/gasTurbineCycle')

const data = {
	skill: 'useIsentropicEfficiency',
	setup: combinerAnd('poissonsLaw', 'calculateSpecificHeatAndMechanicalWork', 'solveLinearEquation'),
	steps: ['poissonsLaw', 'calculateSpecificHeatAndMechanicalWork', 'solveLinearEquation'],

	equalityOptions: {
		default: {
			relativeMargin: 0.01,
			significantDigitMargin: 1,
		},
	},
}

function generateState() {
	let { p1, T1, p2, T2 } = getCycle()
	p1 = p1.setDecimals(0).roundToPrecision().setMinimumSignificantDigits(2)
	p2 = p2.setDecimals(0).roundToPrecision().setMinimumSignificantDigits(2)
	T1 = T1.setDecimals(0).roundToPrecision()
	T2 = T2.setDecimals(0).roundToPrecision()
	return { p1, p2, T1, T2 }
}

function getSolution({ p1, p2, T1, T2 }) {
	const T2p = T1.multiply(p2.divide(p1).float.toPower(1 - 1 / k.number)).setDecimals(0)
	const wt = cp.multiply(T2.subtract(T1)).setUnit('J/kg')
	const wti = cp.multiply(T2p.subtract(T1)).setUnit('J/kg')
	const etai = wti.divide(wt).setUnit('')
	return { k, cp, p1, p2, T1, T2, T2p, wt, wti, etai }
}

function checkInput(state, input, step, substep) {
	const solution = getSolution(state)
	switch (step) {
		case 1:
			return checkParameter('T2p', solution, input, data.equalityOptions)
		case 2:
			return checkParameter(['wt', 'wti'], solution, input, data.equalityOptions)
		default:
			return checkParameter('etai', solution, input, data.equalityOptions)
	}
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	checkInput,
	getSolution,
}
