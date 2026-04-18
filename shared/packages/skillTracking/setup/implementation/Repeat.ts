import { ensureInt } from '@step-wise/utils'

import { type PolynomialMatrix, multiplyWithEqualDimension } from '../../polynomials'

import { type SerializedSkillSetup, type SkillSetupLike, type RepeatStorageValue, SkillItemSetup, SkillSetup } from '../fundamentals'

export class Repeat extends SkillItemSetup {
	readonly repeat: number

	constructor(skill: SkillSetupLike, repeat: number) {
		super(skill)
		this.repeat = ensureInt(repeat, true, true)
	}

	override toStorageValue(): RepeatStorageValue {
		return { ...super.toStorageValue(), repeat: this.repeat }
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
