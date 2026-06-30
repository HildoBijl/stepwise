const { sample, getRandomBoolean } = require('@step-wise/utils')
const { getRandomFloatUnit, getRandomExponentialFloatUnit } = require('@step-wise/physics-core')
const { refrigerants, getRefrigerantPropertiesFromTemperature, getRefrigerantPropertiesFromEnthalpy, getVaporPropertiesFromTemperature, getVaporPropertiesFromPressure } = require('@step-wise/physics-data')
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
	const pressure = getRandomExponentialFloatUnit({
		min: refrigerantData.tablesByPressure[0].pressure.setUnit('bar').number,
		max: refrigerantData.criticalPoint.pressure.setUnit('bar').number * 0.8,
		unit: 'bar',
	})
	let enthalpies = [
		getRandomFloatUnit({ min: 150, max: 300, unit: 'kJ/kg' }),
		getRandomFloatUnit({ min: 350, max: 500, unit: 'kJ/kg' }),
	]
	const switchPoints = getRandomBoolean()
	if (switchPoints)
		enthalpies = enthalpies.reverse()
	const points = enthalpies.map(enthalpy => getRefrigerantPropertiesFromEnthalpy(refrigerantData, pressure, enthalpy))
	if (!points[0] || !points[1]) return generateState()

	// Assemble the state of the exercise, first for point 1.
	const state = { refrigerant }
	state.phase1 = points[0].phase
	state.T1 = points[0].temperature.setDecimals(0).roundToPrecision()
	if (points[0].phase === 'vapor')
		state.x1 = points[0].vaporFraction.setDecimals(2).roundToPrecision().setDisplayPower(0)
	else
		state.p1 = points[0].pressure.setSignificantDigits(2).roundToPrecision()

	// Continue with point 2.
	state.phase2 = points[1].phase
	if (points[1].phase === 'vapor')
		state.x2 = points[1].vaporFraction.setDecimals(2).roundToPrecision().setDisplayPower(0)
	else
		state.T2 = points[1].temperature.setDecimals(0).roundToPrecision()

	// Check if a solution can be generated. If not, redo.
	try {
		getSolution(state)
	} catch (e) {
		return generateState()
	}

	// All done!
	return state
}

function getSolution({ refrigerant, phase1, T1, x1, p1, phase2, x2, T2 }) {
	const refrigerantData = refrigerants[refrigerant]

	// Determine point 1.
	const point1 = phase1 === 'vapor' ?
		getVaporPropertiesFromTemperature(refrigerantData, T1, x1) :
		getRefrigerantPropertiesFromTemperature(refrigerantData, p1, T1)

	// Determine point 2.
	const point2 = phase2 === 'vapor' ?
		getVaporPropertiesFromPressure(refrigerantData, point1.pressure, x2) :
		getRefrigerantPropertiesFromTemperature(refrigerantData, point1.pressure, T2)

	return {
		refrigerant,
		p: point1.pressure.setSignificantDigits(2),
		phase1,
		T1: point1.temperature.setDecimals(0),
		x1: point1.vaporFraction && point1.vaporFraction.setDecimals(2),
		h1: point1.enthalpy.setDecimals(0),
		phase2,
		T2: point2.temperature.setDecimals(0),
		x2: point2.vaporFraction && point2.vaporFraction.setDecimals(2),
		h2: point2.enthalpy.setDecimals(0),
	}
}

function checkInput(exerciseData) {
	return performComparison(exerciseData, ['h1', 'h2'])
}

module.exports = buildSimpleExercise({ metaData, generateState, getSolution, checkInput })
