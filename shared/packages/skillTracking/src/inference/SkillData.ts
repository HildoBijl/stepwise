import { isPlainObject, mergeDefaults } from '@step-wise/utils'
import { type BernsteinCoefficients, smoothBernsteinCoefficientsWithFactor } from '@step-wise/bernstein-polynomials'

import { decayHalfLife, initialPracticeDecayTime, practiceDecayHalfLife, maxSkillDataCacheTime } from '../settings'
import { type SkillSetup } from '../setup'

import type { RawSkillData, SkillLike, SkillLink } from './types'

export type BernsteinSmoothingOptions = {
	time?: number
	applyPracticeDecay?: boolean
	numProblemsPracticed?: number
	decayHalfLife?: number
	initialPracticeDecayTime?: number
	practiceDecayHalfLife?: number
}

const defaultSmoothingOptions: Required<BernsteinSmoothingOptions> = {
	time: 0,
	applyPracticeDecay: false,
	numProblemsPracticed: 0,
	decayHalfLife,
	initialPracticeDecayTime,
	practiceDecayHalfLife,
}

// Smooth a set of coefficients by determining a smoothing factor from the given options.
export function smoothBernsteinCoefficients(coefficients: BernsteinCoefficients, options?: BernsteinSmoothingOptions): BernsteinCoefficients {
	return smoothBernsteinCoefficientsWithFactor(coefficients, getBernsteinSmoothingFactor(options))
}

/* Get the smoothing factor based on the given options:
 * - time (default 0): how much time in milliseconds has passed since the last exercise?
 * - applyPracticeDecay (default false): should practice decay be applied?
 * - numProblemsPracticed (default 0): how many times has the user practiced this skill before?
 */
export function getBernsteinSmoothingFactor(options: BernsteinSmoothingOptions = {}): number {
	const { time, applyPracticeDecay, numProblemsPracticed, decayHalfLife, initialPracticeDecayTime, practiceDecayHalfLife } = mergeDefaults(options, defaultSmoothingOptions)
	const practiceDecayTime = applyPracticeDecay ? initialPracticeDecayTime * (1 / 2) ** (numProblemsPracticed / practiceDecayHalfLife) : 0
	const equivalentTime = time + practiceDecayTime
	return (1 / 2) ** (equivalentTime / decayHalfLife)
}

// Types for the internal cache.
export type SkillDataCache = {
	smoothedCoefficients?: SkillCacheEntry
	coefficients?: SkillCacheEntry
	highest?: SkillCacheEntry
}
export type SkillCacheEntry = {
	coefficients: BernsteinCoefficients
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

	get rawCoefficients(): BernsteinCoefficients {
		return this._rawData.coefficients
	}

	get coefficientsOn(): Date {
		return this._rawData.coefficientsOn
	}

	get highestCoefficients(): BernsteinCoefficients {
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

	get smoothedCoefficients(): BernsteinCoefficients {
		if (!this.isSmoothedCoefficientsCacheValid()) {
			const now = new Date()
			this._cache.smoothedCoefficients = {
				coefficients: smoothBernsteinCoefficients(this.rawCoefficients, {
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
