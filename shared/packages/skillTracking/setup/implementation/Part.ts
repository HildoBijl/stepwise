import { type PolynomialMatrix, oneMinus, multiplyByConstant } from '../../polynomials'

import { type SerializedSkillSetup, type SkillSetup, type SkillSetupLike, type PartStorageValue, SkillItemSetup } from '../fundamentals'

import { And } from './And'
import { Or } from './Or'

export class Part extends SkillItemSetup {
	readonly part: number

	constructor(skill: SkillSetupLike, part = 0.5) {
		super(skill)
		this.part = part
		if (this.part < 0 || this.part > 1) throw new Error(`Invalid skill part: the "part" parameter of the skill set-up must be a number between 0 and 1. This is not the case: a value of "${this.part}" was given.`)
	}

	override toStorageValue(): PartStorageValue {
		return { ...super.toStorageValue(), ...(this.part !== 0.5 ? { part: this.part } : {}) }
	}
	static fromStorageValue(storageValue: PartStorageValue, deserialize: (setup: SerializedSkillSetup) => SkillSetup): Part {
		return new Part(deserialize(storageValue.skill), storageValue.part)
	}

	override toString(): string {
		return `${this.type.toLowerCase()}(${this.skill.toString()}${this.part !== 0.5 ? `, ${this.part}` : ''})`
	}

	override isDeterministic(): boolean {
		return false
	}

	override getPolynomialMatrix(parent?: SkillSetup): PolynomialMatrix {
		const matrix = this.skill.getPolynomialMatrix(this)
		if (parent instanceof And) return oneMinus(multiplyByConstant(oneMinus(matrix), this.part))
		if (parent instanceof Or) return multiplyByConstant(matrix, this.part)
		throw new Error(`Invalid polynomial matrix request: cannot determine the polynomial matrix of a Part set-up inside a set-up of type "${parent?.constructor?.name}". Either an "And" or "Or" set-up is expected around it.`)
	}
}

export const part = (skill: SkillSetupLike, part: number): Part => new Part(skill, part)
