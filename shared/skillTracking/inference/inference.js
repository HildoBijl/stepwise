const { ensureInt } = require('../../util/numbers')
const { ensureArray } = require('../../util/arrays')
const { isBasicObject } = require('../../util/objects')

const { smoothenWithOrder, merge, mergeElementwise } = require('../coefficients')

// applyInferenceForSkill takes a skill, a functional skill data set, and optionally a useHighest flag (default false: use regular (smoothened) coefficients). It then applies inference to get the posterior distribution for the given skill, taking into account data on the skill itself, the skill set-up (the prerequisites) and on linked skills.
function applyInferenceForSkill(skill, getSkillData, useHighest = false) {
	// Gather the individual components to be merged.
	const ownCoef = getSkillData(skill.id)[useHighest ? 'rawHighest' : 'smoothenedCoefficients']
	const setupCoef = getSetupCoefficients(skill, getSkillData, useHighest)
	const linkCoef = getLinkCoefficients(skill, getSkillData, useHighest)

	// Merge them all together, where existing.
	const allCoefficients = [ownCoef, setupCoef, linkCoef].filter(coef => coef !== undefined)
	return merge(allCoefficients)
}
module.exports.applyInferenceForSkill = applyInferenceForSkill

// getSetupCoefficients takes a skill and a functional skill data set, and returns the distribution of that skill solely based on the set-up. It returns undefined on no set-up.
function getSetupCoefficients(skill, getSkillData, useHighest) {
	// On no set-up, there are no coefficients.
	const { setup } = skill
	if (!setup)
		return

	// Walk through the skills in the set-up to set up a coefficient set, and use this to determine the posterior distribution of the set-up.
	const coefSet = setup.getSkillList().map(skillId => getSkillData(skillId)[useHighest ? 'rawHighest' : 'smoothenedCoefficients'])
	return setup.getDistribution(coefSet, skill.inferenceOrder)
}

// getLinkCoefficients takes a skill and a functional skill data set, and returns the distribution of that skill solely based on the linked skills. It returns undefined on no links.
function getLinkCoefficients(skill, getSkillData, useHighest) {
	// On no links, there are no coefficients.
	const { links } = skill
	if (!links)
		return

	// Determine the skills in the link and the order of the link.
	let skills, order
	if (typeof links === 'string') {
		skills = [links]
		order = defaultLinkOrder
	} else if (Array.isArray(links)) {
		skills = links
		order = defaultLinkOrder
	} else if (isBasicObject(links)) {
		skills = links.skills
		order = links.order
	}
	skills = ensureArray(skills)
	order = ensureInt(order, true, true)

	// Get the coefficients for the respective skills.
	const rawCoefficients = skills.map(skillId => getSkillData(skillId)[useHighest ? 'rawHighest' : 'smoothenedCoefficients'])
	const skillCoefficients = rawCoefficients.map(coef => smoothenWithOrder(coef, order))
	return mergeElementwise(skillCoefficients)
}
