import { type GenericSerializedSkillSetup, SkillSetup } from './SkillSetup'

export type SkillItemStorageValue<TChild = GenericSerializedSkillSetup> = { skill: TChild }

export abstract class SkillItemSetup<TStorageValue extends SkillItemStorageValue = SkillItemStorageValue> extends SkillSetup<TStorageValue> {
	readonly skill: SkillSetup

	constructor(skill: SkillSetup) {
		super()
		this.skill = skill
	}

	protected getSkillItemStorageValue(): SkillItemStorageValue {
		return { skill: this.skill.serialize() }
	}

	override isDeterministic(): boolean {
		return this.skill.isDeterministic()
	}

	override getSkillSet(): Set<string> {
		return this.skill.getSkillSet()
	}
}
