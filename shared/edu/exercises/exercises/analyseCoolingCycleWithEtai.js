const { getStepExerciseProcessor } = require('../util/stepExercise')
const { combinerAnd } = require('../../../skillTracking')
const { performComparison } = require('../util/comparison')
const { getCycle } = require('./support/fridgeCycle')
const refrigerantProperties = require('../../../data/refrigerantProperties')

const hEqualityOptions = {
	absoluteMargin: 4000, // J/kg*K.
	significantDigitMargin: 2,
}
const factorEqualityOptions = {
	absoluteMargin: 0.3,
	relativeMargin: 0.05,
	significantDigitMargin: 2,
}
const data = {
	skill: 'analyseCoolingCycle',
	setup: combinerAnd('createCoolingCycleOverview', 'useIsentropicEfficiency', 'calculateWithCOP', 'massFlowTrick'),
	steps: ['createCoolingCycleOverview', 'useIsentropicEfficiency', ['calculateWithCOP', 'massFlowTrick']],

	equalityOptions: {
		h1: hEqualityOptions,
		h2p: hEqualityOptions,
		h2: hEqualityOptions,
		h3: hEqualityOptions,
		h4: hEqualityOptions,
		epsilon: factorEqualityOptions,
		COP: factorEqualityOptions,
		mdot: {
			relativeMargin: 0.1,
			significantDigitMargin: 2,
		},
	},
}

function generateState() {
	let { refrigerant, TCold, TWarm, dTCold, dTWarm, dTSuperheating, dTSubcooling, etai, P } = getCycle()
	TCold = TCold.setDecimals(0).roundToPrecision()
	TWarm = TWarm.setDecimals(0).roundToPrecision()
	dTCold = dTCold.setDecimals(0).roundToPrecision()
	dTWarm = dTWarm.setDecimals(0).roundToPrecision()
	dTSuperheating = dTSuperheating.setDecimals(0).roundToPrecision()
	dTSubcooling = dTSubcooling.setDecimals(0).roundToPrecision()
	etai = etai.setDecimals(2).roundToPrecision()
	P = P.setUnit('kW').setSignificantDigits(2).roundToPrecision()
	return { refrigerant, TCold, TWarm, dTCold, dTWarm, dTSuperheating, dTSubcooling, etai, P }
}

function getSolution({ refrigerant, TCold, TWarm, dTCold, dTWarm, dTSuperheating, dTSubcooling, etai, P }) {
	// Get temperatures.
	const refrigerantData = refrigerantProperties[refrigerant]
	const TEvap = TCold.subtract(dTCold)
	const TCond = TWarm.add(dTWarm)
	const T1 = TEvap.add(dTSuperheating)
	const T3 = TCond.subtract(dTSubcooling)

	// Get pressures.
	const pEvap = refrigerantProperties.getBoilingPressure(TEvap, refrigerantData).setSignificantDigits(2)
	const pCond = refrigerantProperties.getBoilingPressure(TCond, refrigerantData).setSignificantDigits(2)

	// Get points.
	const point1 = refrigerantProperties.getProperties(pEvap, T1, refrigerantData)
	const point2p = refrigerantProperties.getProperties(pCond, point1.entropy, refrigerantData)
	const point3 = refrigerantProperties.getProperties(pCond, T3, refrigerantData)

	// Extract enthalpies.
	const h1 = point1.enthalpy.setUnit('kJ/kg').setDecimals(0)
	const h2p = point2p.enthalpy.setUnit('kJ/kg').setDecimals(0)
	const h3 = point3.enthalpy.setUnit('kJ/kg').setDecimals(0)
	const h4 = h3
	const s1 = point1.entropy.setUnit('kJ/kg*K').setDecimals(2)

	// Apply isentropic efficiency.
	const wtp = h2p.subtract(h1)
	const wt = wtp.divide(etai)
	const h2 = h1.add(wt)

	// Determine heat, work and efficiency.
	const qin = h1.subtract(h4)
	const qout = h2.subtract(h3)
	const epsilon = qin.divide(wt).setUnit('')
	const COP = qout.divide(wt).setUnit('')

	// Determine mass flow.
	const mdot = P.divide(wt).setUnit('kg/s')

	// Return all data.
	return { refrigerant, TCold, TWarm, dTCold, dTWarm, dTSuperheating, dTSubcooling, TEvap, TCond, pEvap, pCond, T1, T3, h1, h2, h2p, h3, h4, s1, wtp, wt, etai, qin, qout, epsilon, COP, mdot, P }
}

function checkInput(state, input, step, substep) {
	const solution = getSolution(state)
	switch (step) {
		case 1:
			return performComparison(['h1', 'h2p', 'h3', 'h4'], input, solution, data.equalityOptions)
		case 2:
			return performComparison('h2', input, solution, data.equalityOptions)
		case 3:
			switch (substep) {
				case 1:
					return performComparison(['epsilon', 'COP'], input, solution, data.equalityOptions)
				case 2:
					return performComparison('mdot', input, solution, data.equalityOptions)
			}
		default:
			return performComparison(['epsilon', 'COP', 'mdot'], input, solution, data.equalityOptions)
	}
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	checkInput,
	getSolution,
}
