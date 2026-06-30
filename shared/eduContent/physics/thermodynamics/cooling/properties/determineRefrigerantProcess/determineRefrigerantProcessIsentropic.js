const { sample, getRandomBoolean } = require('@step-wise/utils')
const { getRandomFloatUnit, getRandomExponentialFloatUnit } = require('@step-wise/physics-core')
const { refrigerants, getRefrigerantPropertiesFromTemperature, getRefrigerantPropertiesFromEnthalpy, getRefrigerantPropertiesFromEntropy, getVaporPropertiesFromTemperature, getVaporPropertiesFromPressure } = require('@step-wise/physics-data')
const { buildSimpleExercise } = require('@step-wise/input-exercises')
const { performComparison } = require('../../../../../../eduTools')

const metaData = {
	skill: 'determineRefrigerantProcess',
	comparison: {
		default: {
			float: {
				absoluteTolerance: 4000, // J/kg*K.
				significantDigitTolerance: 2,
			},
		},
	},
}

function generateState() {
	// Determine the refrigerant.
	const refrigerant = sample(Object.keys(refrigerants))
	const refrigerantData = refrigerants[refrigerant]

	// Determine two points.
	const minPressure = refrigerantData.tablesByPressure[0].pressure.setUnit('bar').number
	const maxPressure = refrigerantData.criticalPoint.pressure.setUnit('bar').number * 0.8
	const pressures = [
		getRandomExponentialFloatUnit({ min: minPressure, max: minPressure * 6, unit: 'bar' }),
		getRandomExponentialFloatUnit({ min: maxPressure / 6, max: maxPressure, unit: 'bar' }),
	]
	const finalEnthalpy = getRandomFloatUnit({ min: 350, max: 500, unit: 'kJ/kg' })
	let points = []
	points[1] = getRefrigerantPropertiesFromEnthalpy(refrigerantData, pressures[1], finalEnthalpy)
	if (!points[1]) return generateState() // On a flaky point, try again.
	points[0] = getRefrigerantPropertiesFromEntropy(refrigerantData, pressures[0], points[1].entropy)
	if (!points[0]) return generateState() // On a flaky point, try again.

	// Possibly switch points.
	const switchPoints = getRandomBoolean()
	if (switchPoints)
		points = points.reverse()

	// Assemble the state of the exercise, first for point 1.
	const state = { refrigerant }
	state.phase1 = points[0].phase
	state.T1 = points[0].temperature.setDecimals(0).roundToPrecision()
	if (points[0].phase === 'vapor')
		state.x1 = points[0].vaporFraction.setDecimals(2).roundToPrecision().setDisplayPower(0)
	else
		state.p1 = points[0].pressure.setSignificantDigits(2).roundToPrecision()

	// Continue with point 2.
	state.p2 = points[1].pressure.setSignificantDigits(2).roundToPrecision()

	// Check if a solution can be generated. If not, redo.
	try {
		getSolution(state)
	} catch (e) {
		return generateState()
	}

	// All done!
	return state
}

function getSolution({ refrigerant, phase1, T1, x1, p1, p2 }) {
	const refrigerantData = refrigerants[refrigerant]

	// Determine point 1.
	const point1 = phase1 === 'vapor' ?
		getVaporPropertiesFromTemperature(refrigerantData, T1, x1) :
		getRefrigerantPropertiesFromTemperature(refrigerantData, p1, T1)
		
	// Determine point 2.
	const point2 = getRefrigerantPropertiesFromEntropy(refrigerantData, p2, point1.entropy)

	return {
		refrigerant,
		phase1,
		p1: point1.pressure.setSignificantDigits(2),
		T1: point1.temperature.setDecimals(0),
		x1: point1.vaporFraction && point1.vaporFraction.setDecimals(2).setDisplayPower(0),
		h1: point1.enthalpy.setDecimals(0),
		s1: point1.entropy.setDecimals(2),
		phase2: point2.phase,
		p2: point2.pressure.setSignificantDigits(2),
		T2: point2.temperature.setDecimals(0),
		x2: point2.vaporFraction && point2.vaporFraction.setDecimals(2).setDisplayPower(0),
		h2: point2.enthalpy.setDecimals(0),
		s2: point2.entropy.setDecimals(2),
	}
}

function checkInput(exerciseData) {
	return performComparison(exerciseData, ['h1', 'h2'])
}

module.exports = buildSimpleExercise({ metaData, generateState, getSolution, checkInput })
