const { numberArray, getRandomBoolean, getRandomInteger } = require('../../../util')
const { getRandomFloatUnit } = require('../../../inputTypes/FloatUnit')
const { Variable } = require('../../../CAS')
const { Vector } = require('../../../geometry')

const { getStepExerciseProcessor } = require('../util/stepExercise')
const { performComparison } = require('../util/comparison')
const { loadSources, loadTypes, getDefaultForce, getDefaultMoment, decomposeForce } = require('../util/engineeringMechanics')

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
	const up = getRandomBoolean()
	const right = getRandomBoolean()
	const horizontal = getRandomBoolean()
	const FD = getRandomFloatUnit({ min: 3, max: 18, significantDigits: 2, unit: 'kN' })

	// Run checks.
	if (points.some((point, index) => points.some((otherPoint, otherIndex) => index < otherIndex && point.equals(otherPoint))))
		return generateState()
	const index = (up === right ? -1 : 1)
	if (points[1].x + index * points[1].y === points[2].x + index * points[2].y) // FB and FC same diagonal?
		return generateState()

	// Assemble the state.
	return { points, up, right, horizontal, FD }
}

function getSolution(state) {
	const { points, up, right, horizontal, FD } = state
	const [A, B, C, D] = points
	const method = 2
	const angle = (up ? -1 : 1) * Math.PI / 2 + (up === right ? 1 : -1) * Math.PI / 4 // The angle of FA.

	// Define loads and their names.
	const forceLength = 1.25
	const loads = [
		getDefaultForce(A, angle, input, undefined, forceLength),
		getDefaultForce(B, angle + Math.PI / 2, reaction, undefined, forceLength),
		getDefaultForce(C, angle - Math.PI / 2, reaction, undefined, forceLength),
		getDefaultForce(D, (horizontal ? (right ? 1 : 0) : (up ? 1 / 2 : -1 / 2)) * Math.PI, external, undefined, forceLength),
	]
	const pointNames = ['A', 'B', 'C', 'D']
	const loadNames = loads.map((load, index) => ({ load, variable: new Variable(`${load.type === loadTypes.moment ? 'M' : 'F'}_(${pointNames[index]})`), point: points[index] }))

	// Decompose load and attach names.
	let decomposedLoads = [
		...loads.slice(0, 3),
		[
			getDefaultForce(D, angle + Math.PI, external, undefined, forceLength / Math.sqrt(2)),
			getDefaultForce(D, angle + Math.PI + ((up + right + horizontal) % 2 === 0 ? -1 : 1) * Math.PI / 2, external, undefined, forceLength / Math.sqrt(2)),
		]
	]
	loads.map(load => decomposeForce(load))
	let decomposedLoadNames = decomposedLoads.map((load, index) => Array.isArray(load) ? [
		{ load: load[0], variable: new Variable(`F_(${pointNames[index]}l)`), point: points[index] },
		{ load: load[1], variable: new Variable(`F_(${pointNames[index]}p)`), point: points[index] },
	] : ({ load, variable: new Variable(`${load.type === loadTypes.moment ? 'M' : 'F'}_(${pointNames[index]})`), point: points[index] }))
	decomposedLoads = decomposedLoads.flat()
	decomposedLoadNames = decomposedLoadNames.flat()

	// Calculate solution values.
	const FDl = FD.divide(Math.sqrt(2))
	const FA = FDl

	return { ...state, points, A, B, C, D, angle, method, loads, loadNames, decomposedLoads, decomposedLoadNames, FDl, FA }
}

function checkInput(state, input, step) {
	const solution = getSolution(state)
	if (step === 0 || step === 3)
		return performComparison('FA', input, solution, data.comparison)
	if (step === 1)
		return performComparison('method', input, solution, data.comparison)
	if (step === 2)
		return performComparison('FDl', input, solution, data.comparison)
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	checkInput,
	getSolution,
}
