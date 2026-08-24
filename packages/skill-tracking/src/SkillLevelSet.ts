import { ensureArray, isPlainObject, fromKeys, repeat, sum, count } from '@step-wise/js-utils'
import { binomialCoefficient } from '@step-wise/math-tools'
import { oneMinusPolynomial, substitutePolynomialMoments } from '@step-wise/polynomials'
import { type BernsteinCoefficients, getBernsteinExpectedValue, getBernsteinMoment, multiplyBernsteinPDFs } from '@step-wise/bernstein-polynomials'
import { type SkillSetupLike, ensureSetup } from '@step-wise/skill-setup'
import { type SkillId, type SkillTree, ensureSkillId, expandSkillIdsWithDirectPrerequisitesAndLinks } from '@step-wise/skill-definition'

import type { StoredSkillLevel, StoredSkillLevelSet, SkillLevelData, SkillObservation, StoredSkillLevelUpdate, StoredSkillLevelUpdateSet } from './types'
import { inferenceCacheDuration } from './settings'
import { applySkillLevelDecay } from './decay'
import { getSetupExpectedSuccessRate, inferSetupCoefficients, inferSkillCoefficients } from './inference'
import { SkillLevel } from './SkillLevel'
import { ensureStoredSkillLevelUpdate, ensureSkillObservation } from './utils'

export class SkillLevelSet {
	private skillLevels: Record<string, SkillLevel> = {}
	private listeners = new Set<() => void>()
	private snapshot = {}

	constructor(private readonly skillTree: SkillTree, storedSkillLevelSet: StoredSkillLevelSet = {}) {
		if (!isPlainObject(skillTree)) throw new Error(`Invalid skill tree: expected a plain object but received something of type "${typeof skillTree}".`)
		if (!isPlainObject(storedSkillLevelSet)) throw new Error(`Invalid stored skill level set: expected a plain object but received something of type "${typeof storedSkillLevelSet}".`)

		Object.keys(storedSkillLevelSet).forEach(skillId => {
			const skill = this.skillTree[skillId]
			if (!skill) throw new Error(`Invalid skill given: a skill ID "${skillId}" was supplied inside of a stored skill level set, but this skill is not known in the full skill tree.`)
			this.skillLevels[skillId] = new SkillLevel(skill, storedSkillLevelSet[skillId])
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
		if (!skillLevel) throw new Error(`Invalid stored skill level: tried to access information about the skill "${skillId}" but the skill level for this skill is unknown.`)
		return skillLevel
	}

	hasSkillLevel(skillId: SkillId): boolean {
		return !!this.skillLevels[this.ensureSkillId(skillId)]
	}

	hasRequiredDataFor(skillId: SkillId): boolean {
		const skill = this.skillTree[this.ensureSkillId(skillId)]
		const linkedSkillIds = expandSkillIdsWithDirectPrerequisitesAndLinks(this.skillTree, [skill.id])
		return linkedSkillIds.every(linkedSkillId => this.hasSkillLevel(linkedSkillId))
	}

	/*
	 * Getters for inferred skills.
	 */

	private getSmoothedCoefficients(skillId: SkillId): BernsteinCoefficients {
		return this.getSkillLevelObject(skillId).smoothedCoefficients
	}

	getInferredCoefficients(skillId: SkillId): BernsteinCoefficients {
		const skill = this.skillTree[this.ensureSkillId(skillId)]
		const skillLevel = this.getSkillLevelObject(skillId)
		if (!this.isCoefficientsCacheValid(skillId)) {
			skillLevel.cache.inferred = {
				coefficients: inferSkillCoefficients(skill, relatedSkillId => this.getSmoothedCoefficients(relatedSkillId)),
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
		if (Date.now() - cacheEntry.on.getTime() >= inferenceCacheDuration) return false
		if (skillLevel.coefficientsOn >= cacheEntry.on) return false
		if (skill.prerequisiteIds.some(prerequisiteId => this.getSkillLevelObject(prerequisiteId).coefficientsOn >= cacheEntry.on)) return false
		if (skill.linkedSkillIds.some(linkedSkillId => this.getSkillLevelObject(linkedSkillId).coefficientsOn >= cacheEntry.on)) return false
		return true
	}

	getExpectedSuccessRate(skillId: SkillId): number {
		return getBernsteinExpectedValue(this.getInferredCoefficients(skillId))
	}

	/*
	 * Getters for inferred setups.
	 */

	getSetupExpectedSuccessRate(setup: SkillSetupLike): number {
		return getSetupExpectedSuccessRate(ensureSetup(setup), skillId => this.getSmoothedCoefficients(skillId))
	}

	getSetupInferredCoefficients(setup: SkillSetupLike, inferenceOrder?: number): BernsteinCoefficients {
		return inferSetupCoefficients(ensureSetup(setup), skillId => this.getSmoothedCoefficients(skillId), inferenceOrder)
	}

	getCombinedSetupExpectedSuccessRate(setups: (SkillSetupLike | undefined)[], inferenceOrders?: number | (number | undefined)[]): number {
		if (count(setups, setup => !!setup) === 1) return this.getSetupExpectedSuccessRate(setups.find(setup => !!setup) as SkillSetupLike)
		return getBernsteinExpectedValue(this.getCombinedSetupCoefficients(setups, inferenceOrders))
	}

	getCombinedSetupCoefficients(setups: (SkillSetupLike | undefined)[], inferenceOrders?: number | (number | undefined)[]): BernsteinCoefficients {
		const coefficients = setups.map((setup, index) => setup ? this.getSetupInferredCoefficients(setup, Array.isArray(inferenceOrders) ? inferenceOrders[index] : inferenceOrders) : undefined)
		return multiplyBernsteinPDFs(...coefficients.filter(coefficient => !!coefficient))
	}

	/*
	 * Getters for the inferred highest coefficients of skills.
	 */

	private getStoredHighestCoefficients(skillId: SkillId): BernsteinCoefficients {
		return this.getSkillLevelObject(skillId).highestCoefficients
	}

	getInferredHighestCoefficients(skillId: SkillId): BernsteinCoefficients {
		const skill = this.skillTree[this.ensureSkillId(skillId)]
		const skillLevel = this.getSkillLevelObject(skillId)
		if (!this.isHighestCacheValid(skillId)) {
			skillLevel.cache.inferredHighest = {
				coefficients: inferSkillCoefficients(skill, relatedSkillId => this.getStoredHighestCoefficients(relatedSkillId)),
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
		if (Date.now() - cacheEntry.on.getTime() >= inferenceCacheDuration) return false
		if (skillLevel.highestOn >= cacheEntry.on) return false
		if (skill.prerequisiteIds.some(prerequisiteId => this.getSkillLevelObject(prerequisiteId).highestOn >= cacheEntry.on)) return false
		if (skill.linkedSkillIds.some(linkedSkillId => this.getSkillLevelObject(linkedSkillId).highestOn >= cacheEntry.on)) return false
		return true
	}

	getHighestExpectedSuccessRate(skillId: SkillId): number {
		return getBernsteinExpectedValue(this.getInferredHighestCoefficients(skillId))
	}

	/*
	 * Getters for the inferred highest coefficients of setups.
	 */

	getSetupHighestExpectedSuccessRate(setup: SkillSetupLike): number {
		return getSetupExpectedSuccessRate(ensureSetup(setup), skillId => this.getStoredHighestCoefficients(skillId))
	}

	getSetupInferredHighestCoefficients(setup: SkillSetupLike, inferenceOrder: number): BernsteinCoefficients {
		return inferSetupCoefficients(ensureSetup(setup), skillId => this.getStoredHighestCoefficients(skillId), inferenceOrder)
	}

	/*
	 * Aggregated getters for inferred coefficients.
	 */

	getSkillLevel(skillId: SkillId): SkillLevelData {
		const skillLevelObject = this.getSkillLevelObject(skillId)
		return {
			skillId,
			coefficients: this.getInferredCoefficients(skillId),
			coefficientsOn: skillLevelObject.coefficientsOn,
			highest: this.getInferredHighestCoefficients(skillId),
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

	getSnapshot(): object {
		return this.snapshot
	}

	/*
	 * Updaters.
	 */

	applyUpdates(skillLevelUpdateSet: StoredSkillLevelUpdateSet): void {
		const ensuredUpdateSet = fromKeys(Object.keys(skillLevelUpdateSet), skillId => ensureStoredSkillLevelUpdate(skillLevelUpdateSet[skillId]))
		const updatesToApply: StoredSkillLevelUpdateSet = {}

		// Classify the complete update set before changing anything.
		Object.keys(ensuredUpdateSet).forEach(skillId => {
			this.ensureSkillId(skillId)
			const currentSkillLevel = this.skillLevels[skillId]
			const skillLevelUpdate = ensuredUpdateSet[skillId]
			if (!currentSkillLevel) {
				if (!('highest' in skillLevelUpdate) || !('highestOn' in skillLevelUpdate)) throw new TypeError(`Invalid skill level update: tried to update the skill level of skill "${skillId}" but this skill level was not known before, and only incomplete update data was provided.`)
				updatesToApply[skillId] = skillLevelUpdate
				return
			}

			const dateDifference = skillLevelUpdate.coefficientsOn.getTime() - currentSkillLevel.coefficientsOn.getTime()
			const practiceDifference = skillLevelUpdate.numPracticed - currentSkillLevel.numPracticed
			if (dateDifference >= 0 && practiceDifference >= 0) {
				if (dateDifference > 0 || practiceDifference > 0) updatesToApply[skillId] = skillLevelUpdate
				return
			}
			if (dateDifference <= 0 && practiceDifference <= 0) return
			throw new Error(`Conflicting skill level update for skill "${skillId}": coefficientsOn and numPracticed do not consistently describe a newer or older state.`)
		})
		if (Object.keys(updatesToApply).length === 0) return

		// When updates are necessary, set up an updated skillLevels object.
		this.skillLevels = { ...this.skillLevels }
		Object.keys(updatesToApply).forEach(skillId => {
			const skill = this.skillTree[skillId]
			const existingSkillLevel = this.skillLevels[skillId]
			const skillLevelUpdate = updatesToApply[skillId]
			if (existingSkillLevel) {
				existingSkillLevel.update(skillLevelUpdate)
			} else {
				this.skillLevels[skillId] = new SkillLevel(skill, skillLevelUpdate as StoredSkillLevel)
			}
		})
		Object.values(this.skillLevels).forEach(skillLevel => skillLevel.invalidateInferenceCache())
		this.snapshot = {}
		for (const listener of this.listeners) { listener() }
	}

	clear(): void {
		this.skillLevels = {}
		this.snapshot = {}
		for (const listener of this.listeners) { listener() }
	}

	/*
	 * Observations.
	 */

	// Apply an observation to the skill levels to update them. Returns the new coefficients of adjusted skills.
	applyObservation(observation: SkillObservation): StoredSkillLevelUpdateSet {
		return this.applyObservations([observation])
	}

	// Apply observations simultaneously. Returns the new coefficients of adjusted skills.
	applyObservations(observations: SkillObservation[]): StoredSkillLevelUpdateSet {
		// Validate the complete batch before calculating or applying any updates.
		const ensuredObservations = ensureArray(observations).map(ensureSkillObservation)
		const observationSkillIds = ensuredObservations.map(({ setup }) => {
			if (!setup.isDeterministic()) throw new TypeError(`Invalid observation processing: can only process observations of deterministic skills. The given skill set-up is a stochastic one.`)
			const skillIds = setup.getSkillList()
			const missingSkillId = skillIds.find(skillId => !this.hasRequiredDataFor(skillId))
			if (missingSkillId) throw new Error(`Invalid observation processing: the skill level data on the relevant skills has not been loaded yet. Data on "${missingSkillId}" and/or its prerequisites/links is not loaded in.`)
			return skillIds
		})
		if (ensuredObservations.length === 0) return {}

		// Take one inferred snapshot. Every observation in the batch must use the same prior information.
		const allSkillIds = [...new Set(observationSkillIds.flat())]
		const inferredCoefficients = fromKeys(allSkillIds, skillId => this.getInferredCoefficients(skillId))
		const likelihoods = fromKeys(allSkillIds, () => [] as BernsteinCoefficients[])

		ensuredObservations.forEach(({ setup, correct }, observationIndex) => {
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
			const result: StoredSkillLevelUpdate = {
				coefficients,
				coefficientsOn: now,
				numPracticed: skillLevel.numPracticed + likelihoods[skillId].length,
			}
			const potentialNewHighest = applySkillLevelDecay(coefficients, { elapsedTime: 0, applyPracticeEffect: true, practiceCount: result.numPracticed })
			if (getBernsteinExpectedValue(potentialNewHighest) > getBernsteinExpectedValue(skillLevel.highestCoefficients)) {
				result.highest = potentialNewHighest
				result.highestOn = now
			}
			return result
		})

		this.applyUpdates(updateSet)
		return updateSet
	}
}
