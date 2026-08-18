import { type NonEmptyPolynomialList, type PolynomialCoefficients, multiplyPolynomials } from '@step-wise/polynomials'

import { type SkillListStorageValue, type GenericSerializedSkillSetup, SkillListSetup, SkillSetup } from '../abstracts'

import { type SkillSetupLike, ensureSetup } from './Skill'

export type AndStorageValue = SkillListStorageValue
export type SerializedAnd = GenericSerializedSkillSetup<AndStorageValue, 'And'>

export class And extends SkillListSetup<AndStorageValue> {
	constructor(...skills: SkillSetupLike[]) {
		super(...skills.map(ensureSetup))
	}

	override toStorageValue(): AndStorageValue {
		return super.getSkillListStorageValue()
	}
	static fromStorageValue(storageValue: SkillListStorageValue, deserialize: (setup: GenericSerializedSkillSetup) => SkillSetup<AndStorageValue>): And {
		return new And(...storageValue.skills.map(skill => deserialize(skill)))
	}

	override getPolynomialCoefficients(): PolynomialCoefficients {
		return multiplyPolynomials(this.skills.map(skill => skill.getPolynomial(this)) as unknown as NonEmptyPolynomialList, this.getSkillList()).coefficients
	}
}

export const and = (...skills: SkillSetupLike[]): And => new And(...skills)
