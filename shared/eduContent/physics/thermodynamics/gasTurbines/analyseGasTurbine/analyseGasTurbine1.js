const { FloatUnit } = require('../../../../../inputTypes')
const { air: { k, cp } } = require('../../../../../data/gasProperties')
const { getStepExerciseProcessor, addSetupFromSteps, performComparison } = require('../../../../../eduTools')

const { getCycle } = require('..')

const metaData = {
	skill: 'analyseGasTurbine',
	steps: ['calculateOpenCycle', 'useIsentropicEfficiency', 'createOpenCycleEnergyOverview', ['calculateWithEfficiency', 'massFlowTrick']],
	comparison: {
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
addSetupFromSteps(metaData)

function generateState() {
	let { p1, T1, p2, T3, etai: etaio, P: Po } = getCycle()
	p1 = p1.setDecimals(0).roundToPrecision().setMinimumSignificantDigits(2)
	p2 = p2.setDecimals(0).roundToPrecision().setMinimumSignificantDigits(2)
	T1 = T1.setDecimals(0).roundToPrecision()
	T3 = T3.setDecimals(-1).roundToPrecision().setDecimals(0)
	etaio = etaio.setUnit('%').setDecimals(0).roundToPrecision()
	Po = Po.setSignificantDigits(2).roundToPrecision()
	return { p1, p2, T1, T3, etaio, Po }
}

function getSolution({ p1, T1, p2, T3, etaio, Po }) {
	etai = etaio.simplify()
	P = Po.simplify()

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

function checkInput(exerciseData, step, substep) {
	switch (step) {
		case 1:
			return performComparison(exerciseData, ['p1', 'T1', 'p2', 'T2p', 'p3', 'T3', 'p4', 'T4p'])
		case 2:
			return performComparison(exerciseData, ['T2', 'T4'])
		case 3:
			return performComparison(exerciseData, ['q12', 'wt12', 'q23', 'wt23', 'q34', 'wt34', 'q41', 'wt41'])
		case 4:
			switch (substep) {
				case 1:
					return performComparison(exerciseData, 'eta')
				case 2:
					return performComparison(exerciseData, 'mdot')
			}
		default:
			return performComparison(exerciseData, ['eta', 'mdot'])
	}
}

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getStepExerciseProcessor(exercise),
}
