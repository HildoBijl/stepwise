import { type Polynomial, polynomialToString } from '@step-wise/polynomials'

export type GenericSerializedSkillSetup<TStorageValue = unknown, TType extends string = string> = { type: TType, value: TStorageValue }

export abstract class SkillSetup<TStorageValue = unknown> {
	abstract readonly type: string

	// Fundamentals.

	abstract toStorageValue(): TStorageValue

	serialize(): GenericSerializedSkillSetup<TStorageValue> {
		return { type: this.type, value: this.toStorageValue() }
	}

	// Display functions.

	abstract toString(): string

	// Properties.

	abstract isDeterministic(): boolean

	// Skill retrieval functions.

	// Get a Set of all skills in this set-up, finding it recursively.
	abstract getSkillSet(): Set<string>

	// Get an array of all skills in this set-up. Duplicates are filtered out. No sorting is applied.
	getSkillList(): string[] {
		return [...this.getSkillSet()]
	}

	// Polynomial functions.

	// Get the polynomial related to this set-up.
	abstract getPolynomial(parent?: SkillSetup): Polynomial

	// Get the polynomial related to this set-up in string form.
	getPolynomialString(): string {
		return polynomialToString(this.getPolynomial())
	}
}
