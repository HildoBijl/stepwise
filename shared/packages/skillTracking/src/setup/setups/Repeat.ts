import { ensureInt } from '@step-wise/utils'

import { type PolynomialMatrix, multiplyWithEqualDimension } from '../../polynomials'

import { type SerializedSkillSetup, type SkillItemStorageValue, SkillItemSetup, SkillSetup } from '../abstracts'

import { type SkillSetupLike, ensureSetup } from './Skill'

export type RepeatStorageValue = SkillItemStorageValue & { repeat: number }

export class Repeat extends SkillItemSetup<RepeatStorageValue> {
	readonly repeat: number

	constructor(skill: SkillSetupLike, repeat: number) {
		super(ensureSetup(skill))
		this.repeat = ensureInt(repeat, true, true)
	}

	override toStorageValue(): RepeatStorageValue {
		return { ...super.getSkillItemStorageValue(), repeat: this.repeat }
	}
	static fromStorageValue(storageValue: RepeatStorageValue, deserialize: (setup: SerializedSkillSetup) => SkillSetup): Repeat {
		return new Repeat(deserialize(storageValue.skill), storageValue.repeat)
	}

	override toString(): string {
		return `${this.type.toLowerCase()}(${this.skill.toString()}, ${this.repeat})`
	}

	override getPolynomialMatrix(): PolynomialMatrix {
		return multiplyWithEqualDimension(new Array(this.repeat).fill(this.skill.getPolynomialMatrix(this)))
	}
}

export const repeat = (skill: SkillSetupLike, repeat: number): Repeat => new Repeat(skill, repeat)
