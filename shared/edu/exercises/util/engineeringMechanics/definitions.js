const { ensureNumber, ensureBoolean, isBasicObject } = require('../../../../util')
const { Vector, ensureVector, Span, ensureSpan } = require('../../../../geometry')

/*
 * Define default values.
 */

const defaultForceLength = 1
const defaultGraphicalForceLength = 70
const defaultMomentRadius = 0.4
const defaultGraphicalMomentRadius = 25
const defaultMomentOpening = 0

module.exports = {
	defaultForceLength,
	defaultGraphicalForceLength,
	defaultMomentRadius,
	defaultGraphicalMomentRadius,
	defaultMomentOpening,
}

/*
 * Define load types.
 */

const loadTypes = {
	force: 'Force',
	moment: 'Moment',
}
module.exports.loadTypes = loadTypes

/*
 * Define load sources.
 */

const loadSources = {
	input: 'input',
	external: 'external',
	reaction: 'reaction',
	section: 'section',
}
module.exports.loadSources = loadSources

const ensureLoadSource = (loadSource) => {
	if (typeof loadSource !== 'string')
		throw new Error(`Invalid load source: expected a string but received something of type "${typeof loadSource}".`)
	if (!Object.values(loadSources).includes(loadSource))
		throw new Error(`Invalid load source: did not recognize the load source "${loadSource}".`)
	return loadSource
}
module.exports.ensureLoadSource = ensureLoadSource

/*
 * Set up default getters.
 */

// Get functionalities for default loads.
const defaultSource = loadSources.external
module.exports.getDefaultForce = (end, angle = 0, source = defaultSource, atStart = false, forceLength = defaultForceLength) => ({
	type: 'Force',
	span: new Span({ vector: Vector.fromPolar(ensureNumber(forceLength), ensureNumber(angle)), [atStart ? 'start' : 'end']: ensureVector(end, 2) }),
	source: ensureLoadSource(source),
})
module.exports.getDefaultMoment = (position, clockwise, opening = defaultMomentOpening, source = defaultSource) => ({
	type: 'Moment',
	position: ensureVector(position, 2),
	clockwise: ensureBoolean(clockwise),
	opening: ensureNumber(opening) === undefined ? defaultMomentOpening : opening,
	source: ensureLoadSource(source),
})

/*
 * Type checkers.
 */

function isLoad(load) {
	if (!isBasicObject(load))
		return false
	return Object.values(loadTypes).includes(load.type)
}
module.exports.isLoad = isLoad

function ensureLoad(load) {
	// Ensure it's an object with a valid type.
	if (!isBasicObject(load))
		throw new Error(`Invalid load: expected a basic object, but recieved something of type "${typeof load}".`)
	if (!load.type || typeof load.type !== 'string')
		throw new Error(`Invalid load: expected a basic object with a string type property, but the type property was of type "${typeof load.type}".`)
	if (!Object.values(loadTypes).includes(load.type))
		throw new Error(`Invalid load: received a load with type "${load.type}" but this is an unfamiliar load type.`)

	// Continue based on the type.
	switch (load.type) {
		case loadTypes.force:
			return ensureForce(load)
		case loadTypes.moment:
			return ensureMoment(load)
		default:
			throw new Error(`Invalid load: no ensure method has been implemented yet for a load of type "${load.type}".`)
	}
}
module.exports.ensureLoad = ensureLoad

function ensureForce(load) {
	if (!isBasicObject(load))
		throw new Error(`Invalid force: expected a basic object, but recieved something of type "${typeof load}".`)
	if (load.type !== loadTypes.force)
		throw new Error(`Invalid force: a force must have a type "${loadTypes.force}".`)
	load.span = ensureSpan(load.span, 2)
	return load
}
module.exports.ensureForce = ensureForce

function ensureMoment(load) {
	if (!isBasicObject(load))
		throw new Error(`Invalid moment: expected a basic object, but recieved something of type "${typeof load}".`)
	if (load.type !== loadTypes.moment)
		throw new Error(`Invalid moment: a moment must have a type "${loadTypes.moment}".`)
	load.position = ensureVector(load.position, 2)
	load.clockwise = ensureBoolean(load.clockwise)
	load.opening = ensureNumber(load.opening)
	return load
}
module.exports.ensureMoment = ensureMoment
