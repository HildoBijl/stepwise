import { type Polynomial, oneMinusPolynomial, multiplyPolynomials } from '@step-wise/polynomials'

import { type SkillListStorageValue, type GenericSerializedSkillSetup, ensureSkillListStorageValue, SkillListSetup, SkillSetup } from '../abstracts/index.ts'

import { type SkillSetupLike, ensureSetup } from './Skill.ts'

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

	override getPolynomial(): Polynomial {
		return oneMinusPolynomial(multiplyPolynomials(this.skills.map(skill => oneMinusPolynomial(skill.getPolynomial(this))), this.getSkillList()))
	}
}

export const or = (...skills: SkillSetupLike[]): Or => new Or(...skills)
