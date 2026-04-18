import { union } from '@step-wise/utils'

import type { SkillListStorageValue } from './types'
import { type SkillSetupLike, SkillSetup } from './SkillSetup'
import { ensureSetup } from './ensureSetup'

export abstract class SkillListSetup extends SkillSetup {
	constructor(...skills: SkillSetupLike[]) {
		super()
		if (skills.length === 0) throw new Error(`Invalid skills list: expected at least one skill.`)
		this.skills = skills.map(skill => ensureSetup(skill))
	}

	readonly skills: SkillSetup[]

	override toStorageValue(): SkillListStorageValue {
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
