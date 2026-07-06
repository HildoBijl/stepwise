import { type PolynomialMatrix, multiplyPolynomials } from '@step-wise/polynomials'

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

	override getPolynomialMatrix(): PolynomialMatrix {
		return multiplyPolynomials(this.skills.map(skill => skill.getPolynomialExpression(this)), this.getSkillList()).matrix
	}
}

export const and = (...skills: SkillSetupLike[]): And => new And(...skills)
