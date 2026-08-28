import { ensureArray, ensurePlainObject, union } from '@step-wise/js-utils'

import { type GenericSerializedSkillSetup, SkillSetup } from './SkillSetup.ts'

export type SkillListStorageValue<TChild = GenericSerializedSkillSetup> = { skills: readonly TChild[] }

export function ensureSkillListStorageValue(value: unknown): SkillListStorageValue<unknown> {
	const storageValue = ensurePlainObject(value)
	return { skills: ensureArray(storageValue.skills) }
}

export abstract class SkillListSetup<TStorageValue extends SkillListStorageValue> extends SkillSetup<TStorageValue> {
	readonly skills: readonly SkillSetup[]

	constructor(...skills: SkillSetup[]) {
		super()
		if (skills.length === 0) throw new Error(`Invalid skills list: expected at least one skill.`)
		this.skills = skills
	}

	protected getSkillListStorageValue(): SkillListStorageValue {
		return { skills: this.skills.map(skill => skill.serialize()) }
	}

	override isDeterministic(): boolean {
		return this.skills.every(skill => skill.isDeterministic())
	}

	override toString(): string {
		return `${this.type.toLowerCase()}(${this.skills.map(skill => skill.toString()).join(', ')})`
	}

	override getSkillSet(): Set<string> {
		return union(...this.skills.map(skill => skill.getSkillSet()))
	}
}
