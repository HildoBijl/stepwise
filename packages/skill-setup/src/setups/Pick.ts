import { ensureInteger, ensureNumberArray, forEachCombination, product } from '@step-wise/js-utils'
import { type PolynomialCoefficients, type Polynomial, addPolynomials, multiplyPolynomials, scalePolynomial } from '@step-wise/polynomials'

import { type GenericSerializedSkillSetup, type SkillSetup, type SkillListStorageValue, SkillListSetup } from '../abstracts'

import { type SkillSetupLike, ensureSetup } from './Skill'

export type PickStorageValue = SkillListStorageValue & { number?: number, weights?: readonly number[] }
export type SerializedPick = GenericSerializedSkillSetup<PickStorageValue, 'Pick'>

export class Pick extends SkillListSetup<PickStorageValue> {
	readonly type = 'Pick'
	readonly number: number
	readonly weights: readonly number[]

	constructor(skills: readonly SkillSetupLike[], number = 1, weights?: readonly number[]) {
		super(...skills.map(ensureSetup))

		this.number = ensureInteger(number, { nonNegative: true, nonZero: true })
		if (this.number > this.skills.length) throw new RangeError(`Invalid Pick number: expected at most ${this.skills.length} picked skills, but received "${this.number}".`)

		this.weights = ensureNumberArray(weights ?? this.skills.map(() => 1), { nonNegative: true, nonZero: true })
		if (this.weights.length !== this.skills.length) throw new Error(`Invalid Pick weights: expected ${this.skills.length} weights but received ${this.weights.length}.`)
	}

	override toStorageValue(): PickStorageValue {
		return {
			...super.getSkillListStorageValue(),
			...(this.number !== 1 ? { number: this.number } : {}),
			...(!this.weights.every(weight => weight === 1) ? { weights: this.weights } : {}),
		}
	}
	static fromStorageValue(storageValue: PickStorageValue, deserialize: (setup: unknown) => SkillSetup): Pick {
		return new Pick(storageValue.skills.map(skill => deserialize(skill)), storageValue.number, storageValue.weights)
	}

	override isDeterministic(): boolean {
		return this.number === this.skills.length && super.isDeterministic()
	}

	override toString(): string {
		const showWeights = !this.weights.every(weight => weight === 1)
		const showNumber = this.number !== 1 || showWeights
		return `${this.type.toLowerCase()}([${this.skills.map(skill => skill.toString()).join(', ')}]${showNumber ? `, ${this.number}` : ''}${showWeights ? `, [${this.weights.join(', ')}]` : ''})`
	}

	override getPolynomialCoefficients(): PolynomialCoefficients {
		const skillList = this.getSkillList()
		const expressions: Polynomial[] = []
		let sumOfWeights = 0

		// Walk through all combinations. For each combination, calculate the polynomial and its weight, and then calculate the weighted average.
		forEachCombination(this.skills.length, this.number, (...option) => {
			const weight = product(option.map(index => this.weights[index])) // Use a weight proportional to the product of the individual skill weights.
			sumOfWeights += weight
			expressions.push(scalePolynomial(multiplyPolynomials(option.map(index => this.skills[index].getPolynomial(this)), skillList), weight))
		})
		return scalePolynomial(addPolynomials(expressions, skillList), 1 / sumOfWeights).coefficients
	}
}

export const pick = (skills: readonly SkillSetupLike[], number?: number, weights?: readonly number[]): Pick => new Pick(skills, number, weights)
