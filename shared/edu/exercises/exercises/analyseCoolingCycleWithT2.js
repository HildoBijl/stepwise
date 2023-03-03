const refrigerantProperties = require('../../../data/refrigerantProperties')

const { getStepExerciseProcessor, addSetupFromSteps } = require('../util/stepExercise')
const { performComparison } = require('../util/comparison')

const { getCycle } = require('./support/fridgeCycle')

const hComparison = {
	absoluteMargin: 4000, // J/kg*K.
	significantDigitMargin: 2,
}
const factorComparison = {
	absoluteMargin: 0.4,
	relativeMargin: 0.05,
	significantDigitMargin: 2,
}
const data = {
	skill: 'analyseCoolingCycle',
	steps: ['createCoolingCycleOverview', ['calculateWithCOP', 'useIsentropicEfficiency', 'massFlowTrick']],

	comparison: {
		h1: hComparison,
		h2p: hComparison,
		h2: hComparison,
		h3: hComparison,
		h4: hComparison,
		etai: {
			absoluteMargin: 0.04,
			significantDigitMargin: 2,
		},
		epsilon: factorComparison,
		COP: factorComparison,
		P: {
			relativeMargin: 0.1,
			significantDigitMargin: 2,
		},
	},
}
addSetupFromSteps(data)

function generateState() {
	let { refrigerant, pEvap, pCond, dTSuperheating, dTSubcooling, mdot, point2 } = getCycle()
	pEvap = pEvap.setUnit('bar').setSignificantDigits(2).roundToPrecision()
	pCond = pCond.setUnit('bar').setSignificantDigits(2).roundToPrecision()
	dTSuperheating = dTSuperheating.setDecimals(0).roundToPrecision()
	dTSubcooling = dTSubcooling.setDecimals(0).roundToPrecision()
	const T2 = point2.temperature.setDecimals(0).roundToPrecision()
	mdot = mdot.setUnit('g/s').setDecimals(0).roundToPrecision()
	return { refrigerant, pEvap, pCond, dTSuperheating, dTSubcooling, T2, mdot }
}

function getSolution({ refrigerant, pEvap, pCond, dTSuperheating, dTSubcooling, T2, mdot }) {
	// Get temperatures.
	const refrigerantData = refrigerantProperties[refrigerant]
	const TEvap = refrigerantProperties.getBoilingTemperature(pEvap, refrigerantData).setDecimals(0)
	const TCond = refrigerantProperties.getBoilingTemperature(pCond, refrigerantData).setDecimals(0)
	const T1 = TEvap.add(dTSuperheating)
	const T3 = TCond.subtract(dTSubcooling)

	// Get points.
	const point1 = refrigerantProperties.getProperties(pEvap, T1, refrigerantData)
	const point2p = refrigerantProperties.getProperties(pCond, point1.entropy, refrigerantData)
	const point2 = refrigerantProperties.getProperties(pCond, T2, refrigerantData)
	const point3 = refrigerantProperties.getProperties(pCond, T3, refrigerantData)

	// Extract enthalpies.
	const h1 = point1.enthalpy.setUnit('kJ/kg').setDecimals(0)
	const h2p = point2p.enthalpy.setUnit('kJ/kg').setDecimals(0)
	const h2 = point2.enthalpy.setUnit('kJ/kg').setDecimals(0)
	const h3 = point3.enthalpy.setUnit('kJ/kg').setDecimals(0)
	const h4 = h3
	const s1 = point1.entropy.setUnit('kJ/kg*K').setDecimals(2)

	// Calculate isentropic efficiency.
	const wtp = h2p.subtract(h1)
	const wt = h2.subtract(h1)
	const etai = wtp.divide(wt).setUnit('')

	// Determine heat, work and efficiency.
	const qin = h1.subtract(h4)
	const qout = h2.subtract(h3)
	const epsilon = qin.divide(wt).setUnit('')
	const COP = qout.divide(wt).setUnit('')

	// Determine power.
	mdot = mdot.setUnit('kg/s')
	const P = mdot.multiply(wt).setUnit('kW')

	// Return all data.
	return { refrigerant, pEvap, pCond, dTSuperheating, dTSubcooling, TEvap, TCond, T1, T2, T3, h1, h2, h2p, h3, h4, s1, wtp, wt, etai, qin, qout, epsilon, COP, mdot, P }
}

function checkInput(state, input, step, substep) {
	const solution = getSolution(state)
	switch (step) {
		case 1:
			return performComparison(['h1', 'h2p', 'h2', 'h3', 'h4'], input, solution, data.comparison)
		case 2:
			switch (substep) {
				case 1:
					return performComparison(['epsilon', 'COP'], input, solution, data.comparison)
				case 2:
					return performComparison('etai', input, solution, data.comparison)
				case 3:
					return performComparison('P', input, solution, data.comparison)
			}
		default:
			return performComparison(['epsilon', 'COP', 'etai', 'P'], input, solution, data.comparison)
	}
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	checkInput,
	getSolution,
}
