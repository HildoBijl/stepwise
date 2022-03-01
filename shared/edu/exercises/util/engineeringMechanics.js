const { defaultForceLength, defaultMomentRadius, defaultMomentOpening } = require('../../../settings/engineeringMechanics')

const { ensureBoolean, processOptions } = require('../../../util/objects')
const { ensureNumber } = require('../../../util/numbers')
const { Vector, ensureVector } = require('../../../CAS/linearAlgebra')

/*
 * Define load types.
 */

const loadTypes = {
	input: 'Input',
	external: 'External',
	reaction: 'Reaction',
	internal: 'Internal',
}
module.exports.loadTypes = loadTypes

const ensureLoadType = (loadType) => {
	if (typeof loadType !== 'string')
		throw new Error(`Invalid load type: expected a string but received something of type "${typeof loadType}".`)
	if (!Object.values(loadTypes).includes(loadType))
		throw new Error(`Invalid load type: did not recognize the load type "${loadType}".`)
	return loadType
}
module.exports.ensureLoadType = ensureLoadType

/*
 * Set up default getters.
 */

// Get functionalities for default loads.
const defaultSource = 'External'
module.exports.getDefaultForce = (end, angle = 0, source = defaultSource, forceLength = defaultForceLength) => ({
	type: 'Force',
	positionedVector: new PositionedVector({ vector: Vector.fromPolar(ensureNumber(forceLength), ensureNumber(angle)), end: ensureVector(end, 2) }),
	source: ensureLoadType(source),
})
module.exports.getDefaultMoment = (position, clockwise, opening = defaultMomentOpening, source = defaultSource) => ({
	type: 'Moment',
	position: ensureVector(position, 2),
	clockwise: ensureBoolean(clockwise),
	opening: ensureNumber(opening) === undefined ? defaultMomentOpening : opening,
	source: ensureLoadType(source),
})

/*
 * Below are various checks
 */

// By default we require strict equality: everything equal.
const defaultEqualityOptions = {
	Force: {
		requireSameDirection: true,
		requireSameMagnitude: true,
		requireMatchingPoints: 2, // How many points must match? 0, 1 or 2? 0 means "free sliding along the line", 1 means shifting is allowed, 2 means exact equal (or flipped if allowed).
		requireNonZero: true, // Must all vectors be nonzero? This is to prevent weird situations where a zero vector that is along a line still counts.
	},
	Moment: {
		requireSamePosition: true,
		requireSameDirection: true,
		requireSameMagnitude: true,
		requireSameOrientation: true, // Should the opening position also be the same?
	},
}
module.exports.defaultEqualityOptions = defaultEqualityOptions

// For FBD Inputs we require a very loose equality. Vectors may be flipped, shifted, resized, etcetera. They do must have one point in common.
const FBDEqualityOptions = {
	Force: {
		requireSameDirection: false,
		requireSameMagnitude: false,
		requireMatchingPoints: 1,
		requireNonZero: true,
	},
	Moment: {
		requireSamePosition: true,
		requireSameDirection: false,
		requireSameMagnitude: false,
		requireSameOrientation: false,
	}
}
module.exports.FBDEqualityOptions = FBDEqualityOptions

function areLoadsEqual(input, solution, options = {}) {
	// On unequal types the loads are not equal.
	if (solution.type !== input.type)
		return false
	const type = solution.type

	// Extract options for this particular load, if given.
	if (options[type])
		options = options[type]
	options = processOptions(options, defaultEqualityOptions[type])

	// Check all relevant load types.
	switch (type) {
		case 'Force':
			const solutionPV = solution.positionedVector
			const inputPV = input.positionedVector

			// Check the magnitude.
			if (options.requireSameMagnitude && solutionPV.vector.squaredMagnitude !== inputPV.vector.squaredMagnitude)
				return false

			// Check zero vectors.
			if (options.requireNonZero && (solutionPV.vector.isZero() || inputPV.vector.isZero()))
				return false

			// Check line and direction.
			if (!solutionPV.alongEqualLine(inputPV, options.requireSameDirection))
				return false

			// Check matching points.
			if (options.requireMatchingPoints === 1 && !solutionPV.hasMatchingPoint(inputPV))
				return false
			if (options.requireMatchingPoints === 2 && !solutionPV.equals(inputPV) && !solutionPV.reverse().equals(inputPV))
				return false

			// All in order.
			return true

		case 'Moment':
			// The moment must be at the same position.
			if (options.requireSamePosition && !solution.position.equals(input.position))
				return false

			// Check the direction.
			if (options.requireSameDirection && solution.clockwise !== input.clockwise)
				return false

			// Check the magnitude.
			if (options.requireSameMagnitude && (solution.radius === undefined ? defaultMomentRadius : solution.radius) !== (input.radius === undefined ? defaultMomentRadius : input.radius))
				return false

			// Check the orientation.
			if (options.requireSameOrientation && (solution.opening === undefined ? defaultMomentOpening : solution.opening) !== (input.opening === undefined ? defaultMomentOpening : input.opening))
				return false

			// All in order.
			return true

		default:
			throw new Error(`Unknown load type: could not compare loads of type "${input.type}" since this type is unknown.`)
	}
}
module.exports.areLoadsEqual = areLoadsEqual

function isLoadAtPoint(load, point) {
	switch (load.type) {
		case 'Force':
			return load.positionedVector.hasPoint(point)
		case 'Moment':
			return load.position.equals(point)
		default:
			throw new Error(`Unknown load type: did not recognize the load type "${load.type}".`)
	}
}
module.exports.isLoadAtPoint = isLoadAtPoint

function doesLoadTouchRectangle(load, rectangle) {
	switch (load.type) {
		case 'Force':
			return rectangle.touchesPositionedVector(load.positionedVector)
		case 'Moment':
			return rectangle.touchesCircle(load.position, load.radius === undefined ? defaultMomentRadius : load.radius)
		default:
			throw new Error(`Unknown load type: did not recognize the load type "${load.type}". Cannot process the selection.`)
	}
}
module.exports.doesLoadTouchRectangle = doesLoadTouchRectangle

/*
 * Below are various checking functions for sets of loads.
 */

// getMatchingLoads takes a solution array of loads and for each load matches the input loads that correspond to it. The result is an array of arrays. The equality options can be an object (used for all loads) or an array with same length as the number of solution loads, in which case the corresponding equality options are picked from the array.
function getMatchingLoads(input, solution, options) {
	return solution.map((solutionLoad, index) => input.filter(inputLoad => areLoadsEqual(inputLoad, solutionLoad, Array.isArray(options) ? options[index] : options)))
}
module.exports.getMatchingLoads = getMatchingLoads

// areLoadsMatching checks if two sets of loads are matching, given the equality options. That is, if for every solution load there is a corresponding input load.
function areLoadsMatching(input, solution, options) {
	const match = getMatchingLoads(input, solution, options)
	return match.every(matchingLoads => matchingLoads.length === 1)
}
module.exports.areLoadsMatching = areLoadsMatching