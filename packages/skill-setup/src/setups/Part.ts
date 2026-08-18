import { ensureNumber } from '@step-wise/js-utils'
import { type PolynomialCoefficients, oneMinusPolynomial, scalePolynomial } from '@step-wise/polynomials'

import { type GenericSerializedSkillSetup, type SkillSetup, type SkillItemStorageValue, SkillItemSetup } from '../abstracts'

import { type SkillSetupLike, ensureSetup } from './Skill'

import { And } from './And'
import { Or } from './Or'

export type PartStorageValue = SkillItemStorageValue & { part?: number }
export type SerializedPart = GenericSerializedSkillSetup<PartStorageValue, 'Part'>

export class Part extends SkillItemSetup<PartStorageValue> {
	readonly type = 'Part'
	readonly part: number

	constructor(skill: SkillSetupLike, part = 0.5) {
		super(ensureSetup(skill))
		this.part = ensureNumber(part, { nonNegative: true })
		if (this.part > 1) throw new RangeError(`Invalid skill part: expected a number between 0 and 1, but received "${this.part}".`)
	}

	override toStorageValue(): PartStorageValue {
		return { ...super.getSkillItemStorageValue(), ...(this.part !== 0.5 ? { part: this.part } : {}) }
	}
	static fromStorageValue(storageValue: PartStorageValue, deserialize: (setup: GenericSerializedSkillSetup) => SkillSetup): Part {
		return new Part(deserialize(storageValue.skill), storageValue.part)
	}

	override toString(): string {
		return `${this.type.toLowerCase()}(${this.skill.toString()}${this.part !== 0.5 ? `, ${this.part}` : ''})`
	}

	override isDeterministic(): boolean {
		return this.part === 0 || (this.part === 1 && this.skill.isDeterministic())
	}

	override getPolynomialCoefficients(parent?: SkillSetup): PolynomialCoefficients {
		const expression = this.skill.getPolynomial(this)
		if (parent instanceof And) return oneMinusPolynomial(scalePolynomial(oneMinusPolynomial(expression), this.part)).coefficients
		if (parent instanceof Or) return scalePolynomial(expression, this.part).coefficients
		throw new Error(`Invalid polynomial matrix request: cannot determine the polynomial matrix of a Part set-up inside a set-up of type "${parent?.constructor?.name}". Either an "And" or "Or" set-up is expected around it.`)
	}
}

export const part = (skill: SkillSetupLike, part?: number): Part => new Part(skill, part)
