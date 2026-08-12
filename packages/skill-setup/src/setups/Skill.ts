import { type PolynomialMatrix } from '@step-wise/polynomials'

import { type GenericSerializedSkillSetup, SkillSetup } from '../abstracts'

export type SkillId = string
export type SkillStorageValue = SkillId
export type SerializedSkill = GenericSerializedSkillSetup<SkillStorageValue, 'Skill'>

export class Skill extends SkillSetup<SkillStorageValue> {
	readonly skill

	constructor(skill: SkillStorageValue) {
		super()
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

	override getPolynomialMatrix(): PolynomialMatrix {
		return [0, 1] // x
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
