/* SkillData is a class that tracks and processes coefficients for skills. It receives:
 * - id: the ID of the skill the data belongs to. This is used to check whether it has prerequisites to take into account.
 * - rawData: an object which should for each of the prerequisites have skill data from the database.
 */

const skills = require('./index')
const { smoothen, getSmoothingFactor, merge, infer } = require('../../skillTracking')

const maxCacheTime = 60 * 60 * 1000 // [Milliseconds] Maximum amount of time to still return coefficients before resmoothening them.
const inferenceOrder = 4 // The smoothing order used when inferring a skill from its subskills.

class SkillData {
	constructor(skillId, rawData) {
		// Check that all the data is present.
		const skill = skills[skillId]
		if (!skill)
			throw new Error(`Invalid input: unknown skill ID "${skillId}".`)
		if (!rawData[skillId])
			throw new Error(`Invalid input: the raw data provided to the SkillData object is missing data on skill "${skillId}".`)
		skill.prerequisites.forEach(prerequisite => {
			if (!rawData[prerequisite])
				throw new Error(`Invalid input: the raw data provided to the SkillData object is missing data on skill "${prerequisite}".`)
		})

		// Store all data.
		this._skillId = skillId
		this._rawData = rawData
		this._cache = {}
	}

	get setup() {
		return skills[this._skillId].setup
	}

	get prerequisites() {
		return skills[this._skillId].prerequisites
	}

	get numPracticed() {
		return this._rawData[this._skillId].numPracticed
	}

	get rawCoefficients() {
		return this._rawData[this._skillId].coefficients
	}

	get rawHighest() {
		return this._rawData[this._skillId].highest
	}

	get smoothenedCoefficients() {
		// Check object cache.
		const now = new Date()
		if (!this._cache.smoothenedCoefficients || now - this._cache.smoothenedCoefficients.on > maxCacheTime) {
			// Apply smoothing and store in object cache.
			const factor = getSmoothingFactor({
				time: now - this._rawData[this._skillId].coefficientsOn,
				applyPracticeDecay: true,
				numProblemsPracticed: this.numPracticed,
			})
			this._cache.smoothenedCoefficients = {
				coefficients: smoothen(this.rawCoefficients, factor),
				on: now,
			}
		}
		return this._cache.smoothenedCoefficients.coefficients
	}

	get coefficients() {
		// Check if this skill has a set-up. If not, just return smoothened coefficients.
		if (!this.setup)
			return this.smoothenedCoefficients

		// Check object cache.
		const now = new Date()
		if (!this._cache.coefficients || now - this._cache.coefficients.on > maxCacheTime) {
			// Make the inference and merge. For this, first walk through all prerequisites and smoothen them.
			const coefficientsNow = {}
			this.prerequisites.forEach(prerequisite => {
				const factor = getSmoothingFactor({
					time: now - this._rawData[prerequisite].coefficientsOn,
					applyPracticeDecay: true,
					numProblemsPracticed: this._rawData[prerequisite].numPracticed,
				})
				coefficientsNow[prerequisite] = smoothen(this._rawData[prerequisite].coefficients, factor)
			})
			const inference = infer(coefficientsNow, this.setup, inferenceOrder)
			this._cache.coefficients = {
				coefficients: merge(inference, this.smoothenedCoefficients),
				on: now,
			}
		}
		return this._cache.coefficients.coefficients
	}

	get highest() {
		// Check if this skill has a set-up. If not, just return the raw highest.
		if (!this.setup)
			return this.rawHighest

		// Check object cache.
		const now = new Date()
		if (!this._cache.highest) {
			// Make the inference and merge.
			const coefficientsHighest = {}
			this.prerequisites.forEach(prerequisite => {
				coefficientsHighest[prerequisite] = this._rawData[prerequisite].highest
			})
			const inference = infer(coefficientsHighest, this.setup)
			this._cache.highest = {
				coefficients: merge(inference, this.rawHighest),
				on: now,
			}
		}
		return this._cache.highest.coefficients
	}
}

module.exports = SkillData
SkillData.inferenceOrder = inferenceOrder // Also export the inference order.