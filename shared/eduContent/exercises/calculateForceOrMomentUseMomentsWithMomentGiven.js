const { deg2rad, getRandomBoolean, getRandomInteger } = require('../../util')
const { FloatUnit, getRandomFloatUnit } = require('../../inputTypes')
const { Variable } = require('../../CAS')
const { Vector } = require('../../geometry')
const { getStepExerciseProcessor, performComparison } = require('../../eduTools')

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
	const getRandomPoint = () => new Vector(getRandomInteger(0, 4), getRandomInteger(0, 4))
	const intersection = getRandomPoint()
	const lowerBound = Math.max(-intersection.x, -intersection.y)
	const upperBound = Math.min(4 - intersection.x, 4 - intersection.y)
	if (lowerBound === 0 && upperBound === 0)
		return generateState()
	const shift = getRandomInteger(lowerBound, upperBound, [0])
	const points = [
		new Vector(getRandomInteger(0, 4, [intersection.x]), intersection.y),
		new Vector(intersection.x, getRandomInteger(0, 4, [intersection.y])),
		new Vector(intersection.x + shift, intersection.y + shift),
		getRandomPoint(),
	]
	const angle = getRandomInteger(5, 13) * 5
	const up = getRandomBoolean()
	const right = getRandomBoolean()
	const MD = getRandomFloatUnit({ min: 3, max: 18, significantDigits: 2, unit: 'kN*m' })

	// Run checks.
	if (points.some((point, index) => points.some((otherPoint, otherIndex) => index < otherIndex && point.equals(otherPoint))))
		return generateState()
	if (intersection.equals(points[0]))
		return generateState()

	// Assemble the state.
	return { points, angle, up, right, MD }
}

function getSolution(state) {
	const { points, angle, up, right, MD } = state
	const [A, B, C, D] = points
	const angleRad = deg2rad(angle)
	const method = 4

	// Calculate solution values.
	const intersection = new Vector(B.x, C.y + (B.x - C.x))
	const rA = A.x - intersection.x
	const rAy = new FloatUnit(`${Math.abs(rA)} m`).setSignificantDigits(2)
	const FAy = MD.divide(rAy)
	const FA = FAy.divide(Math.cos(angleRad))
	const clockwise = (rA > 0) === up

	// Define loads and their names.
	const forceLength = 1.25
	const loads = [
		getDefaultForce(A, (up ? -1 : 1) * Math.PI / 2 + (up === right ? 1 : -1) * angleRad, input, undefined, forceLength),
		getDefaultForce(B, Math.PI / 2, reaction, undefined, forceLength),
		getDefaultForce(C, -Math.PI * 3 / 4, reaction, undefined, forceLength),
		getDefaultMoment(D, clockwise, 0, external),
	]
	const pointNames = ['A', 'B', 'C', 'D']
	const loadNames = loads.map((load, index) => ({ load, variable: new Variable(`${load.type === loadTypes.moment ? 'M' : 'F'}_(${pointNames[index]})`), point: points[index] }))

	// Decompose load and attach names.
	let decomposedLoads = loads.map((load, index) => (index === 0 ? decomposeForce(load) : load))
	let decomposedLoadNames = decomposedLoads.map((load, index) => Array.isArray(load) ? [
		{ load: load[0], variable: new Variable(`F_(${pointNames[index]}x)`), point: points[index] },
		{ load: load[1], variable: new Variable(`F_(${pointNames[index]}y)`), point: points[index] },
	] : ({ load, variable: new Variable(`${load.type === loadTypes.moment ? 'M' : 'F'}_(${pointNames[index]})`), point: points[index] }))
	decomposedLoads = decomposedLoads.flat()
	decomposedLoadNames = decomposedLoadNames.flat()

	return { ...state, points, A, B, C, D, angleRad, method, loads, loadNames, decomposedLoads, decomposedLoadNames, intersection, clockwise, rA, rAy, FAy, FA }
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
