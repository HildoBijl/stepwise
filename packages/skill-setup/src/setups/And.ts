import { type Polynomial, multiplyPolynomials } from '@step-wise/polynomials'

import { type SkillListStorageValue, type GenericSerializedSkillSetup, ensureSkillListStorageValue, SkillListSetup, SkillSetup } from '../abstracts/index.ts'

import { type SkillSetupLike, ensureSetup } from './Skill.ts'

export type AndStorageValue = SkillListStorageValue
export type SerializedAnd = GenericSerializedSkillSetup<AndStorageValue, 'And'>

export class And extends SkillListSetup<AndStorageValue> {
	readonly type = 'And'

	constructor(...skills: SkillSetupLike[]) {
		super(...skills.map(ensureSetup))
	}

	override toStorageValue(): AndStorageValue {
		return super.getSkillListStorageValue()
	}
	static fromStorageValue(storageValue: SkillListStorageValue, deserialize: (setup: unknown) => SkillSetup): And {
		return new And(...ensureSkillListStorageValue(storageValue).skills.map(skill => deserialize(skill)))
	}

	override getPolynomial(): Polynomial {
		return multiplyPolynomials(this.skills.map(skill => skill.getPolynomial(this)), this.getSkillList())
	}
}

export const and = (...skills: SkillSetupLike[]): And => new And(...skills)
