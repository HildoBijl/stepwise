import { ensurePlainObject } from '@step-wise/js-utils'

import { type GenericSerializedSkillSetup, SkillSetup } from './SkillSetup.ts'

export type SkillItemStorageValue<TChild = GenericSerializedSkillSetup> = { skill: TChild }

export function ensureSkillItemStorageValue(value: unknown): SkillItemStorageValue<unknown> {
	const storageValue = ensurePlainObject(value)
	if (!Object.hasOwn(storageValue, 'skill')) throw new TypeError(`Invalid skill item storage value: expected a "skill" property.`)
	return { skill: storageValue.skill }
}

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
