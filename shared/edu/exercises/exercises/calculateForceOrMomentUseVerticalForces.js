const { deg2rad, numberArray, getRandomBoolean, getRandomInteger } = require('../../../util')
const { getRandomFloatUnit } = require('../../../inputTypes/FloatUnit')
const { Variable } = require('../../../CAS')
const { Vector } = require('../../../geometry')
const { getStepExerciseProcessor, performComparison } = require('../../../eduTools')

const { loadSources, loadTypes, getDefaultForce, decomposeForce } = require('../util/engineeringMechanics')

const { reaction, external, input } = loadSources

const data = {
	skill: 'calculateForceOrMoment',
	steps: [null, null, null], // ToDo later: add steps, once they have been implemented.
	comparison: {
		default: {
			relativeMargin: 0.01,
			significantDigitMargin: 1,
		},
		method: {},
	},
}

function generateState() {
	// Generate state.
	const points = numberArray(0, 3).map(() => new Vector(getRandomInteger(0, 4), getRandomInteger(0, 4)))
	const angle = getRandomInteger(5, 13) * 5
	const up = getRandomBoolean()
	const FD = getRandomFloatUnit({ min: 3, max: 18, significantDigits: 2, unit: 'kN' })

	// Run checks.
	if (points.some((point, index) => points.some((otherPoint, otherIndex) => index < otherIndex && point.equals(otherPoint))))
		return generateState()
	if (points[1].y === points[2].y)
		return generateState()

	// Assemble the state.
	return { points, angle, up, FD }
}

function getSolution(state) {
	const { points, angle, up, FD } = state
	const [A, B, C, D] = points
	const angleRad = deg2rad(angle)
	const method = 1

	// Define loads and their names.
	const forceLength = 1.25
	const loads = [
		getDefaultForce(A, (up ? 1 : -1) * Math.PI / 2 - angleRad, input, undefined, forceLength),
		getDefaultForce(B, 0, reaction, undefined, forceLength),
		getDefaultForce(C, Math.PI, reaction, undefined, forceLength),
		getDefaultForce(D, (up ? -1 : 1) * Math.PI / 2, external, undefined, forceLength),
	]
	const pointNames = ['A', 'B', 'C', 'D']
	const loadNames = loads.map((load, index) => ({ load, variable: new Variable(`${load.type === loadTypes.moment ? 'M' : 'F'}_(${pointNames[index]})`), point: points[index] }))

	// Decompose load and attach names.
	let decomposedLoads = loads.map(load => decomposeForce(load))
	let decomposedLoadNames = decomposedLoads.map((load, index) => Array.isArray(load) ? [
		{ load: load[0], variable: new Variable(`F_(${pointNames[index]}x)`), point: points[index] },
		{ load: load[1], variable: new Variable(`F_(${pointNames[index]}y)`), point: points[index] },
	] : ({ load, variable: new Variable(`${load.type === loadTypes.moment ? 'M' : 'F'}_(${pointNames[index]})`), point: points[index] }))
	decomposedLoads = decomposedLoads.flat()
	decomposedLoadNames = decomposedLoadNames.flat()

	// Calculate solution values.
	const FAy = FD
	const FA = FAy.divide(Math.cos(angleRad))

	return { ...state, points, A, B, C, D, angleRad, method, loads, loadNames, decomposedLoads, decomposedLoadNames, FAy, FA }
}

function checkInput(state, input, step) {
	const solution = getSolution(state)
	if (step === 0 || step === 3)
		return performComparison('FA', input, solution, data.comparison)
	if (step === 1)
		return performComparison('method', input, solution, data.comparison)
	if (step === 2)
		return performComparison('FAy', input, solution, data.comparison)
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	checkInput,
	getSolution,
}
