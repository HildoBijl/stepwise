import { type PolynomialMatrix } from '../../polynomials'

import { SkillSetup } from './SkillSetup'

export class Skill extends SkillSetup {
	readonly skill

	constructor(skill: string) {
		super()
		this.skill = skill
	}

	override toStorageValue(): string {
		return this.skill
	}
	static fromStorageValue(storageValue: string): Skill {
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

export const skill = (skill: string): Skill => new Skill(skill)
