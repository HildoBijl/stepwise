const { isBasicObject } = require('../../util/objects')

const { maxSkillDataCacheTime } = require('../settings')
const { smoothen } = require('../coefficients')

const { applyInferenceForSkill } = require('./inference')

class SkillData {
	constructor(skill, rawSkillData, skillDataSet) {
		// Check that all the data is present.
		if (!skill || !isBasicObject(skill))
			throw new Error(`Invalid skill: expected a skill object from the skill tree, but received something of type "${typeof skill}".`)
		if (!rawSkillData || !isBasicObject(rawSkillData))
			throw new Error(`Invalid raw skill data: expected a raw skill data object for skill "${skill.id}" but received something of type "${typeof rawSkillData}".`)
		if (!skillDataSet || !isBasicObject(skillDataSet))
			throw new Error(`Invalid skill data set: expected a skill data set when setting up the Skill Data for skill "${skill.id}" but received something of type "${typeof skillDataSet}".`)

		// Store all data.
		this._skill = skill
		this._rawData = rawSkillData
		this._skillDataSet = skillDataSet
		this._cache = {}
	}

	get skill() {
		return this._skill
	}

	get skillId() {
		return this.skill.id
	}

	get setup() {
		return this.skill.setup
	}

	get prerequisites() {
		return this.skill.prerequisites
	}

	get links() {
		return this.skill.links
	}

	getLinkedSkills() {
		if (!this.links)
			return []
		if (typeof this.links === 'string')
			return [this.links]
		if (Array.isArray(this.links))
			return this.links
		if (isBasicObject(this.links))
			return this.links.skills
		throw new Error(`Invalid skill links: cannot determine the linked skills for the links property of skill "${this.skillId}".`)
	}

	get rawData() {
		return this._rawData
	}

	get numPracticed() {
		return extractOrThrow(this, 'numPracticed')
	}

	get lastPracticed() {
		return extractOrThrow(this, 'coefficientsOn')
	}

	get rawCoefficients() {
		return extractOrThrow(this, 'coefficients')
	}

	get highestOn() {
		return extractOrThrow(this, 'highestOn')
	}

	get rawHighest() {
		return extractOrThrow(this, 'highest')
	}

	get smoothenedCoefficients() {
		// If the cache is invalid, recalculate coefficients.
		if (!this.isSmoothenedCoefficientsCacheValid()) {
			const now = new Date()
			const options = {
				time: now - this.rawData.coefficientsOn,
				applyPracticeDecay: true,
				numProblemsPracticed: this.numPracticed,
				// ToDo later: implement option for different properties for each skill.
			}
			this._cache.smoothenedCoefficients = {
				coefficients: smoothen(this.rawCoefficients, options),
				on: now,
			}
		}
		return this._cache.smoothenedCoefficients.coefficients
	}

	isSmoothenedCoefficientsCacheValid() {
		if (!this._cache.smoothenedCoefficients)
			return false // No smoothened coefficients in the cache.
		if (new Date() - this._cache.smoothenedCoefficients.on > maxSkillDataCacheTime)
			return false // Smoothened coefficients are outdated.
		return true
	}

	get coefficients() {
		// If this skill has no set-up or links, there is no inference to be done.
		if (!this.setup && !this.links)
			return this.smoothenedCoefficients

		// On an invalid cache, recalculate. Then return the result.
		if (!this.isCoefficientsCacheValid()) {
			this._cache.coefficients = {
				coefficients: applyInferenceForSkill(this.skill, (skillId) => this.getSkillData(skillId), false),
				on: new Date(),
			}
		}
		return this._cache.coefficients.coefficients
	}

	isCoefficientsCacheValid() {
		// Check the cache itself.
		if (!this._cache.coefficients)
			return false // There is no cache.
		if (new Date() - this._cache.coefficients.on >= maxSkillDataCacheTime)
			return false // The cache is outdated.

		// Check the prerequisites.
		if (this.prerequisites) {
			if (this.prerequisites.some(skillId => this.getSkillData(skillId).lastPracticed >= this._cache.coefficients.on))
				return false // Some prerequisite skill has been updated after the last cache refresh.
		}

		// Check the links.
		if (this.links) {
			if (this.getLinkedSkills().some(skillId => this.getSkillData(skillId).lastPracticed >= this._cache.coefficients.on))
				return false // Some linked skill has been updated after the last cache refresh.
		}

		// No discrepancy found.
		return true
	}

	get highest() {
		// If this skill has no set-up or links, there is no inference to be done.
		if (!this.setup && !this.links)
			return this.rawHighest // The highest coefficients are always stored already smoothened. They are not subject to time decay.

		// On an invalid cache, recalculate. Then return the result.
		if (!this.isHighestCacheValid()) {
			this._cache.coefficients = {
				coefficients: applyInferenceForSkill(this.skill, (skillId) => this.getSkillData(skillId), true),
				on: new Date(),
			}
		}
		return this._cache.highest.coefficients
	}

	isHighestCacheValid() {
		// Check the cache itself.
		if (!this._cache.highest)
			return false // There is no cache.
		if (new Date() - this._cache.highest.on >= maxSkillDataCacheTime)
			return false // The cache is outdated.

		// Check the prerequisites.
		if (this.prerequisites) {
			if (this.prerequisites.some(skillId => this.getSkillData(skillId).highestOn >= this._cache.highest.on))
				return false // Some prerequisite skill has been updated after the last cache refresh.
		}

		// Check the links.
		if (this.links) {
			if (this.getLinkedSkills().some(skillId => this.getSkillData(skillId).highestOn >= this._cache.highest.on))
				return false // Some linked skill has been updated after the last cache refresh.
		}

		// No discrepancy found.
		return true
	}

	getSkillData(skillId) {
		const skillData = this._skillDataSet[skillId]
		if (!skillData)
			throw new Error(`Invalid raw skill data: tried to access information about the skill "${skillId}" but the skill data for this skill is unknown.`)
		return skillData
	}
}
module.exports.SkillData = SkillData

// extractOrThrow is a basic support function that gets a property from the given raw skill data, checks that if it exists, and if so returns it. If not, it throws an error.
function extractOrThrow(skillData, property) {
	const value = skillData.rawData[property]
	if (value === undefined)
		throw new Error(`Invalid raw skill data: the ${property} parameter was not defined for skill "${skillData.skillId}".`)
	return value
}
