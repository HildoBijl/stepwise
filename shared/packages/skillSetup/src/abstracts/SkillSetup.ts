import { type PolynomialExpression, type PolynomialMatrix, polynomialToString } from '@step-wise/polynomials'

export type SerializedSkillSetup<TValue = unknown, TType extends string = string> = { type: TType, value: TValue }

export abstract class SkillSetup<TStorageValue = unknown> {

	// Fundamentals.

	get type(): string {
		return this.constructor.name
	}

	abstract toStorageValue(): TStorageValue
	get SO(): TStorageValue { // SO legacy
		return this.toStorageValue()
	}

	serialize(): SerializedSkillSetup<TStorageValue> {
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
	abstract getPolynomialMatrix(parent?: SkillSetup): PolynomialMatrix

	// Get the polynomial related to this set-up in string form.
	getPolynomialString(): string {
		return polynomialToString(this.getPolynomialExpression())
	}

	// Get both the matrix and the skill list.
	getPolynomialExpression(parent?: SkillSetup): PolynomialExpression {
		return {
			matrix: this.getPolynomialMatrix(parent),
			list: this.getSkillList(),
		}
	}
}
