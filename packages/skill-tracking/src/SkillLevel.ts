import { isPlainObject } from '@step-wise/js-utils'
import type { BernsteinCoefficients } from '@step-wise/bernstein-polynomials'
import type { Skill } from '@step-wise/skill-definition'

import type { StoredSkillLevel, StoredSkillLevelUpdate } from './types.ts'
import { inferenceCacheDuration } from './settings.ts'
import { applySkillLevelDecay } from './decay.ts'
import { ensureSkillLevel, ensureStoredSkillLevelUpdate } from './utils.ts'

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
	private _storedSkillLevel: StoredSkillLevel

	constructor(private readonly _skill: Skill, storedSkillLevel: StoredSkillLevel) {
		if (!_skill || !isPlainObject(_skill)) throw new Error(`Invalid skill: expected a skill object from the skill tree, but received something of type "${typeof _skill}".`)
		this._storedSkillLevel = ensureSkillLevel(storedSkillLevel)
		this._cache = {}
	}

	// Getters for skill level data.

	get storedSkillLevel(): StoredSkillLevel {
		return {
			coefficients: [...this._storedSkillLevel.coefficients],
			coefficientsOn: new Date(this._storedSkillLevel.coefficientsOn),
			highest: [...this._storedSkillLevel.highest],
			highestOn: new Date(this._storedSkillLevel.highestOn),
			numPracticed: this._storedSkillLevel.numPracticed,
		}
	}

	get storedCoefficients(): BernsteinCoefficients {
		return [...this._storedSkillLevel.coefficients]
	}

	get coefficientsOn(): Date {
		return new Date(this._storedSkillLevel.coefficientsOn)
	}

	get highestCoefficients(): BernsteinCoefficients {
		return [...this._storedSkillLevel.highest]
	}

	get highestOn(): Date {
		return new Date(this._storedSkillLevel.highestOn)
	}

	get numPracticed(): number {
		return this._storedSkillLevel.numPracticed
	}

	// Caching/updating.

	get cache(): SkillLevelCache {
		return this._cache
	}

	update(skillLevelUpdate: StoredSkillLevelUpdate): void {
		this._storedSkillLevel = { ...this._storedSkillLevel, ...ensureStoredSkillLevelUpdate(skillLevelUpdate) }
		this._cache = {}
	}

	invalidateInferenceCache(): void {
		delete this._cache.inferred
		delete this._cache.inferredHighest
	}

	// Smoothed coefficients.

	get smoothedCoefficients(): BernsteinCoefficients {
		if (!this.isSmoothedCoefficientsCacheValid()) {
			const now = new Date()
			this._cache.smoothed = {
				coefficients: applySkillLevelDecay(this.storedCoefficients, {
					elapsedTime: Math.max(0, now.getTime() - this.storedSkillLevel.coefficientsOn.getTime()),
					applyPracticeEffect: true,
					practiceCount: this.numPracticed,
				}),
				on: now,
			}
		}
		return this._cache.smoothed!.coefficients
	}

	isSmoothedCoefficientsCacheValid(): boolean {
		if (!this._cache.smoothed) return false
		if (Date.now() - this._cache.smoothed.on.getTime() > inferenceCacheDuration) return false
		return true
	}
}
