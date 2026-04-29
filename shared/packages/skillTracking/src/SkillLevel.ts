import { isPlainObject } from '@step-wise/utils'
import type { BernsteinCoefficients } from '@step-wise/bernstein-polynomials'
import type { Skill } from '@step-wise/skill-definition'

import type { RawSkillLevel, SkillLevelUpdate } from './types'
import { maxSkillLevelCacheTime } from './settings'
import { smoothBernsteinCoefficients } from './smoothing'

// Types for the internal cache.
export type SkillLevelCache = {
	smoothed?: SkillLevelCacheEntry
	inferred?: SkillLevelCacheEntry
	inferredHighest?: SkillLevelCacheEntry
}
export type SkillLevelCacheEntry = {
	coefficients: BernsteinCoefficients
	on: Date
}

export class SkillLevel {
	private _cache: SkillLevelCache

	constructor(private readonly _skill: Skill, private _rawSkillLevel: RawSkillLevel) {
		if (!_skill || !isPlainObject(_skill)) throw new Error(`Invalid skill: expected a skill object from the skill tree, but received something of type "${typeof _skill}".`)
		if (!_rawSkillLevel || !isPlainObject(_rawSkillLevel)) throw new Error(`Invalid raw skill level: expected a raw skill level object for skill "${_skill.id}" but received something of type "${typeof _rawSkillLevel}".`)
		this._cache = {}
	}

	// Getters for skill level data.

	get rawSkillLevel(): RawSkillLevel {
		return this._rawSkillLevel
	}

	get rawCoefficients(): BernsteinCoefficients {
		return this._rawSkillLevel.coefficients
	}

	get coefficientsOn(): Date {
		return this._rawSkillLevel.coefficientsOn
	}

	get highestCoefficients(): BernsteinCoefficients {
		return this._rawSkillLevel.highest
	}

	get highestOn(): Date {
		return this._rawSkillLevel.highestOn
	}

	get numPracticed(): number {
		return this._rawSkillLevel.numPracticed
	}

	// Caching/updating.

	get cache(): SkillLevelCache {
		return this._cache
	}

	update(skillLevelUpdate: SkillLevelUpdate): void {
		this._rawSkillLevel = { ...this._rawSkillLevel, ...skillLevelUpdate }
		this._cache = {}
	}

	// Smoothed coefficients.

	get smoothedCoefficients(): BernsteinCoefficients {
		if (!this.isSmoothedCoefficientsCacheValid()) {
			const now = new Date()
			this._cache.smoothed = {
				coefficients: smoothBernsteinCoefficients(this.rawCoefficients, {
					time: now.getTime() - this.rawSkillLevel.coefficientsOn.getTime(),
					applyPracticeDecay: true,
					numProblemsPracticed: this.numPracticed,
				}),
				on: now,
			}
		}
		return this._cache.smoothed!.coefficients
	}

	isSmoothedCoefficientsCacheValid(): boolean {
		if (!this._cache.smoothed) return false
		if (Date.now() - this._cache.smoothed.on.getTime() > maxSkillLevelCacheTime) return false
		return true
	}
}
