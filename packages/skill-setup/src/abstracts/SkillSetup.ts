import { type Polynomial, polynomialToString } from '@step-wise/polynomials'

export type GenericSerializedSkillSetup<TStorageValue = unknown, TType extends string = string> = { type: TType, value: TStorageValue }

export abstract class SkillSetup<TStorageValue = unknown> {
	abstract readonly type: string

	abstract toStorageValue(): TStorageValue

	serialize(): GenericSerializedSkillSetup<TStorageValue> {
		return { type: this.type, value: this.toStorageValue() }
	}

	abstract toString(): string

	abstract isDeterministic(): boolean

	abstract getSkillSet(): Set<string>

	getSkillList(): string[] {
		return [...this.getSkillSet()]
	}

	abstract getPolynomial(parent?: SkillSetup): Polynomial

	getPolynomialString(): string {
		return polynomialToString(this.getPolynomial())
	}
}
