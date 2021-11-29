const { FloatUnit } = require('../../../inputTypes/FloatUnit')
const { getStepExerciseProcessor } = require('../util/stepExercise')
const { combinerAnd } = require('../../../skillTracking')
const { air: { k, cp } } = require('../../../data/gasProperties')
const { performComparison } = require('../util/check')
const { getCycle } = require('./support/gasTurbineCycle')

const data = {
	skill: 'analyseGasTurbine',
	setup: combinerAnd('calculateOpenCycle', 'useIsentropicEfficiency', 'createOpenCycleEnergyOverview', 'calculateWithEfficiency', 'massFlowTrick'),
	steps: ['calculateOpenCycle', 'useIsentropicEfficiency', 'createOpenCycleEnergyOverview', ['calculateWithEfficiency', 'massFlowTrick']],

	equalityOptions: {
		default: {
			relativeMargin: 0.01,
			significantDigitMargin: 1,
			accuracyFactor: 1.5,
		},
		eta: {
			relativeMargin: 0.02,
			significantDigitMargin: 1,
			accuracyFactor: 1.5,
		},
	},
}

function generateState() {
	let { p1, T1, p2, T3, etai, P } = getCycle()
	p1 = p1.setDecimals(0).roundToPrecision().setMinimumSignificantDigits(2)
	p2 = p2.setDecimals(0).roundToPrecision().setMinimumSignificantDigits(2)
	T1 = T1.setDecimals(0).roundToPrecision()
	T3 = T3.setDecimals(-1).roundToPrecision().setDecimals(0)
	etai = etai.setUnit('%').setDecimals(0).roundToPrecision()
	P = P.setSignificantDigits(2).roundToPrecision()
	return { p1, p2, T1, T3, etai, P }
}

function getSolution({ p1, T1, p2, T3, etai, P }) {
	etai = etai.simplify()
	P = P.simplify()

	// Pressure.
	const p3 = p2
	const p4 = p1
	const ratio = p2.number / p1.number

	// Temperature.
	const T2p = T1.multiply(Math.pow(ratio, 1 - 1 / k.number)).setDecimals(0)
	const T2 = T1.add(T2p.subtract(T1).divide(etai)).setDecimals(0)
	const T4p = T3.divide(Math.pow(ratio, 1 - 1 / k.number)).setDecimals(0)
	const T4 = T3.add(T4p.subtract(T3).multiply(etai)).setDecimals(0)

	// Heat and work.
	const q12 = new FloatUnit('0 J/kg')
	const wt12 = cp.multiply(T1.subtract(T2)).setUnit('J/kg')
	const q23 = cp.multiply(T3.subtract(T2)).setUnit('J/kg')
	const wt23 = new FloatUnit('0 J/kg')
	const q34 = new FloatUnit('0 J/kg')
	const wt34 = cp.multiply(T3.subtract(T4)).setUnit('J/kg')
	const q41 = cp.multiply(T1.subtract(T4)).setUnit('J/kg')
	const wt41 = new FloatUnit('0 J/kg')
	const wn = wt12.add(wt23).add(wt34).add(wt41)
	const qin = q23
	const eta = wn.divide(qin).setUnit('')

	// Mass flow.
	const mdot = P.divide(wn).setUnit('kg/s')

	return { k, cp, p1, T1, p2, T2, T2p, p3, T3, p4, T4, T4p, etai, q12, wt12, q23, wt23, q34, wt34, q41, wt41, wn, qin, eta, mdot, P }
}

function checkInput(state, input, step, substep) {
	const solution = getSolution(state)
	switch (step) {
		case 1:
			return performComparison(['p1', 'T1', 'p2', 'T2p', 'p3', 'T3', 'p4', 'T4p'], input, solution, data.equalityOptions)
		case 2:
			return performComparison(['T2', 'T4'], input, solution, data.equalityOptions)
		case 3:
			return performComparison(['q12', 'wt12', 'q23', 'wt23', 'q34', 'wt34', 'q41', 'wt41'], input, solution, data.equalityOptions)
		case 4:
			switch (substep) {
				case 1:
					return performComparison(['eta'], input, solution, data.equalityOptions)
				case 2:
					return performComparison(['mdot'], input, solution, data.equalityOptions)
			}
		default:
			return performComparison(['eta', 'mdot'], input, solution, data.equalityOptions)
	}
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	checkInput,
	getSolution,
}
