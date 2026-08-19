import { type PolynomialCoefficients, oneMinusPolynomial, multiplyPolynomials } from '@step-wise/polynomials'

import { type SkillListStorageValue, type GenericSerializedSkillSetup, ensureSkillListStorageValue, SkillListSetup, SkillSetup } from '../abstracts'

import { type SkillSetupLike, ensureSetup } from './Skill'

export type OrStorageValue = SkillListStorageValue
export type SerializedOr = GenericSerializedSkillSetup<OrStorageValue, 'Or'>

export class Or extends SkillListSetup<OrStorageValue> {
	readonly type = 'Or'

	constructor(...skills: SkillSetupLike[]) {
		super(...skills.map(ensureSetup))
	}

	override toStorageValue(): OrStorageValue {
		return super.getSkillListStorageValue()
	}
	static fromStorageValue(storageValue: SkillListStorageValue, deserialize: (setup: unknown) => SkillSetup): Or {
		return new Or(...ensureSkillListStorageValue(storageValue).skills.map(skill => deserialize(skill)))
	}

	override getPolynomialCoefficients(): PolynomialCoefficients {
		return oneMinusPolynomial(multiplyPolynomials(this.skills.map(skill => oneMinusPolynomial(skill.getPolynomial(this))), this.getSkillList())).coefficients
	}
}

export const or = (...skills: SkillSetupLike[]): Or => new Or(...skills)
