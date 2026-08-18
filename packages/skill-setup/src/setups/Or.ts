import { type NonEmptyPolynomialList, type PolynomialCoefficients, oneMinusPolynomial, multiplyPolynomials } from '@step-wise/polynomials'

import { type SkillListStorageValue, type GenericSerializedSkillSetup, SkillListSetup, SkillSetup } from '../abstracts'

import { type SkillSetupLike, ensureSetup } from './Skill'

export type OrStorageValue = SkillListStorageValue
export type SerializedOr = GenericSerializedSkillSetup<OrStorageValue, 'Or'>

export class Or extends SkillListSetup<OrStorageValue> {
	constructor(...skills: SkillSetupLike[]) {
		super(...skills.map(ensureSetup))
	}

	override toStorageValue(): OrStorageValue {
		return super.getSkillListStorageValue()
	}
	static fromStorageValue(storageValue: SkillListStorageValue, deserialize: (setup: GenericSerializedSkillSetup) => SkillSetup): Or {
		return new Or(...storageValue.skills.map(skill => deserialize(skill)))
	}

	override getPolynomialCoefficients(): PolynomialCoefficients {
		return oneMinusPolynomial(multiplyPolynomials(this.skills.map(skill => oneMinusPolynomial(skill.getPolynomial(this))) as unknown as NonEmptyPolynomialList, this.getSkillList())).coefficients
	}
}

export const or = (...skills: SkillSetupLike[]): Or => new Or(...skills)
