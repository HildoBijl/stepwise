import { type Polynomial, type PolynomialCoefficients, polynomialToString } from '@step-wise/polynomials'

export type GenericSerializedSkillSetup<TStorageValue = unknown, TType extends string = string> = { type: TType, value: TStorageValue }

export abstract class SkillSetup<TStorageValue = unknown> {

	// Fundamentals.

	get type(): string {
		return this.constructor.name
	}

	abstract toStorageValue(): TStorageValue
	get SO(): TStorageValue { // SO legacy
		return this.toStorageValue()
	}

	serialize(): GenericSerializedSkillSetup<TStorageValue> {
		return { type: this.type, value: this.toStorageValue() }
	}

	// Display functions.

	abstract toString(): string
	get str(): string {
		return this.toString()
	}

	// Properties.

	abstract isDeterministic(): boolean

	// Skill retrieval functions.

	// Get a Set of all skills in this set-up, finding it recursively.
	abstract getSkillSet(): Set<string>

	// Get an array of all skills in this set-up. Duplicates are filtered out. No sorting is applied.
	getSkillList(): string[] {
		return [...this.getSkillSet()]
	}

	// Functions revolving around the polynomial matrix.

	// Get the polynomial related to this set-up, in multi-dimensional matrix format.
	abstract getPolynomialCoefficients(parent?: SkillSetup<TStorageValue>): PolynomialCoefficients

	// Get the polynomial related to this set-up in string form.
	getPolynomialString(): string {
		return polynomialToString(this.getPolynomial())
	}

	// Get both the matrix and the skill list.
	getPolynomial(parent?: SkillSetup<TStorageValue>): Polynomial {
		return {
			coefficients: this.getPolynomialCoefficients(parent),
			variables: this.getSkillList(),
		}
	}
}
