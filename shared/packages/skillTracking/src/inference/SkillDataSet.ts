import { isPlainObject, fromKeys } from '@step-wise/utils'

import { type Coefficients } from '../coefficients'
import { maxSkillDataCacheTime } from '../settings'

import type { RawSkillDataSet, SkillTree, SkillDataOutput } from './types'
import { applyInferenceForSkill } from './support'
import { SkillData } from './SkillData'

export class SkillDataSet {
	private skillData: Record<string, SkillData> = {}
	private listeners = new Set<() => void>()

	constructor(private readonly skillTree: SkillTree, rawSkillDataSet: RawSkillDataSet = {}) {
		if (!isPlainObject(rawSkillDataSet)) throw new Error(`Invalid raw skill data set: expected a plain object but received something of type "${typeof rawSkillDataSet}".`)
		if (!isPlainObject(skillTree)) throw new Error(`Invalid skill tree: expected a plain object but received something of type "${typeof skillTree}".`)

		Object.keys(rawSkillDataSet).forEach(skillId => {
			const skill = this.skillTree[skillId]
			if (!skill) throw new Error(`Invalid skill given: a skill ID "${skillId}" was supplied inside of a raw data set, but this skill is not known in the full skill tree.`)
			this.skillData[skillId] = new SkillData(skill, rawSkillDataSet[skillId])
		})
	}

	// Basic getters/checks.

	private getSkillDataObject(skillId: string): SkillData {
		const skillData = this.skillData[skillId]
		if (!skillData) throw new Error(`Invalid raw skill data: tried to access information about the skill "${skillId}" but the skill data for this skill is unknown.`)
		return skillData
	}

	hasSkill(skillId: string): boolean {
		return !!this.skillData[skillId]
	}

	hasDataOn(skillId: string): boolean {
		if (!this.hasSkill(skillId)) return false
		const skillData = this.getSkillDataObject(skillId)
		if (skillData.prerequisites?.some(prerequisiteId => !this.hasSkill(prerequisiteId))) return false
		if (skillData.linkedSkills.some(linkedSkillId => !this.hasSkill(linkedSkillId))) return false
		return true
	}

	// Getters for the coefficients (raw and inferred).

	private getSmoothedCoefficients(skillId: string): Coefficients {
		return this.getSkillDataObject(skillId).smoothedCoefficients
	}

	getCoefficients(skillId: string): Coefficients {
		const skillData = this.getSkillDataObject(skillId)
		if (!this.isCoefficientsCacheValid(skillId)) {
			skillData.cache.coefficients = {
				coefficients: applyInferenceForSkill(skillData.skill, relatedSkillId => this.getSmoothedCoefficients(relatedSkillId)),
				on: new Date(),
			}
		}
		return skillData.cache.coefficients!.coefficients
	}

	private isCoefficientsCacheValid(skillId: string): boolean {
		const skillData = this.getSkillDataObject(skillId)
		const cache = skillData.cache.coefficients
		if (!cache) return false
		if (Date.now() - cache.on.getTime() >= maxSkillDataCacheTime) return false
		if (skillData.prerequisites?.some(prerequisiteId => this.getSkillDataObject(prerequisiteId).lastPracticed >= cache.on)) return false
		if (skillData.linkedSkills.some(linkedSkillId => this.getSkillDataObject(linkedSkillId).lastPracticed >= cache.on)) return false
		return true
	}

	// Getters for the highest coefficients (raw and inferred).

	private getRawHighestCoefficients(skillId: string): Coefficients {
		return this.getSkillDataObject(skillId).highestCoefficients
	}

	getHighestCoefficients(skillId: string): Coefficients {
		const skillData = this.getSkillDataObject(skillId)
		if (!this.isHighestCacheValid(skillId)) {
			skillData.cache.highest = {
				coefficients: applyInferenceForSkill(skillData.skill, relatedSkillId => this.getRawHighestCoefficients(relatedSkillId)),
				on: new Date(),
			}
		}
		return skillData.cache.highest!.coefficients
	}

	private isHighestCacheValid(skillId: string): boolean {
		const skillData = this.getSkillDataObject(skillId)
		const cache = skillData.cache.highest
		if (!cache) return false
		if (Date.now() - cache.on.getTime() >= maxSkillDataCacheTime) return false
		if (skillData.prerequisites?.some(prerequisiteId => this.getSkillDataObject(prerequisiteId).highestOn >= cache.on)) return false
		if (skillData.linkedSkills.some(linkedSkillId => this.getSkillDataObject(linkedSkillId).highestOn >= cache.on)) return false
		return true
	}

	// Aggregated getters.

	getSkillData(skillId: string): SkillDataOutput {
		return {
			skillId,
			coefficients: this.getCoefficients(skillId),
			highest: this.getHighestCoefficients(skillId),
			lastPracticed: this.getSkillDataObject(skillId).lastPracticed,
			numPracticed: this.getSkillDataObject(skillId).numPracticed,
		}
	}

	// Subscribers.

	subscribe(listener: () => void) {
		this.listeners.add(listener)
		return () => { this.listeners.delete(listener) }
	}

	getSnapshot() {
		return this.skillData
	}

	// Updaters.

	update(newRawSkillDataSet: RawSkillDataSet): void {
		// Determine when a skill should update.
		const shouldUpdateSkill = (skillId: string): boolean => {
			const currentSkillData = this.skillData[skillId]
			if (!currentSkillData) return true

			const rawSkillData = newRawSkillDataSet[skillId]
			if (currentSkillData.coefficientsOn.getTime() < rawSkillData.coefficientsOn.getTime()) return true
			if (currentSkillData.numPracticed < rawSkillData.numPracticed) return true
			return false
		}
		if (Object.keys(newRawSkillDataSet).every(skillId => !shouldUpdateSkill(skillId))) return

		// When updates are necessary, set up an updated skillData object.
		this.skillData = { ...this.skillData }
		Object.keys(newRawSkillDataSet).forEach(skillId => {
			const skill = this.skillTree[skillId]
			if (!skill) throw new Error(`Invalid skill given: a skill ID "${skillId}" was supplied inside of a raw data set, but this skill is not known in the full skill tree.`)
			if (!shouldUpdateSkill(skillId)) return

			const existingSkillData = this.skillData[skillId]
			if (existingSkillData) existingSkillData.update(newRawSkillDataSet[skillId])
			else this.skillData[skillId] = new SkillData(skill, newRawSkillDataSet[skillId])
		})
		for (const listener of this.listeners) { listener() }
	}

	clear(): void {
		this.skillData = {}
		for (const listener of this.listeners) { listener() }
	}
}
