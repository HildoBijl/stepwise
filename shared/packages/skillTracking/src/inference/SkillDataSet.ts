import { isPlainObject } from '@step-wise/utils'

import { type Coefficients } from '../coefficients'
import { maxSkillDataCacheTime } from '../settings'

import type { RawSkillDataSet, SkillLike, SkillTree } from './types'
import { applyInferenceForSkill } from './support'
import { SkillData } from './SkillData'

export class SkillDataSet {
	private readonly skillDataById: Record<string, SkillData> = {}

	constructor(rawSkillDataSet: RawSkillDataSet = {}, private readonly skillTree: SkillTree) {
		if (!isPlainObject(rawSkillDataSet)) throw new Error(`Invalid raw skill data set: expected a plain object but received something of type "${typeof rawSkillDataSet}".`)
		if (!isPlainObject(skillTree)) throw new Error(`Invalid skill tree: expected a plain object but received something of type "${typeof skillTree}".`)

		Object.keys(rawSkillDataSet).forEach(skillId => {
			const skill = this.skillTree[skillId]
			if (!skill) throw new Error(`Invalid skill given: a skill ID "${skillId}" was supplied inside of a raw data set, but this skill is not known in the full skill tree.`)
			this.skillDataById[skillId] = new SkillData(skill, rawSkillDataSet[skillId])
		})
	}

	// Basic getters/checks.

	private getSkillData(skillId: string): SkillData {
		const skillData = this.skillDataById[skillId]
		if (!skillData) throw new Error(`Invalid raw skill data: tried to access information about the skill "${skillId}" but the skill data for this skill is unknown.`)
		return skillData
	}

	hasSkill(skillId: string): boolean {
		return !!this.skillDataById[skillId]
	}

	// Getters for the coefficients (raw and inferred).

	private getSmoothedCoefficients(skillId: string): Coefficients {
		return this.getSkillData(skillId).smoothedCoefficients
	}

	getCoefficients(skillId: string): Coefficients {
		const skillData = this.getSkillData(skillId)
		if (!this.isCoefficientsCacheValid(skillId)) {
			skillData.cache.coefficients = {
				coefficients: applyInferenceForSkill(skillData.skill, relatedSkillId => this.getSmoothedCoefficients(relatedSkillId)),
				on: new Date(),
			}
		}
		return skillData.cache.coefficients!.coefficients
	}

	private isCoefficientsCacheValid(skillId: string): boolean {
		const skillData = this.getSkillData(skillId)
		const cache = skillData.cache.coefficients
		if (!cache) return false
		if (Date.now() - cache.on.getTime() >= maxSkillDataCacheTime) return false
		if (skillData.prerequisites?.some(prerequisiteId => this.getSkillData(prerequisiteId).lastPracticed >= cache.on)) return false
		if (skillData.linkedSkills.some(linkedSkillId => this.getSkillData(linkedSkillId).lastPracticed >= cache.on)) return false
		return true
	}

	// Getters for the highest coefficients (raw and inferred).

	private getRawHighestCoefficients(skillId: string): Coefficients {
		return this.getSkillData(skillId).highestCoefficients
	}

	getHighestCoefficients(skillId: string): Coefficients {
		const skillData = this.getSkillData(skillId)
		if (!this.isHighestCacheValid(skillId)) {
			skillData.cache.highest = {
				coefficients: applyInferenceForSkill(skillData.skill, relatedSkillId => this.getRawHighestCoefficients(relatedSkillId)),
				on: new Date(),
			}
		}
		return skillData.cache.highest!.coefficients
	}

	private isHighestCacheValid(skillId: string): boolean {
		const skillData = this.getSkillData(skillId)
		const cache = skillData.cache.highest
		if (!cache) return false
		if (Date.now() - cache.on.getTime() >= maxSkillDataCacheTime) return false
		if (skillData.prerequisites?.some(prerequisiteId => this.getSkillData(prerequisiteId).highestOn >= cache.on)) return false
		if (skillData.linkedSkills.some(linkedSkillId => this.getSkillData(linkedSkillId).highestOn >= cache.on)) return false
		return true
	}

	// Updaters.

	update(newRawSkillDataSet: RawSkillDataSet): this {
		const shouldUpdateSkill = (skillId: string): boolean => {
			const currentSkillData = this.skillDataById[skillId]
			if (!currentSkillData) return true

			const rawSkillData = newRawSkillDataSet[skillId]
			if (currentSkillData.coefficientsOn.getTime() < rawSkillData.coefficientsOn.getTime()) return true
			if (currentSkillData.numPracticed < rawSkillData.numPracticed) return true
			return false
		}

		Object.keys(newRawSkillDataSet).forEach(skillId => {
			const skill = this.skillTree[skillId]
			if (!skill) throw new Error(`Invalid skill given: a skill ID "${skillId}" was supplied inside of a raw data set, but this skill is not known in the full skill tree.`)
			if (!shouldUpdateSkill(skillId)) return
			const existingSkillData = this.skillDataById[skillId]
			if (existingSkillData) existingSkillData.update(newRawSkillDataSet[skillId])
			else this.skillDataById[skillId] = new SkillData(skill, newRawSkillDataSet[skillId])
		})

		return this
	}
}
