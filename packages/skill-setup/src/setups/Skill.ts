import { type Polynomial, createPolynomial } from '@step-wise/polynomials'

import { type GenericSerializedSkillSetup, SkillSetup } from '../abstracts/index.ts'

export type SkillId = string
export type SkillStorageValue = SkillId
export type SerializedSkill = GenericSerializedSkillSetup<SkillStorageValue, 'Skill'>

export class Skill extends SkillSetup<SkillStorageValue> {
	readonly type = 'Skill'
	readonly skill: SkillId

	constructor(skill: SkillStorageValue) {
		super()
		if (typeof skill !== 'string') throw new TypeError(`Invalid skill identifier: expected a string, but received type "${typeof skill}".`)
		if (skill.trim().length === 0) throw new RangeError(`Invalid skill identifier: expected a non-empty string.`)
		this.skill = skill
	}

	override toStorageValue(): SkillStorageValue {
		return this.skill
	}
	static fromStorageValue(storageValue: SkillStorageValue): Skill {
		return new Skill(storageValue)
	}

	override toString(): string {
		return `"${this.skill}"`
	}

	override isDeterministic(): boolean {
		return true
	}

	override getSkillSet(): Set<string> {
		return new Set([this.skill])
	}

	override getPolynomial(): Polynomial {
		return createPolynomial([{ coefficient: 1, exponents: [1] }], [this.skill])
	}
}

export const skill = (skill: SkillStorageValue): Skill => new Skill(skill)

// Add an ensure method that can turn strings into Skill objects.
export type SkillSetupLike = SkillSetup<unknown> | string
export function ensureSetup(setup: SkillSetupLike): SkillSetup<unknown> {
	if (setup instanceof SkillSetup) return setup
	if (typeof setup === 'string') return new Skill(setup)
	throw new Error(`Invalid skill: expected a skill or skill set-up, but received "${JSON.stringify(setup)}".`)
}
