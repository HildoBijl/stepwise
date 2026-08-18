import { ensureInteger, ensureNumberArray, product, repeatMultidimensional } from '@step-wise/js-utils'
import { type NonEmptyPolynomialList, type PolynomialCoefficients, type Polynomial, addPolynomials, multiplyPolynomials, scalePolynomial } from '@step-wise/polynomials'

import { type GenericSerializedSkillSetup, type SkillSetup, type SkillListStorageValue, SkillListSetup } from '../abstracts'

import { type SkillSetupLike, ensureSetup } from './Skill'

export type PickStorageValue = SkillListStorageValue & { number?: number, weights?: number[] }
export type SerializedPick = GenericSerializedSkillSetup<PickStorageValue, 'Pick'>

export class Pick extends SkillListSetup<PickStorageValue> {
	readonly type = 'Pick'
	readonly number: number
	readonly weights: number[]

	constructor(skills: SkillSetupLike[], number = 1, weights?: number[]) {
		super(...skills.map(ensureSetup))

		this.number = ensureInteger(number, { nonNegative: true, nonZero: true })
		if (this.number >= this.skills.length) throw new Error(`Invalid Pick number: expected a number of picked skills smaller than the given number of skills (${this.skills.length}) but a number "${this.number}" was given.`)

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
	static fromStorageValue(storageValue: PickStorageValue, deserialize: (setup: GenericSerializedSkillSetup) => SkillSetup): Pick {
		return new Pick(storageValue.skills.map(skill => deserialize(skill)), storageValue.number, storageValue.weights)
	}

	override isDeterministic(): boolean {
		return false
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

		// Walk through all options of picks. For each option, calculate the polynomial matrix and the weight. Calculate the weighted average.
		repeatMultidimensional(new Array(this.number).fill(this.skills.length), (...option) => {
			if (option.some((value, index) => index > 0 && value <= option[index - 1])) return 0 // Only consider ascending indices.
			const weight = product(option.map(index => this.weights[index])) // Use a weight proportional to the product of the individual skill weights.
			sumOfWeights += weight
			expressions.push(scalePolynomial(multiplyPolynomials(option.map(index => this.skills[index].getPolynomial(this)) as unknown as NonEmptyPolynomialList, skillList), weight))
		})
		return scalePolynomial(addPolynomials(expressions as unknown as NonEmptyPolynomialList, skillList), 1 / sumOfWeights).coefficients
	}
}

export const pick = (skills: SkillSetupLike[], number?: number, weights?: number[]): Pick => new Pick(skills, number, weights)
