const { multiOutputTableInterpolate } = require('@step-wise/interpolation')
const { saturatedSteamByPressure, superheatedSteam } = require('@step-wise/physics-data')
const { buildStepExercise, stepsToSetup } = require('@step-wise/input-exercises')
const { performComparison } = require('../../../../../../eduTools')

const { getCycle } = require('../tools')

const metaData = {
	skill: 'createRankineCycleOverview',
	...stepsToSetup(['lookUpSteamProperties', undefined, 'lookUpSteamProperties', 'recognizeProcessTypes', 'useVaporFraction']),
	compare: {
		FloatUnit: {
			float: {
				relativeTolerance: 0.002,
				significantDigitTolerance: 2,
			},
		},
	},
}

function generateState() {
	let { pc, pe, T2 } = getCycle()
	pc = pc.setSignificantDigits(2).roundToPrecision()
	pe = pe.setDecimals(0).roundToPrecision()
	T2 = T2.setDecimals(0).roundToPrecision()
	return { pc, pe, T2 }
}

function getSolution({ pc, pe, T2 }) {
	// Get liquid and vapor points.
	const { enthalpyLiquid: hx0, enthalpyVapor: hx1, entropyLiquid: sx0, entropyVapor: sx1 } = multiOutputTableInterpolate(pc, saturatedSteamByPressure)

	// Find points 1 and 4.
	const h1 = hx0
	const s1 = sx0
	const h4 = h1
	const s4 = s1

	// Find point 2.
	const { enthalpy: h2, entropy: s2 } = multiOutputTableInterpolate([pe, T2], superheatedSteam)

	// Find point 3.
	const s3 = s2
	const x3 = s3.subtract(sx0).divide(sx1.subtract(sx0)).setUnit('')
	const h3 = hx0.add(x3.multiply(hx1.subtract(hx0)))

	// Return all data.
	return { hx0, hx1, sx0, sx1, h1, s1, h2, s2, h3, s3, x3, h4, s4 }
}

function checkInput(data, step) {
	switch (step) {
		case 1:
			return compare('h4', data)
		case 2:
			return compare('h1', data)
		case 3:
			return compare(['h2', 's2'], data)
		case 4:
			return compare('s3', data)
		case 5:
			return compare('h3', data)
		default:
			return compare(['h1', 'h2', 'h3', 'h4'], data)
	}
}

module.exports = buildStepExercise({ metaData, generateState, getSolution, checkInput })
