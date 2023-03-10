const { ensureInt } = require('../../util/numbers')
const { ensureArray } = require('../../util/arrays')
const { isBasicObject, keysToObject } = require('../../util/objects')

const { smoothenWithOrder, merge, mergeElementwise } = require('../coefficients')

// applyInferenceForSkill takes a skill, a functional skill data set, and optionally a useHighest flag (default false: use regular (smoothened) coefficients). It then applies inference to get the posterior distribution for the given skill, taking into account data on the skill itself, the skill set-up (the prerequisites) and on linked skills.
function applyInferenceForSkill(skill, getSkillData, useHighest = false) {
	// Gather the individual components to be merged.
	const ownCoef = getSkillData(skill.id)[useHighest ? 'rawHighest' : 'smoothenedCoefficients']
	const setupCoef = getSetupCoefficients(skill, getSkillData, useHighest)
	const linkCoefs = getLinkCoefficients(skill, getSkillData, useHighest)

	// Merge them all together, where existing.
	const allCoefficients = [ownCoef, setupCoef, ...linkCoefs].filter(coef => coef !== undefined)
	return merge(allCoefficients)
}
module.exports.applyInferenceForSkill = applyInferenceForSkill

// getSetupCoefficients takes a skill and a function to get skill data, and returns the distribution of that skill solely based on the set-up. It returns undefined on no set-up.
function getSetupCoefficients(skill, getSkillData, useHighest) {
	// On no set-up, there are no coefficients.
	const { setup } = skill
	if (!setup)
		return

	// Walk through the skills in the set-up to set up a coefficient set, and use this to determine the posterior distribution of the set-up.
	const skillIds = setup.getSkillList()
	const coefSet = keysToObject(skillIds, skillId => getSkillData(skillId)[useHighest ? 'rawHighest' : 'smoothenedCoefficients'])
	return setup.getDistribution(coefSet, skill.inferenceOrder)
}

// getLinkCoefficients takes a skill and a function to get skill data, and returns the distribution of that skill solely based on the linked skills. It returns an array of coefficient lists, one coefficient list for each link.
function getLinkCoefficients(skill, getSkillData, useHighest) {
	return skill.links.map(link => {
		const { skills, order } = link
		const rawCoefficients = skills.map(skillId => getSkillData(skillId)[useHighest ? 'rawHighest' : 'smoothenedCoefficients'])
		const skillCoefficients = rawCoefficients.map(coef => smoothenWithOrder(coef, order))
		return mergeElementwise(skillCoefficients)
	})
}
