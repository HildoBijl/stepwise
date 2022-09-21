const { deg2rad } = require('../../../util/numbers')
const { getRandomBoolean, getRandomInteger } = require('../../../util/random')
const { Vector } = require('../../../geometry/Vector')

const { getStepExerciseProcessor } = require('../util/stepExercise')
const { performComparison } = require('../util/comparison')
const { loadSources, getDefaultForce, getDefaultMoment } = require('../util/engineeringMechanics')

const { reaction, external } = loadSources

const data = {
	skill: 'drawFreeBodyDiagram',
	steps: ['schematizeSupport', 'schematizeSupport', null],
	comparison: {
		default: (input, correct) => areLoadsMatching(input, correct, FBDComparison)
	},
}

function generateState() {
	// Determine the beam size.
	const distances = [
		getRandomBoolean() ? 0 : getRandomInteger(2, 4),
		getRandomInteger(4, 8),
		getRandomBoolean() ? 0 : getRandomInteger(2, 4),
	]

	// Determine the support types.
	const supportTypes = [
		getRandomInteger(0, 3),
		getRandomInteger(0, 3),
	]

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

	// Determine the external load location.
	const loadPositionIndex = (loadProperties.position === 0 ? 0 : (loadProperties.position === right.x ? 2 : 1))
	const loadPoint = new Vector(loadProperties.position, 0)
	if (loadPositionIndex === 1)
		points.splice(2, 0, loadPoint)

	// Determine the external load.
	const externalLoad = loadProperties.isForce ?
		getDefaultForce(loadPoint, loadProperties.isPositiveDirection ? Math.PI / 2 : Math.PI * 2, external) :
		getDefaultMoment(loadPoint, loadProperties.isPositiveDirection, loadPositionIndex === 0 ? 0 : Math.PI, external)

	// Determine the solution.
	loadsLeft = getReactionLoads(supportTypes[0], A)
	loadsRight = getReactionLoads(supportTypes[1], B)
	const loads = [...loadsLeft, ...loadsRight, externalLoad]

	// Assemble everything.
	return { ...state, left, A, B, right, points, loadPositionIndex, loadPoint, externalLoad, loadsLeft, loadsRight, loads }
}

function getReactionLoads(supportType, point = Vector.zero, angle = 0, clockwise = true, opening = 0) {
	// Define the possible loads.
	const horizontal = getDefaultForce(point, angle, reaction)
	const vertical = getDefaultForce(point, angle - Math.PI / 2, reaction)
	const moment = getDefaultMoment(point, clockwise, opening + angle, reaction)

	// Return the right loads.
	switch (supportType) {
		case 0: // Fixed.
			return [horizontal, vertical, moment]
		case 1: // Hinge.
			return [horizontal, vertical]
		case 2: // Roller.
			return [vertical, moment]
		case 3: // RollerHinge.
			return [vertical]
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