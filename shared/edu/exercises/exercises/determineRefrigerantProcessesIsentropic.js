const { selectRandomly, getRandomBoolean } = require('../../../util/random')
const { getRandomFloatUnit, getRandomExponentialFloatUnit } = require('../../../inputTypes/FloatUnit')
const { getSimpleExerciseProcessor } = require('../util/simpleExercise')
const { performComparison } = require('../util/check')
const refrigerantProperties = require('../../../data/refrigerantProperties')

const data = {
	skill: 'determineRefrigerantProcesses',
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
	const minPressure = refrigerantData.dataByPressure[0].pressure.setUnit('bar').number
	const maxPressure = refrigerantData.criticalPoint.pressure.setUnit('bar').number * 0.8
	const pressures = [
		getRandomExponentialFloatUnit({ min: minPressure, max: minPressure * 6, unit: 'bar' }),
		getRandomExponentialFloatUnit({ min: maxPressure / 6, max: maxPressure, unit: 'bar' }),
	]
	const finalEnthalpy = getRandomFloatUnit({ min: 350, max: 500, unit: 'kJ/kg' })
	let points = []
	points[1] = refrigerantProperties.getProperties(pressures[1], finalEnthalpy, refrigerantData)
	points[0] = refrigerantProperties.getProperties(pressures[0], points[1].entropy, refrigerantData)

	// Possibly switch points.
	const switchPoints = getRandomBoolean()
	if (switchPoints)
		points = points.reverse()

	// Assemble the state of the exercise, first for point 1.
	const state = { refrigerant }
	state.phase1 = points[0].phase
	state.T1 = points[0].temperature.setDecimals(0).roundToPrecision()
	if (points[0].phase === 'vapor')
		state.x1 = points[0].vaporFraction.setDecimals(2).roundToPrecision()
	else
		state.p1 = points[0].pressure.setSignificantDigits(2).roundToPrecision()

	// Continue with point 2.
	state.p2 = points[1].pressure.setSignificantDigits(2).roundToPrecision()

	// All done!
	return state
}

function getSolution({ refrigerant, phase1, T1, x1, p1, p2 }) {
	const refrigerantData = refrigerantProperties[refrigerant]

	// Determine point 1.
	const point1 = phase1 === 'vapor' ?
		refrigerantProperties.getVaporProperties(T1, x1, refrigerantData) :
		refrigerantProperties.getProperties(p1, T1, refrigerantData)

	// Determine point 2.
	const point2 = refrigerantProperties.getProperties(p2, point1.entropy, refrigerantData)

	return {
		refrigerant,
		phase1,
		p1: point1.pressure.setSignificantDigits(2),
		T1: point1.temperature.setDecimals(0),
		x1: point1.vaporFraction && point1.vaporFraction.setDecimals(2),
		h1: point1.enthalpy.setDecimals(0),
		s1: point1.entropy.setDecimals(2),
		phase2,
		p2: point2.pressure.setSignificantDigits(2),
		T2: point2.temperature.setDecimals(0),
		x2: point2.vaporFraction && point2.vaporFraction.setDecimals(2),
		h2: point2.enthalpy.setDecimals(0),
		s2: point2.entropy.setDecimals(2),
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