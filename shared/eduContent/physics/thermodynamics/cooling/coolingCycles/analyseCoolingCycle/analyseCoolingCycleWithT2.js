const { refrigerants, getBoilingTemperature, getRefrigerantPropertiesFromTemperature, getRefrigerantPropertiesFromEntropy } = require('@step-wise/physics-data')
const { getStepExerciseProcessor, addSetupFromSteps, performComparison } = require('../../../../../../eduTools')

const { getCycle } = require('../tools')

const hComparison = {
	float: {
		absoluteTolerance: 4000, // J/kg*K.
		significantDigitTolerance: 2,
	},
}
const factorComparison = {
	float: {
		absoluteTolerance: 0.4,
		relativeTolerance: 0.05,
		significantDigitTolerance: 2,
	},
}
const metaData = {
	skill: 'analyseCoolingCycle',
	steps: ['createCoolingCycleOverview', ['calculateWithCOP', 'useIsentropicEfficiency', 'massFlowTrick']],
	comparison: {
		h1: hComparison,
		h2p: hComparison,
		h2: hComparison,
		h3: hComparison,
		h4: hComparison,
		etai: {
			float: {
				absoluteTolerance: 0.04,
				significantDigitTolerance: 2,
			},
		},
		epsilon: factorComparison,
		COP: factorComparison,
		P: {
			float: {
				relativeTolerance: 0.1,
				significantDigitTolerance: 2,
			},
		},
	},
}
addSetupFromSteps(metaData)

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
	const refrigerantData = refrigerants[refrigerant]
	const TEvap = getBoilingTemperature(refrigerantData, pEvap).setDecimals(0)
	const TCond = getBoilingTemperature(refrigerantData, pCond).setDecimals(0)
	const T1 = TEvap.add(dTSuperheating)
	const T3 = TCond.subtract(dTSubcooling)

	// Get points.
	const point1 = getRefrigerantPropertiesFromTemperature(refrigerantData, pEvap, T1)
	const point2p = getRefrigerantPropertiesFromEntropy(refrigerantData, pCond, point1.entropy)
	const point2 = getRefrigerantPropertiesFromTemperature(refrigerantData, pCond, T2)
	const point3 = getRefrigerantPropertiesFromTemperature(refrigerantData, pCond, T3)

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

function checkInput(exerciseData, step, substep) {
	switch (step) {
		case 1:
			return performComparison(exerciseData, ['h1', 'h2p', 'h2', 'h3', 'h4'])
		case 2:
			switch (substep) {
				case 1:
					return performComparison(exerciseData, ['epsilon', 'COP'])
				case 2:
					return performComparison(exerciseData, 'etai')
				case 3:
					return performComparison(exerciseData, 'P')
			}
		default:
			return performComparison(exerciseData, ['epsilon', 'COP', 'etai', 'P'])
	}
}

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getStepExerciseProcessor(exercise),
}
