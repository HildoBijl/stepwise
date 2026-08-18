import { ensureInteger } from '@step-wise/js-utils'
import { type PolynomialCoefficients, raisePolynomialToPower } from '@step-wise/polynomials'

import { type GenericSerializedSkillSetup, type SkillItemStorageValue, SkillItemSetup, SkillSetup } from '../abstracts'

import { type SkillSetupLike, ensureSetup } from './Skill'

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
		return new Repeat(deserialize(storageValue.skill), storageValue.repeat)
	}

	override toString(): string {
		return `${this.type.toLowerCase()}(${this.skill.toString()}, ${this.repeat})`
	}

	override getPolynomialCoefficients(): PolynomialCoefficients {
		return raisePolynomialToPower(this.skill.getPolynomial(this), this.repeat).coefficients
	}
}

export const repeat = (skill: SkillSetupLike, repeat: number): Repeat => new Repeat(skill, repeat)
