import { isPlainObject, fromKeys, repeat, sum, count } from '@step-wise/js-utils'
import { binomialCoefficient } from '@step-wise/math-tools'
import { oneMinusPolynomial, substitutePolynomialMoments } from '@step-wise/polynomials'
import { type BernsteinCoefficients, getBernsteinExpectedValue, getBernsteinMoment, multiplyBernsteinPDFs } from '@step-wise/bernstein-polynomials'
import { type SkillSetupLike, ensureSetup } from '@step-wise/skill-setup'
import { type SkillId, type SkillTree, ensureSkillId, expandSkillIdsWithDirectPrerequisitesAndLinks } from '@step-wise/skill-definition'

import type { RawSkillLevel, RawSkillLevelSet, SkillLevelOutput, SkillObservation, SkillLevelUpdate, SkillLevelUpdateSet } from './types'
import { maxSkillLevelCacheTime } from './settings'
import { smoothBernsteinCoefficients } from './smoothing'
import { getSetupExpectedValue, getSetupCoefficients, applyInferenceForSkill } from './inference'
import { SkillLevel } from './SkillLevel'
import { ensureSkillLevelUpdate } from './utils'

export class SkillLevelSet {
	private skillLevels: Record<string, SkillLevel> = {}
	private listeners = new Set<() => void>()

	constructor(private readonly skillTree: SkillTree, rawSkillLevelSet: RawSkillLevelSet = {}) {
		if (!isPlainObject(skillTree)) throw new Error(`Invalid skill tree: expected a plain object but received something of type "${typeof skillTree}".`)
		if (!isPlainObject(rawSkillLevelSet)) throw new Error(`Invalid raw skill level set: expected a plain object but received something of type "${typeof rawSkillLevelSet}".`)

		Object.keys(rawSkillLevelSet).forEach(skillId => {
			const skill = this.skillTree[skillId]
			if (!skill) throw new Error(`Invalid skill given: a skill ID "${skillId}" was supplied inside of a raw skill level set, but this skill is not known in the full skill tree.`)
			this.skillLevels[skillId] = new SkillLevel(skill, rawSkillLevelSet[skillId])
		})
	}

	/*
	 * Basic getters/checks.
	 */

	private ensureSkillId(skillId: SkillId): SkillId {
		return ensureSkillId(this.skillTree, skillId)
	}

	private getSkillLevelObject(skillId: SkillId): SkillLevel {
		const skillLevel = this.skillLevels[this.ensureSkillId(skillId)]
		if (!skillLevel) throw new Error(`Invalid raw skill level: tried to access information about the skill "${skillId}" but the skill level for this skill is unknown.`)
		return skillLevel
	}

	hasSkill(skillId: SkillId): boolean {
		return !!this.skillLevels[this.ensureSkillId(skillId)]
	}

	hasDataOn(skillId: SkillId): boolean {
		const skill = this.skillTree[this.ensureSkillId(skillId)]
		const linkedSkillIds = expandSkillIdsWithDirectPrerequisitesAndLinks(this.skillTree, [skill.id])
		return linkedSkillIds.every(linkedSkillId => this.hasSkill(linkedSkillId))
	}

	/*
	 * Getters for inferred skills.
	 */

	private getSmoothedCoefficients(skillId: SkillId): BernsteinCoefficients {
		return this.getSkillLevelObject(skillId).smoothedCoefficients
	}

	getCoefficients(skillId: SkillId): BernsteinCoefficients {
		const skill = this.skillTree[this.ensureSkillId(skillId)]
		const skillLevel = this.getSkillLevelObject(skillId)
		if (!this.isCoefficientsCacheValid(skillId)) {
			skillLevel.cache.inferred = {
				coefficients: applyInferenceForSkill(skill, relatedSkillId => this.getSmoothedCoefficients(relatedSkillId)),
				on: new Date(),
			}
		}
		return [...skillLevel.cache.inferred!.coefficients]
	}

	private isCoefficientsCacheValid(skillId: SkillId): boolean {
		const skill = this.skillTree[this.ensureSkillId(skillId)]
		const skillLevel = this.getSkillLevelObject(skillId)
		const cacheEntry = skillLevel.cache.inferred
		if (!cacheEntry) return false
		if (Date.now() - cacheEntry.on.getTime() >= maxSkillLevelCacheTime) return false
		if (skillLevel.coefficientsOn >= cacheEntry.on) return false
		if (skill.prerequisiteIds.some(prerequisiteId => this.getSkillLevelObject(prerequisiteId).coefficientsOn >= cacheEntry.on)) return false
		if (skill.linkedSkillIds.some(linkedSkillId => this.getSkillLevelObject(linkedSkillId).coefficientsOn >= cacheEntry.on)) return false
		return true
	}

	getExpectedValue(skillId: SkillId): number {
		return getBernsteinExpectedValue(this.getCoefficients(skillId))
	}

	/*
	 * Getters for inferred setups.
	 */

	getSetupExpectedValue(setup: SkillSetupLike): number {
		return getSetupExpectedValue(ensureSetup(setup), skillId => this.getSmoothedCoefficients(skillId))
	}

	getSetupCoefficients(setup: SkillSetupLike, inferenceOrder?: number): BernsteinCoefficients {
		return getSetupCoefficients(ensureSetup(setup), skillId => this.getSmoothedCoefficients(skillId), inferenceOrder)
	}

	getSetupsExpectedValues(setups: (SkillSetupLike | undefined)[], inferenceOrders?: number | (number | undefined)[]): number {
		if (count(setups, setup => !!setup) === 1) return this.getSetupExpectedValue(setups.find(setup => !!setup) as SkillSetupLike)
		return getBernsteinExpectedValue(this.getSetupsCoefficients(setups, inferenceOrders))
	}

	getSetupsCoefficients(setups: (SkillSetupLike | undefined)[], inferenceOrders?: number | (number | undefined)[]): BernsteinCoefficients {
		const coefficients = setups.map((setup, index) => setup ? this.getSetupCoefficients(setup, Array.isArray(inferenceOrders) ? inferenceOrders[index] : inferenceOrders) : undefined)
		return multiplyBernsteinPDFs(...coefficients.filter(coefficient => !!coefficient))
	}

	/*
	 * Getters for the inferred highest coefficients of skills.
	 */

	private getRawHighestCoefficients(skillId: SkillId): BernsteinCoefficients {
		return this.getSkillLevelObject(skillId).highestCoefficients
	}

	getHighestCoefficients(skillId: SkillId): BernsteinCoefficients {
		const skill = this.skillTree[this.ensureSkillId(skillId)]
		const skillLevel = this.getSkillLevelObject(skillId)
		if (!this.isHighestCacheValid(skillId)) {
			skillLevel.cache.inferredHighest = {
				coefficients: applyInferenceForSkill(skill, relatedSkillId => this.getRawHighestCoefficients(relatedSkillId)),
				on: new Date(),
			}
		}
		return [...skillLevel.cache.inferredHighest!.coefficients]
	}

	private isHighestCacheValid(skillId: SkillId): boolean {
		const skill = this.skillTree[this.ensureSkillId(skillId)]
		const skillLevel = this.getSkillLevelObject(skillId)
		const cacheEntry = skillLevel.cache.inferredHighest
		if (!cacheEntry) return false
		if (Date.now() - cacheEntry.on.getTime() >= maxSkillLevelCacheTime) return false
		if (skillLevel.highestOn >= cacheEntry.on) return false
		if (skill.prerequisiteIds.some(prerequisiteId => this.getSkillLevelObject(prerequisiteId).highestOn >= cacheEntry.on)) return false
		if (skill.linkedSkillIds.some(linkedSkillId => this.getSkillLevelObject(linkedSkillId).highestOn >= cacheEntry.on)) return false
		return true
	}

	getHighestExpectedValue(skillId: SkillId): number {
		return getBernsteinExpectedValue(this.getHighestCoefficients(skillId))
	}

	/*
	 * Getters for the inferred highest coefficients of setups.
	 */

	getSetupHighestExpectedValue(setup: SkillSetupLike): number {
		return getSetupExpectedValue(ensureSetup(setup), skillId => this.getRawHighestCoefficients(skillId))
	}

	getSetupHighestCoefficients(setup: SkillSetupLike, inferenceOrder: number): BernsteinCoefficients {
		return getSetupCoefficients(ensureSetup(setup), skillId => this.getRawHighestCoefficients(skillId), inferenceOrder)
	}

	/*
	 * Aggregated getters for inferred coefficients.
	 */

	getSkillLevel(skillId: SkillId): SkillLevelOutput {
		const skillLevelObject = this.getSkillLevelObject(skillId)
		return {
			skillId,
			coefficients: this.getCoefficients(skillId),
			coefficientsOn: skillLevelObject.coefficientsOn,
			highest: this.getHighestCoefficients(skillId),
			highestOn: skillLevelObject.highestOn,
			numPracticed: skillLevelObject.numPracticed,
		}
	}

	/*
	 * Subscribers.
	 */

	subscribe(listener: () => void): () => void {
		this.listeners.add(listener)
		return () => { this.listeners.delete(listener) }
	}

	getSnapshot(): Readonly<Record<string, SkillLevel>> {
		return this.skillLevels
	}

	/*
	 * Updaters.
	 */

	update(skillLevelUpdateSet: SkillLevelUpdateSet): void {
		const ensuredUpdateSet = fromKeys(Object.keys(skillLevelUpdateSet), skillId => ensureSkillLevelUpdate(skillLevelUpdateSet[skillId]))

		// Determine when a skill should update.
		const shouldUpdateSkill = (skillId: SkillId): boolean => {
			const currentSkillLevel = this.skillLevels[skillId]
			if (!currentSkillLevel) return true

			const skillLevelUpdate = ensuredUpdateSet[skillId]
			if (currentSkillLevel.coefficientsOn.getTime() < skillLevelUpdate.coefficientsOn.getTime()) return true
			if (currentSkillLevel.numPracticed < skillLevelUpdate.numPracticed) return true
			return false
		}
		if (Object.keys(ensuredUpdateSet).every(skillId => !shouldUpdateSkill(skillId))) return

		// When updates are necessary, set up an updated skillLevels object.
		this.skillLevels = { ...this.skillLevels }
		Object.keys(ensuredUpdateSet).forEach(skillId => {
			const skill = this.skillTree[this.ensureSkillId(skillId)]
			if (!shouldUpdateSkill(skillId)) return

			const existingSkillLevel = this.skillLevels[skillId]
			const skillLevelUpdate = ensuredUpdateSet[skillId]
			if (existingSkillLevel) {
				existingSkillLevel.update(skillLevelUpdate)
			} else {
				if (!('highest' in skillLevelUpdate) || !('highestOn' in skillLevelUpdate)) throw new TypeError(`Invalid skill level update: tried to update the skill level of skill "${skillId}" but this skill level was not known before, and only incomplete update data was provided.`)
				this.skillLevels[skillId] = new SkillLevel(skill, skillLevelUpdate as RawSkillLevel)
			}
		})
		for (const listener of this.listeners) { listener() }
	}

	clear(): void {
		this.skillLevels = {}
		for (const listener of this.listeners) { listener() }
	}

	/*
	 * Observations.
	 */

	// Apply an observation to the skill levels to update them. Returns the new coefficients of adjusted skills.
	processObservation(observation: SkillObservation): SkillLevelUpdateSet {
		return this.processObservations([observation])
	}

	// Apply observations simultaneously. Returns the new coefficients of adjusted skills.
	processObservations(observations: SkillObservation[]): SkillLevelUpdateSet {
		// Validate the complete batch before calculating or applying any updates.
		const observationSkillIds = observations.map(({ setup }) => {
			if (!setup.isDeterministic()) throw new TypeError(`Invalid observation processing: can only process observations of deterministic skills. The given skill set-up is a stochastic one.`)
			const skillIds = setup.getSkillList()
			const missingSkillId = skillIds.find(skillId => !this.hasDataOn(skillId))
			if (missingSkillId) throw new Error(`Invalid observation processing: the skill level data on the relevant skills has not been loaded yet. Data on "${missingSkillId}" and/or its prerequisites/links is not loaded in.`)
			return skillIds
		})
		if (observations.length === 0) return {}

		// Take one inferred snapshot. Every observation in the batch must use the same prior information.
		const allSkillIds = [...new Set(observationSkillIds.flat())]
		const inferredCoefficients = fromKeys(allSkillIds, skillId => this.getCoefficients(skillId))
		const likelihoods = fromKeys(allSkillIds, () => [] as BernsteinCoefficients[])

		observations.forEach(({ setup, correct }, observationIndex) => {
			const skillIds = observationSkillIds[observationIndex]
			const polynomial = correct ? setup.getPolynomial() : oneMinusPolynomial(setup.getPolynomial())
			skillIds.forEach(skillId => {
				// Integrate out every other skill, leaving a likelihood polynomial for the current skill.
				const skillIdsWithoutCurrent = skillIds.filter(currentSkillId => currentSkillId !== skillId)
				const getIndividualMoment = (variable: string, exponent: number) => getBernsteinMoment(inferredCoefficients[variable], exponent)
				const skillPolynomial = substitutePolynomialMoments(polynomial, getIndividualMoment, skillIdsWithoutCurrent)
				const polynomialCoefficients = skillPolynomial.coefficients as number[]

				// Shift the likelihood polynomial to the Bernstein basis.
				const degree = polynomialCoefficients.length - 1
				likelihoods[skillId].push(repeat(degree + 1, index => sum(repeat(index + 1, polynomialIndex => binomialCoefficient(degree - polynomialIndex, index - polynomialIndex) * polynomialCoefficients[polynomialIndex])) / binomialCoefficient(degree, index)))
			})
		})

		// Merge each skill's prior and likelihoods once, then compare the final result with its highest level.
		const now = new Date()
		const updateSet = fromKeys(allSkillIds, skillId => {
			const skillLevel = this.getSkillLevelObject(skillId)
			const coefficients = multiplyBernsteinPDFs(this.getSmoothedCoefficients(skillId), ...likelihoods[skillId])
			const result: SkillLevelUpdate = {
				coefficients,
				coefficientsOn: now,
				numPracticed: skillLevel.numPracticed + likelihoods[skillId].length,
			}
			const potentialNewHighest = smoothBernsteinCoefficients(coefficients, { time: 0, applyPracticeDecay: true, numProblemsPracticed: result.numPracticed })
			if (getBernsteinExpectedValue(potentialNewHighest) > getBernsteinExpectedValue(skillLevel.highestCoefficients)) {
				result.highest = potentialNewHighest
				result.highestOn = now
			}
			return result
		})

		this.update(updateSet)
		return updateSet
	}
}
