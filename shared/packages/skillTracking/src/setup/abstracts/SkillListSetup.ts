import { union } from '@step-wise/utils'

import { type SerializedSkillSetup, SkillSetup } from './SkillSetup'

export type SkillListStorageValue<TChild = SerializedSkillSetup> = { skills: TChild[] }

export abstract class SkillListSetup<TStorageValue extends SkillListStorageValue = SkillListStorageValue> extends SkillSetup<TStorageValue> {
	constructor(...skills: SkillSetup[]) {
		super()
		if (skills.length === 0) throw new Error(`Invalid skills list: expected at least one skill.`)
		this.skills = skills
	}

	readonly skills: SkillSetup[]

	protected getSkillListStorageValue(): SkillListStorageValue {
		return { skills: this.skills.map(skill => skill.serialize()) }
	}

	override isDeterministic(): boolean {
		return this.skills.every(skill => skill.isDeterministic())
	}

	override toString(): string {
		return `${this.type.toLowerCase()}(${this.skills.map(skill => skill.str).join(', ')})`
	}

	override getSkillSet(): Set<string> {
		return union(...this.skills.map(skill => skill.getSkillSet()))
	}
}
