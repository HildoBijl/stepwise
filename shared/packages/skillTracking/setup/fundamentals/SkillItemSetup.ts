import { type SkillItemStorageValue } from './types'
import { SkillSetup } from './SkillSetup'
import { ensureSetup } from './ensureSetup'

export abstract class SkillItemSetup extends SkillSetup {
	readonly skill: SkillSetup

	constructor(skill: SkillSetup | string) {
		super()
		this.skill = ensureSetup(skill)
	}

	override toStorageValue(): SkillItemStorageValue {
		return { skill: this.skill.serialize() }
	}

	override isDeterministic(): boolean {
		return this.skill.isDeterministic()
	}

	override getSkillSet(): Set<string> {
		return this.skill.getSkillSet()
	}
}
