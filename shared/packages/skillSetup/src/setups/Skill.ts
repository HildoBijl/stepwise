import { type PolynomialMatrix } from '@step-wise/polynomials'

import { SkillSetup } from '../abstracts/SkillSetup'

export type SkillStorageValue = string
export type SkillSetupLike = SkillSetup | SkillStorageValue

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

export function ensureSetup(setup: SkillSetupLike): SkillSetup {
	if (setup instanceof SkillSetup) return setup
	if (typeof setup === 'string') return new Skill(setup)
	throw new Error(`Invalid skill: expected a skill or skill set-up, but received "${JSON.stringify(setup)}".`)
}
