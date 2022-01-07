const { selectRandomly, getRandomBoolean } = require('../../../util/random')
const { getRandomFloatUnit, getRandomExponentialFloatUnit } = require('../../../inputTypes/FloatUnit')
const { getSimpleExerciseProcessor } = require('../util/simpleExercise')
const { performComparison } = require('../util/check')
const refrigerantProperties = require('../../../data/refrigerantProperties')

const data = {
	skill: 'determineRefrigerantProcess',
	equalityOptions: {
		default: {
			absoluteMargin: 4000, // J/kg*K.
			significantDigitMargin: 2,
		},
	},
}

function generateState() {
	// Determine the refrigerant.
	const refrigerant = selectRandomly(refrigerantProperties.types)
	const refrigerantData = refrigerantProperties[refrigerant]

	// Determine two points.
	const pressure = getRandomExponentialFloatUnit({
		min: refrigerantData.dataByPressure[0].pressure.setUnit('bar').number,
		max: refrigerantData.criticalPoint.pressure.setUnit('bar').number * 0.8,
		unit: 'bar',
	})
	let enthalpies = [
		getRandomFloatUnit({ min: 150, max: 300, unit: 'kJ/kg' }),
		getRandomFloatUnit({ min: 350, max: 500, unit: 'kJ/kg' })
	]
	const switchPoints = getRandomBoolean()
	if (switchPoints)
		enthalpies = enthalpies.reverse()
	const points = enthalpies.map(enthalpy => refrigerantProperties.getProperties(pressure, enthalpy, refrigerantData))

	// Assemble the state of the exercise, first for point 1.
	const state = { refrigerant }
	state.phase1 = points[0].phase
	state.T1 = points[0].temperature.setDecimals(0).roundToPrecision()
	if (points[0].phase === 'vapor')
		state.x1 = points[0].vaporFraction.setDecimals(2).roundToPrecision()
	else
		state.p1 = points[0].pressure.setSignificantDigits(2).roundToPrecision()

	// Continue with point 2.
	state.phase2 = points[1].phase
	if (points[1].phase === 'vapor')
		state.x2 = points[1].vaporFraction.setDecimals(2).roundToPrecision()
	else
		state.T2 = points[1].temperature.setDecimals(0).roundToPrecision()

	// All done!
	return state
}

function getSolution({ refrigerant, phase1, T1, x1, p1, phase2, x2, T2 }) {
	const refrigerantData = refrigerantProperties[refrigerant]

	// Determine point 1.
	const point1 = phase1 === 'vapor' ?
		refrigerantProperties.getVaporProperties(T1, x1, refrigerantData) :
		refrigerantProperties.getProperties(p1, T1, refrigerantData)

	// Determine point 2.
	const point2 = phase2 === 'vapor' ?
		refrigerantProperties.getVaporProperties(point1.pressure, x2, refrigerantData) :
		refrigerantProperties.getProperties(point1.pressure, T2, refrigerantData)

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

function checkInput(state, input) {
	const solution = getSolution(state)
	return performComparison(['h1', 'h2'], input, solution, data.equalityOptions)
}

module.exports = {
	data,
	generateState,
	processAction: getSimpleExerciseProcessor(checkInput, data),
	checkInput,
	getSolution,
}