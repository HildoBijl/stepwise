const { getRandomBoolean, getRandomInteger } = require('../../../util/random')
const { Vector } = require('../../../geometry/Vector')

const { getStepExerciseProcessor, addSetupFromSteps } = require('../util/stepExercise')
const { performComparison } = require('../util/comparison')
const { loadSources, areLoadsMatching, FBDComparison, getDefaultForce, getDefaultMoment } = require('../util/engineeringMechanics')

const { reaction, external } = loadSources

const data = {
	skill: 'drawFreeBodyDiagram',
	steps: ['schematizeSupport', 'schematizeSupport', null],
	comparison: {
		default: (input, correct) => areLoadsMatching(input, correct, FBDComparison)
	},
}
addSetupFromSteps(data)

function generateState() {
	// Determine the beam size.
	const distances = [
		getRandomBoolean() ? 0 : getRandomInteger(2, 4),
		getRandomInteger(4, 8),
		getRandomBoolean() ? 0 : getRandomInteger(2, 4),
	]

	// Determine the support types.
	const support1 = getRandomInteger(0, 3)
	const support2 = getRandomInteger(0, 3, [support1]) // Ensure they're different.
	const supportTypes = [support1, support2]

	// Determine the load properties.
	const loadPositionIndex = getRandomInteger(distances[0] === 0 ? 1 : 0, distances[2] === 0 ? 1 : 2) // 0 is left, 1 is middle, 2 is right.
	const loadProperties = {
		isForce: getRandomBoolean(),
		isPositiveDirection: getRandomBoolean(),
		position: [
			0,
			distances[0] + getRandomInteger(2, distances[1] - 2),
			distances[0] + distances[1] + distances[2],
		][loadPositionIndex]
	}

	// Assemble the state.
	return { distances, supportTypes, loadProperties }
}

function getSolution(state) {
	const { distances, supportTypes, loadProperties } = state

	// Define the usual points.
	const left = new Vector(0, 0)
	const A = left.add(new Vector(distances[0], 0))
	const B = A.add(new Vector(distances[1], 0))
	const right = B.add(new Vector(distances[2], 0))
	const points = [left, A, B, right]
	const isAEnd = left.equals(A)
	const isBEnd = right.equals(B)

	// Determine the external load location.
	const loadPositionIndex = (loadProperties.position === 0 ? 0 : (loadProperties.position === right.x ? 2 : 1))
	const loadPoint = new Vector(loadProperties.position, 0)
	if (loadPositionIndex === 1)
		points.splice(2, 0, loadPoint)

	// Determine the external load.
	const externalLoad = loadProperties.isForce ?
		getDefaultForce(loadPoint, loadProperties.isPositiveDirection ? Math.PI / 2 : -Math.PI / 2, external) :
		getDefaultMoment(loadPoint, loadProperties.isPositiveDirection, loadPositionIndex === 0 ? 0 : Math.PI, external)

	// Determine the solution.
	const loadsLeft = getReactionLoads(supportTypes[0], A, isAEnd, true)
	const loadsRight = getReactionLoads(supportTypes[1], B, isBEnd, !isBEnd)
	const loads = [...loadsLeft, ...loadsRight, externalLoad]

	// Assemble everything.
	return { ...state, left, A, B, right, points, isAEnd, isBEnd, loadPositionIndex, loadPoint, externalLoad, loadsLeft, loadsRight, loads }
}

function getReactionLoads(supportType, point = Vector.zero, rotated = false, toRight = true, clockwise = true) {
	// Define the possible loads.
	const horizontal = getDefaultForce(point, toRight ? 0 : Math.PI, reaction)
	const vertical = getDefaultForce(point, -Math.PI / 2, reaction)
	const moment = getDefaultMoment(point, toRight, toRight ? 0 : Math.PI, reaction)

	// Return the right loads.
	switch (supportType) {
		case 0: // Fixed.
			return [horizontal, vertical, moment]
		case 1: // Hinge.
			return [horizontal, vertical]
		case 2: // Roller.
			return [rotated ? horizontal : vertical, moment]
		case 3: // RollerHinge.
			return [rotated ? horizontal : vertical]
		default:
			throw new Error(`Invalid support type: could not get the reaction loads of the support with type ${supportType}.`)
	}
}

function checkInput(state, input, step) {
	const solution = getSolution(state)
	if (step === 0)
		return performComparison('loads', input, solution, data.comparison)
	if (step === 1)
		return performComparison('loadsLeft', input, solution, data.comparison)
	if (step === 2)
		return performComparison('loadsRight', input, solution, data.comparison)
	if (step === 3)
		return performComparison('loads', input, solution, data.comparison)
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	getSolution,
	checkInput,
}