const { compareNumbers, mod, isPlainObject, processOptions, keysToObject, resolveFunctions, areArraysEqualShallow, count } = require('../../../util')
const { getCurrentInputSolutionAndComparison } = require('../../../eduTools')

const { defaultMomentRadius, defaultMomentOpening, loadTypes, loadSources } = require('./definitions')

/*
 * Below are various checks
 */

// By default we require strict equality: everything equal.
const defaultComparison = {
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
module.exports.defaultComparison = defaultComparison

// For FBD Inputs we require a very loose equality. Vectors may be flipped, shifted, resized, etcetera. They do must have one point in common.
const FBDComparison = {
	Force: {
		requireSameDirection: (_, solution) => solution.source === loadSources.external, // Do require the same direction for external loads. Otherwise don't.
		requireSameMagnitude: false,
		requireMatchingPoints: 1,
		requireNonZero: true,
	},
	Moment: {
		requireSamePosition: true,
		requireSameDirection: (_, solution) => solution.source === loadSources.external,
		requireSameMagnitude: false,
		requireSameOrientation: false,
	}
}
module.exports.FBDComparison = FBDComparison

function areLoadsEqual(input, solution, comparison = {}) {
	comparison = resolveFunctions(comparison, input, solution)

	// On unequal types the loads are not equal.
	if (solution.type !== input.type)
		return false
	const type = solution.type

	// Extract options for this particular load, if given.
	if (comparison[type])
		comparison = comparison[type]
	comparison = processOptions(comparison, defaultComparison[type])

	// Check all relevant load types.
	switch (type) {
		case loadTypes.force:
			// Check the magnitude.
			if (comparison.requireSameMagnitude && !solution.span.vector.isEqualMagnitude(input.span.vector))
				return false

			// Check zero vectors.
			if (comparison.requireNonZero && (solution.span.vector.isZero() || input.span.vector.isZero()))
				return false

			// Check line and direction.
			if (!solution.span.alongEqualLine(input.span, comparison.requireSameDirection))
				return false

			// Check matching points.
			if (comparison.requireMatchingPoints === 1 && !solution.span.hasMatchingPoint(input.span))
				return false
			if (comparison.requireMatchingPoints === 2 && !solution.span.equals(input.span) && !solution.span.reverse().equals(input.span))
				return false

			// All in order.
			return true

		case loadTypes.moment:
			// The moment must be at the same position.
			if (comparison.requireSamePosition && !solution.position.equals(input.position))
				return false

			// Check the direction.
			if (comparison.requireSameDirection && solution.clockwise !== input.clockwise)
				return false

			// Check the magnitude.
			if (comparison.requireSameMagnitude && !compareNumbers(solution.radius === undefined ? defaultMomentRadius : solution.radius, input.radius === undefined ? defaultMomentRadius : input.radius))
				return false

			// Check the orientation.
			if (comparison.requireSameOrientation && !compareNumbers(solution.opening === undefined ? defaultMomentOpening : mod(solution.opening, 2 * Math.PI), input.opening === undefined ? defaultMomentOpening : mod(input.opening, 2 * Math.PI)))
				return false

			// All in order.
			return true

		default:
			throw new Error(`Unknown load type: could not compare loads of type "${input.type}" since this type is unknown.`)
	}
}
module.exports.areLoadsEqual = areLoadsEqual

// areLoadsEqualDirection checks for two loads of EQUAL TYPE whether they have the same direction. If the loads are not of equal type, an error is thrown.
function areLoadsEqualDirection(input, solution) {
	// Check the input.
	if (input.type !== solution.type)
		throw new Error(`Invalid load comparison: tried to check whether two loads have equal direction, but received types "${input.type}" and "${solution.type}". These types cannot be compared.`)

	switch (input.type) {
		case loadTypes.force:
			return solution.span.vector.isEqualDirection(input.span.vector)

		case loadTypes.moment:
			return solution.clockwise === input.clockwise

		default:
			throw new Error(`Unknown load type: could not compare loads of type "${input.type}" since this type is unknown.`)
	}
}
module.exports.areLoadsEqualDirection = areLoadsEqualDirection

function isLoadAtPoint(load, point) {
	switch (load.type) {
		case loadTypes.force:
			return load.span.hasPoint(point)
		case loadTypes.moment:
			return load.position.equals(point)
		default:
			throw new Error(`Unknown load type: did not recognize the load type "${load.type}".`)
	}
}
module.exports.isLoadAtPoint = isLoadAtPoint

function doesLoadTouchRectangle(load, rectangle) {
	switch (load.type) {
		case loadTypes.force:
			return rectangle.touchesSpan(load.span)
		case loadTypes.moment:
			return rectangle.touchesCircle(load.position, load.radius === undefined ? defaultMomentRadius : load.radius)
		default:
			throw new Error(`Unknown load type: did not recognize the load type "${load.type}". Cannot process the selection.`)
	}
}
module.exports.doesLoadTouchRectangle = doesLoadTouchRectangle

/*
 * Below are various checking functions for sets of loads.
 */

// getLoadMatching takes two arrays of loads (input and solution) and checks which ones correspond to each other, given the comparison options. If the comparison options are an array, it is assumed this array corresponds to the solution array of loads. It returns an object { input: [...], solution: [...] } where inside the arrays are arrays of all loads matching to the corresponding load.
function getLoadMatching(input, solution, comparison) {
	const inputMatching = input.map(_ => [])
	const solutionMatching = solution.map(_ => [])
	solution.forEach((solutionLoad, solutionIndex) => {
		input.forEach((inputLoad, inputIndex) => {
			const currComparison = Array.isArray(comparison) ? comparison[solutionIndex] : comparison
			if (areLoadsEqual(inputLoad, solutionLoad, currComparison)) {
				inputMatching[inputIndex].push(solutionLoad)
				solutionMatching[solutionIndex].push(inputLoad)
			}
		})
	})
	return {
		input: inputMatching,
		solution: solutionMatching,
	}
}
module.exports.getLoadMatching = getLoadMatching

// areLoadsMatching checks if two sets of loads are matching, given the comparison options. That is, if for every solution load there is a corresponding input load.
function areLoadsMatching(input, solution, comparison) {
	return isMatchingComplete(getLoadMatching(input, solution, comparison))
}
module.exports.areLoadsMatching = areLoadsMatching

// isMatchingComplete takes a matching and checks if all the loads in each set are matched. So every load in the one set is matched to a load in the other set. (Or if there are duplicates: there's a group of n loads in one set that is matched to n loads in the other set.)
function isMatchingComplete(matching) {
	return matching.solution.every(matches => matches.length === count(matching.solution, comparisonMatches => areArraysEqualShallow(matches, comparisonMatches))) && matching.input.every(matches => matches.length === count(matching.input, comparisonMatches => areArraysEqualShallow(matches, comparisonMatches)))
}
module.exports.isMatchingComplete = isMatchingComplete

// getDirectionIndicators takes a set of vectors and a corresponding load matching (it must be complete; otherwise an error is thrown) and returns an array with indicators (true or false) whether the directions of the loads are the same.
function getDirectionIndicators(solution, matching) {
	return matching.solution.map((matchingLoads, index) => {
		if (matchingLoads.length !== 1)
			throw new Error(`Invalid direction indicators request: tried to get direction indicators for a load matching that is not complete. This request cannot be satisfied.`)
		return areLoadsEqualDirection(matchingLoads[0], solution[index])
	})
}
module.exports.getDirectionIndicators = getDirectionIndicators

// performLoadsComparison is very similar to the performComparison function, but then for loads.
function performLoadsComparison(exerciseData, parameterComparison) {
	// Get the parameters out of the given objects.
	const { input, solution, metaData } = exerciseData
	const { comparison } = metaData

	// Ensure the parameterComparison is an object.
	if (typeof parameterComparison === 'string')
		parameterComparison = [parameterComparison]
	if (Array.isArray(parameterComparison))
		parameterComparison = keysToObject(parameterComparison, () => undefined, false)
	if (!isPlainObject(parameterComparison))
		throw new Error(`Invalid parameterComparison provided: expected a plain object, but received something of type ${typeof parameterComparison}.`)

	// Walk through the parameters and perform a comparison.
	return Object.keys(parameterComparison).every(currParameter => {
		// Extract the current input, solution and parameter settings method.
		const { currInput, currSolution, currComparison } = getCurrentInputSolutionAndComparison(currParameter, input, solution, comparison, parameterComparison)

		// Perform the comparison for this individual parameter.
		return areLoadsMatching(currInput, currSolution, currComparison)
	})
}
module.exports.performLoadsComparison = performLoadsComparison
