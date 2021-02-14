const { FloatUnit } = require('../../../inputTypes/FloatUnit')
const { getStepExerciseProcessor } = require('../util/stepExercise')
const { combinerAnd, combinerRepeat } = require('../../../skillTracking')
const { air: { k, cp } } = require('../../../data/gasProperties')
const { checkParameter } = require('../util/check')
const { getCycle } = require('./support/gasTurbineCycle')

const data = {
	skill: 'analyseGasTurbine',
	setup: combinerAnd(combinerRepeat('poissonsLaw', 2), combinerRepeat('useIsentropicEfficiency', 2), combinerRepeat('calculateSpecificHeatAndMechanicalWork', 2), 'calculateWithEfficiency', 'massFlowTrick'),
	steps: ['poissonsLaw', 'useIsentropicEfficiency', 'calculateSpecificHeatAndMechanicalWork', 'poissonsLaw', 'useIsentropicEfficiency', 'calculateSpecificHeatAndMechanicalWork', ['calculateWithEfficiency', 'massFlowTrick']],

	equalityOptions: {
		default: {
			relativeMargin: 0.01,
			significantDigitMargin: 1,
			accuracyFactor: 1.5,
		},
		eta: {
			relativeMargin: 0.02,
			significantDigitMargin: 1,
			accuracyFactor: 2,
		},
	},
}

function generateState() {
	let { p1, T1, p2, q23, etai, mdot } = getCycle()
	p1 = p1.setDecimals(0).roundToPrecision().setMinimumSignificantDigits(2)
	p2 = p2.setDecimals(0).roundToPrecision().setMinimumSignificantDigits(2)
	T1 = T1.setDecimals(0).roundToPrecision()
	q23 = q23.setSignificantDigits(3).roundToPrecision()
	etai = etai.setUnit('%').setDecimals(0).roundToPrecision()
	mdot = mdot.setSignificantDigits(2).roundToPrecision()
	return { p1, T1, p2, q23, etai, mdot }
}

function getCorrect({ p1, T1, p2, q23, etai, mdot }) {
	etai = etai.simplify()

	// Pressure.
	const p3 = p2
	const p4 = p1
	const ratio = p2.number / p1.number

	// Step 1-2.
	const T2p = T1.multiply(Math.pow(ratio, 1 - 1 / k.number)).setDecimals(0)
	const T2 = T1.add(T2p.subtract(T1).divide(etai)).setDecimals(0)

	// Step 2-3.
	const T3 = T2.add(q23.divide(cp)).setUnit('K')

	// Step 3-4.
	const T4p = T3.divide(Math.pow(ratio, 1 - 1 / k.number)).setDecimals(0)
	const T4 = T3.add(T4p.subtract(T3).multiply(etai)).setDecimals(0)

	// Heat and work.
	const q12 = new FloatUnit('0 J/kg')
	const wt12 = cp.multiply(T1.subtract(T2)).setUnit('J/kg')
	const wt23 = new FloatUnit('0 J/kg')
	const q34 = new FloatUnit('0 J/kg')
	const wt34 = cp.multiply(T3.subtract(T4)).setUnit('J/kg')
	const q41 = cp.multiply(T1.subtract(T4)).setUnit('J/kg')
	const wt41 = new FloatUnit('0 J/kg')
	const wn = wt12.add(wt23).add(wt34).add(wt41)
	const qin = q23
	const eta = wn.divide(qin).setUnit('')

	// Power.
	const P = mdot.multiply(wn).setUnit('W')

	return { k, cp, p1, T1, p2, T2, T2p, p3, T3, p4, T4, T4p, etai, q12, wt12, q23, wt23, q34, wt34, q41, wt41, wn, qin, eta, mdot, P }
}

function checkInput(state, input, step, substep) {
	const correct = getCorrect(state)
	switch (step) {
		case 1:
			return checkParameter('T2p', correct, input, data.equalityOptions)
		case 2:
			return checkParameter('T2', correct, input, data.equalityOptions)
		case 3:
			return checkParameter('T3', correct, input, data.equalityOptions)
		case 4:
			return checkParameter('T4p', correct, input, data.equalityOptions)
		case 5:
			return checkParameter('T4', correct, input, data.equalityOptions)
		case 6:
			return checkParameter('wn', correct, input, data.equalityOptions)
		case 7:
			switch (substep) {
				case 1:
					return checkParameter(['eta'], correct, input, data.equalityOptions)
				case 2:
					return checkParameter(['P'], correct, input, data.equalityOptions)
			}
		default:
			return checkParameter(['eta', 'P'], correct, input, data.equalityOptions)
	}
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	checkInput,
	getCorrect,
}
