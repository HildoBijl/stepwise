import { ensureInteger } from '@step-wise/js-utils'
import { type Polynomial, raisePolynomialToPower } from '@step-wise/polynomials'

import { type GenericSerializedSkillSetup, type SkillItemStorageValue, ensureSkillItemStorageValue, SkillItemSetup, SkillSetup } from '../abstracts/index.ts'

import { type SkillSetupLike, ensureSetup } from './Skill.ts'

export type RepeatStorageValue = SkillItemStorageValue & { repeat: number }
export type SerializedRepeat = GenericSerializedSkillSetup<RepeatStorageValue, 'Repeat'>

export class Repeat extends SkillItemSetup<RepeatStorageValue> {
	readonly type = 'Repeat'
	readonly repeat: number

	constructor(skill: SkillSetupLike, repeat: number) {
		super(ensureSetup(skill))
		this.repeat = ensureInteger(repeat, { nonNegative: true, nonZero: true })
	}

	override toStorageValue(): RepeatStorageValue {
		return { ...super.getSkillItemStorageValue(), repeat: this.repeat }
	}
	static fromStorageValue(storageValue: RepeatStorageValue, deserialize: (setup: unknown) => SkillSetup): Repeat {
		const { skill } = ensureSkillItemStorageValue(storageValue)
		return new Repeat(deserialize(skill), storageValue.repeat)
	}

	override toString(): string {
		return `${this.type.toLowerCase()}(${this.skill.toString()}, ${this.repeat})`
	}

	override getPolynomial(): Polynomial {
		return raisePolynomialToPower(this.skill.getPolynomial(this), this.repeat)
	}
}

export const repeat = (skill: SkillSetupLike, repeat: number): Repeat => new Repeat(skill, repeat)
