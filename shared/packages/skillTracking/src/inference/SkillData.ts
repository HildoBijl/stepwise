import { isPlainObject } from '@step-wise/utils'

import { maxSkillDataCacheTime } from '../settings'
import { type Coefficients, smooth } from '../coefficients'
import { type SkillSetup } from '../setup'

import type { RawSkillData, SkillLike, SkillLink } from './types'

// Types for the internal cache.
export type SkillDataCache = {
	smoothedCoefficients?: SkillCacheEntry
	coefficients?: SkillCacheEntry
	highest?: SkillCacheEntry
}
export type SkillCacheEntry = {
	coefficients: Coefficients
	on: Date
}

export class SkillData {
	private _cache: SkillDataCache

	constructor(private readonly _skill: SkillLike, private _rawData: RawSkillData) {
		if (!_skill || !isPlainObject(_skill)) throw new Error(`Invalid skill: expected a skill object from the skill tree, but received something of type "${typeof _skill}".`)
		if (!_rawData || !isPlainObject(_rawData)) throw new Error(`Invalid raw skill data: expected a raw skill data object for skill "${_skill.id}" but received something of type "${typeof _rawData}".`)
		this._cache = {}
	}

	// Getters for skill properties.

	get skill(): SkillLike {
		return this._skill
	}

	get skillId(): string {
		return this._skill.id
	}

	get setup(): SkillSetup | undefined {
		return this._skill.setup
	}

	get prerequisites(): string[] | undefined {
		return this._skill.prerequisites
	}

	get links(): SkillLink[] | undefined {
		return this._skill.links
	}

	get linkedSkills(): string[] {
		return this._skill.linkedSkills ?? []
	}

	// Getters for skill data.

	get rawData(): RawSkillData {
		return this._rawData
	}

	get numPracticed(): number {
		return this._rawData.numPracticed
	}

	get lastPracticed(): Date {
		return this._rawData.coefficientsOn
	}

	get rawCoefficients(): Coefficients {
		return this._rawData.coefficients
	}

	get coefficientsOn(): Date {
		return this._rawData.coefficientsOn
	}

	get highestCoefficients(): Coefficients {
		return this._rawData.highest
	}

	get highestOn(): Date {
		return this._rawData.highestOn
	}
	
	// Caching.

	get cache(): SkillDataCache {
		return this._cache
	}

	update(rawData: RawSkillData): void {
		this._rawData = rawData
		this._cache = {}
	}

	// Smoothed coefficients.

	get smoothedCoefficients(): Coefficients {
		if (!this.isSmoothedCoefficientsCacheValid()) {
			const now = new Date()
			this._cache.smoothedCoefficients = {
				coefficients: smooth(this.rawCoefficients, {
					time: now.getTime() - this.rawData.coefficientsOn.getTime(),
					applyPracticeDecay: true,
					numProblemsPracticed: this.numPracticed,
				}),
				on: now,
			}
		}
		return this._cache.smoothedCoefficients!.coefficients
	}

	isSmoothedCoefficientsCacheValid(): boolean {
		if (!this._cache.smoothedCoefficients) return false
		if (Date.now() - this._cache.smoothedCoefficients.on.getTime() > maxSkillDataCacheTime) return false
		return true
	}
}
