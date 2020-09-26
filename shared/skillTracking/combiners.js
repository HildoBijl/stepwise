const { isObject } = require('../util/objects')
const { isInt } = require('../util/numbers')

const { getEV, getMoment } = require('./evaluation')
const { ensureDataSet, getCoefFromDataSet } = require('./dataSet')

// ensureCombiner checks that the given object is a valid combiner. It returns itself when everything checks out. Otherwise it throws an error.
function ensureCombiner(combiner) {
	// If it's a string, then it's all good right away. It's just an endpoint.
	if (typeof combiner === 'string')
		return combiner

	// Check that it's an object with an allowed type.
	if (!isObject(combiner) || !['and', 'or', 'repeat', 'skill'].includes(combiner.type))
		throw new Error(`Invalid skill combiner: expected the combiner to be an object with type value equaling "and", "or" or "repeat".`)

	// Check that a skill combiner has its skill properly defined as an endpoint.
	if (combiner.type === 'skill') {
		if (!combiner.skill || typeof combiner.skill !== 'string')
			throw new Error(`Invalid skill combiner: expected a skill-combiner to have a "skill" parameter being a string. Instead it equals type "${typeof combiner.skill}".`)
	}

	// Check that an and/or-combiner has skills properly defined.
	if (combiner.type === 'and' || combiner.type === 'or') {
		if (!Array.isArray(combiner.skills))
			throw new Error(`Invalid skill combiner: expected an ${combiner.type}-combiner to have a "skills" array parameter about which skills need to be combined. None was given.`)

		if (combiner.skills.length <= 1)
			throw new Error(`Invalid skill combiner: expected an ${combiner.type}-combiner to have a "skills" array parameter of length at least two, but received one of length ${combiner.skills.length}.`)

		combiner.skills.forEach(ensureCombiner)

		if (combiner.skills.some(skill => isObject(skill) && skill.type === combiner.type))
			throw new Error(`Invalid skill combiner: an ${combiner.type}-combiner may not have any ${combiner.type}-combiners as directed descendants. Combine them in a single combiner.`)

		const skills = {}
		combiner.skills.forEach(skill => {
			if (typeof skill === 'string') {
				if (skills[skill])
					throw new Error(`Invalid skill combiner: an and/or-combiner may not have any skills repeated. Instead, the skill "${skill}" occurred twice.`)
				skills[skill] = true
			}
		})
	}

	// Check that a repeat combiner has its skill properly defined.
	if (combiner.type === 'repeat') {
		if (!combiner.skill)
			throw new Error(`Invalid skill combiner: expected a repeat-combiner to have a "skill" parameter about which skill needs to be repeated. None was given.`)
		ensureCombiner(combiner.skill)

		if (isObject(combiner.skill) && combiner.skill.type !== 'or')
			throw new Error(`Invalid skill combiner: a repeat combiner may not have an and-combiner or repeat-combiner inside of it. Instead of repeating (a and b), instead use (repeat a and repeat b).`)

		if (!isInt(combiner.times || combiner.times <= 1))
			throw new Error(`Invalid skill combiner: a repeat combiner must have a "times" property defined, and it must be an integer of at least two. The encountered value is "${combiner.times}".`)
	}

	// All good!
	return combiner
}
module.exports.ensureCombiner = ensureCombiner

// getCombinerSkills return a list of all skills in a combiner.
function getCombinerSkills(combiner) {
	// Check input.
	combiner = ensureCombiner(combiner)

	// Gather all skills.
	const skills = getCombinerSkillsInternal(combiner)

	// Check for duplicates.
	const present = {}
	skills.forEach(skill => {
		if (present[skill])
			throw new Error(`Invalid combiner: the given combiner has a skill "${skill}" that occurs multiple times. Currently this is not supported.`)
		present[skill] = true
	})
	return skills
}
module.exports.getCombinerSkills = getCombinerSkills

function getCombinerSkillsInternal(combiner) {
	// Handle skill types.
	if (typeof combiner === 'string')
		return [combiner]
	if (combiner.type === 'skill')
		return [combiner.skill]

	// Handle repeat combiners.
	if (combiner.type === 'repeat')
		return getCombinerSkillsInternal(combiner.skill)

	// Handle and/or combiners.
	if (combiner.type === 'and' || combiner.type === 'or')
		return combiner.skills.map(getCombinerSkillsInternal).flat()
}

// getRepeat finds out how much the given skill is repeated in the combiner.
function getRepeat(combiner, skill) {
	if (typeof combiner === 'string')
		return (combiner === skill ? 1 : 0)
	if (combiner.type === 'skill')
		return getRepeat(combiner.skill, skill)
	if (combiner.type === 'repeat')
		return combiner.times * getRepeat(combiner.skill, skill)
	if (combiner.type === 'and' || combiner.type === 'or')
		return combiner.skills.reduce((sum, innerCombiner) => sum + getRepeat(innerCombiner, skill), 0)
}
module.exports.getRepeat = getRepeat

// assume takes a combiner and assumes the given skill to either be true or false. It return a shallow copy of the object.
function assume(combiner, skill, result) {
	if (typeof combiner === 'string') {
		if (combiner === skill)
			return { type: 'skill', skill, assumption: result }
		return combiner
	}
	if (combiner.type === 'skill') {
		if (combiner.skill === skill)
			return { ...combiner, assumption: result }
		return combiner
	}
	if (combiner.type === 'repeat') {
		if (combiner.skill === skill)
			return { ...combiner, assumption: result }
		return { ...combiner, skill: assume(combiner.skill, skill, result) }
	}
	if (combiner.type === 'and' || combiner.type === 'or') {
		return { ...combiner, skills: combiner.skills.map(innerCombiner => assume(innerCombiner, skill, result)) }
	}
}
module.exports.assume = assume

// getCombinerEV calculates the expected value that a combiner will turn out correct. Optionally, within the combiner, the assumption property can be set to true or false to make assumptions on what may happen. (You can also first get the combiner coefficients and then find the EV, but this is more efficient.)
function getCombinerEV(dataSet, combiner) {
	// Check the input.
	dataSet = ensureDataSet(dataSet)
	combiner = ensureCombiner(combiner)

	// Check for assumptions.
	if (isObject(combiner) && typeof combiner.assumption === 'boolean')
		return combiner.assumption ? 1 : 0

	// Handle skill-combiners.
	if (typeof combiner === 'string')
		return getEV(getCoefFromDataSet(dataSet, combiner))
	if (combiner.type === 'skill')
		return getEV(getCoefFromDataSet(dataSet, combiner.skill))

	// Handle and/or-combiners.
	if (combiner.type === 'and' || combiner.type === 'or') {
		const EVs = combiner.skills.map((skill) => getCombinerEV(dataSet, skill))
		if (combiner.type === 'and')
			return EVs.reduce((product, EV) => product * EV, 1)
		return 1 - EVs.reduce((product, EV) => product * (1 - EV), 1)
	}

	// Handle repeat-combiners.
	if (combiner.type === 'repeat')
		return getMoment(getCoefFromDataSet(dataSet, combiner.skill), combiner.times)
}
module.exports.getCombinerEV = getCombinerEV

// The following functions are used to create combiners.
function combinerAnd(...skills) {
	return { type: 'and', skills }
}
module.exports.combinerAnd = combinerAnd
function combinerOr(...skills) {
	return { type: 'or', skills }
}
module.exports.combinerOr = combinerOr
function combinerRepeat(skill, times) {
	return { type: 'repeat', skill, times }
}
module.exports.combinerRepeat = combinerRepeat