import { isPlainObject, fromKeys, repeat, sum, count } from '@step-wise/utils'
import { binomial } from '@step-wise/math-tools'
import { type PolynomialExpression, oneMinusPolynomial, substituteIndividualMomentsIntoPolynomial } from '@step-wise/polynomials'
import { type BernsteinCoefficients, mergeBernsteinCoefficients, getBernsteinExpectedValue, getBernsteinMoment } from '@step-wise/bernstein-polynomials'
import { type SkillSetupLike, ensureSetup } from '@step-wise/skill-setup'
import { type SkillId, type SkillTree, ensureSkillId, includeDirectPrerequisitesAndLinks } from '@step-wise/skill-definition'

import type { RawSkillLevel, RawSkillLevelSet, SkillLevelOutput, SkillObservation, SkillLevelUpdate, SkillLevelUpdateSet } from './types'
import { maxSkillLevelCacheTime } from './settings'
import { smoothBernsteinCoefficients } from './smoothing'
import { getSetupExpectedValue, getSetupCoefficients, applyInferenceForSkill } from './inference'
import { SkillLevel } from './SkillLevel'

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
		const linkedSkillIds = includeDirectPrerequisitesAndLinks(this.skillTree, skill.id)
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
		return skillLevel.cache.inferred!.coefficients
	}

	private isCoefficientsCacheValid(skillId: SkillId): boolean {
		const skill = this.skillTree[this.ensureSkillId(skillId)]
		const skillLevel = this.getSkillLevelObject(skillId)
		const cacheEntry = skillLevel.cache.inferred
		if (!cacheEntry) return false
		if (Date.now() - cacheEntry.on.getTime() >= maxSkillLevelCacheTime) return false
		if (skillLevel.coefficientsOn >= cacheEntry.on) return false
		if (skill.prerequisites.some(prerequisiteId => this.getSkillLevelObject(prerequisiteId).coefficientsOn >= cacheEntry.on)) return false
		if (skill.linkedSkills.some(linkedSkillId => this.getSkillLevelObject(linkedSkillId).coefficientsOn >= cacheEntry.on)) return false
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
		return mergeBernsteinCoefficients(...coefficients.filter(c => !!c))
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
		return skillLevel.cache.inferredHighest!.coefficients
	}

	private isHighestCacheValid(skillId: SkillId): boolean {
		const skill = this.skillTree[this.ensureSkillId(skillId)]
		const skillLevel = this.getSkillLevelObject(skillId)
		const cacheEntry = skillLevel.cache.inferredHighest
		if (!cacheEntry) return false
		if (Date.now() - cacheEntry.on.getTime() >= maxSkillLevelCacheTime) return false
		if (skillLevel.highestOn >= cacheEntry.on) return false
		if (skill.prerequisites.some(prerequisiteId => this.getSkillLevelObject(prerequisiteId).highestOn >= cacheEntry.on)) return false
		if (skill.linkedSkills.some(linkedSkillId => this.getSkillLevelObject(linkedSkillId).highestOn >= cacheEntry.on)) return false
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
		// Determine when a skill should update.
		const shouldUpdateSkill = (skillId: SkillId): boolean => {
			const currentSkillLevel = this.skillLevels[skillId]
			if (!currentSkillLevel) return true

			const skillLevelUpdate = skillLevelUpdateSet[skillId]
			if (currentSkillLevel.coefficientsOn.getTime() < skillLevelUpdate.coefficientsOn.getTime()) return true
			if (currentSkillLevel.numPracticed < skillLevelUpdate.numPracticed) return true
			return false
		}
		if (Object.keys(skillLevelUpdateSet).every(skillId => !shouldUpdateSkill(skillId))) return

		// When updates are necessary, set up an updated skillLevels object.
		this.skillLevels = { ...this.skillLevels }
		Object.keys(skillLevelUpdateSet).forEach(skillId => {
			const skill = this.skillTree[this.ensureSkillId(skillId)]
			if (!shouldUpdateSkill(skillId)) return

			const existingSkillLevel = this.skillLevels[skillId]
			const skillLevelUpdate = skillLevelUpdateSet[skillId]
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
		// Check that the set-up is valid and has data present.
		const { setup, correct } = observation
		if (!setup.isDeterministic()) throw new TypeError(`Invalid observation processing: can only process observations of deterministic skills. The given skill set-up is a stochastic one.`)
		const skillIds = setup.getSkillList()
		if (skillIds.some(skillId => !this.hasDataOn(skillId))) throw new Error(`Invalid observation processing: the skill level data on the relevant skills has not been loaded yet. Data on "${skillIds.find(skillId => !this.hasDataOn(skillId))}" and/or its prerequisites/links is not loaded in.`)

		// Gather general data.
		const now = new Date()
		const polynomial = correct ? setup.getPolynomialExpression() : oneMinusPolynomial(setup.getPolynomialExpression())
		const inferredCoefficients = fromKeys(skillIds, skillId => this.getCoefficients(skillId))

		// Walk through the skill list and perform the update.
		const updateSet = fromKeys(skillIds, skillId => {
			// Find the expected value of the skill polynomial with as only remaining parameter the current skill.
			const skillIdsWithoutCurrent = skillIds.filter(currSkillId => currSkillId !== skillId)
			const inferredCoefficientsWithoutCurrent = skillIdsWithoutCurrent.map(skillId => inferredCoefficients[skillId])
			const getIndividualMoment = (index: number, exponent: number) => getBernsteinMoment(inferredCoefficientsWithoutCurrent[index], exponent)
			const skillPolynomial = substituteIndividualMomentsIntoPolynomial(polynomial, getIndividualMoment, skillIdsWithoutCurrent) as PolynomialExpression
			const polynomialCoefficients = skillPolynomial.matrix as number[]

			// Shift the coefficients of the polynomial to the Bernstein basis.
			const n = polynomialCoefficients.length - 1
			const shiftedCoefficients = repeat(n + 1, i => sum(repeat(i + 1, j => binomial(n - j, i - j) * polynomialCoefficients[j])) / binomial(n, i))

			// Merge the two coefficient sets together.
			const previousCoefficients = this.getSmoothedCoefficients(skillId)
			const coefficients = mergeBernsteinCoefficients(shiftedCoefficients, previousCoefficients)

			// Set up the result object.
			const skillLevel = this.getSkillLevelObject(skillId)
			const result: SkillLevelUpdate = { coefficients, coefficientsOn: now, numPracticed: skillLevel.numPracticed + 1 }

			// If the new coefficients are higher than the previous highest (after immediate smoothing) then update those too.
			const previousHighest = skillLevel.highestCoefficients
			const potentialNewHighest = smoothBernsteinCoefficients(coefficients, { time: 0, applyPracticeDecay: true, numProblemsPracticed: result.numPracticed })
			if (getBernsteinExpectedValue(potentialNewHighest) > getBernsteinExpectedValue(previousHighest)) {
				result.highest = potentialNewHighest
				result.highestOn = now
			}

			// All done.
			return result
		})

		// Apply the updates internally and then return them.
		this.update(updateSet)
		return updateSet
	}

	// Apply a set of observations to implement at the same time. Returns the new coefficients of adjusted skills.
	processObservations(observations: SkillObservation[]): SkillLevelUpdateSet {
		return Object.assign({}, ...observations.map(observation => this.processObservation(observation)))
	}
}
