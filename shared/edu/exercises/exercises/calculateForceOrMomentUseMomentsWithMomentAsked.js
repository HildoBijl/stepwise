const { deg2rad } = require('../../../util/numbers')
const { numberArray } = require('../../../util/arrays')
const { getRandomBoolean, getRandomInteger } = require('../../../util/random')
const { FloatUnit, getRandomFloatUnit } = require('../../../inputTypes/FloatUnit')
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
	const angle = getRandomInteger(5, 13, [9]) * 5 // Do not allow 45 degrees.
	const up = getRandomBoolean() // For FD.
	const right = getRandomBoolean() // For FD.
	const FD = getRandomFloatUnit({ min: 3, max: 18, significantDigits: 2, unit: 'kN' })

	// Run checks.
	if (points.some((point, index) => points.some((otherPoint, otherIndex) => index < otherIndex && point.equals(otherPoint))))
		return generateState()
	if (points[3].x === points[1].x || points[3].y === points[2].y) // The given force has a component passing through the intersection.
		return generateState()
	if (points[0].x === points[1].x && points[0].y === points[2].y) // The moment is acting on the intersection. This confuses one of the multiple-choice answers.
		return generateState()

	// Assemble the state.
	return { points, angle, up, right, FD }
}

function getSolution(state) {
	const { points, angle, up, right, FD } = state
	const [A, B, C, D] = points
	const angleRad = deg2rad(angle)
	const method = 4

	// Calculate the moment.
	const FDx = FD.multiply(Math.sin(angleRad))
	const FDy = FD.multiply(Math.cos(angleRad))
	const intersection = new Vector(points[1].x, points[2].y)
	const rD = D.subtract(intersection)
	const rDx = new FloatUnit(`${Math.abs(rD.y)} m`).setSignificantDigits(2)
	const rDy = new FloatUnit(`${Math.abs(rD.x)} m`).setSignificantDigits(2)
	const MDx = FDx.multiply(rDx).multiply(right === (rD.y > 0) ? -1 : 1)
	const MDy = FDy.multiply(rDy).multiply(up === (rD.x > 0) ? -1 : 1)
	const MD = MDx.add(MDy)
	if (MD.number === 0)
		throw new Error(`Invalid exercise state: the moment of the given force around the force intersection is zero. This may never be the case.`)

	// Define loads and their names.
	const clockwise = (MD.number < 0)
	const forceLength = 1.25
	const loads = [
		getDefaultMoment(A, clockwise, 0, input),
		getDefaultForce(B, Math.PI / 2, reaction, undefined, forceLength),
		getDefaultForce(C, 0, reaction, undefined, forceLength),
		getDefaultForce(D, (up ? -1 : 1) * Math.PI / 2 + (right === up ? 1 : -1) * angleRad, external, undefined, forceLength),
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
	const MA = MD.abs().setSignificantDigits(2)

	return { ...state, points, A, B, C, D, angleRad, method, loads, loadNames, decomposedLoads, decomposedLoadNames, intersection, clockwise, FDx, FDy, rDx, rDy, MDx, MDy, MD, MA }
}

function checkInput(state, input, step) {
	const solution = getSolution(state)
	if (step === 0 || step === 3)
		return performComparison('MA', input, solution, data.comparison)
	if (step === 1)
		return performComparison('method', input, solution, data.comparison)
	if (step === 2)
		return performComparison(['FDx', 'FDy'], input, solution, data.comparison)
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	checkInput,
	getSolution,
}
