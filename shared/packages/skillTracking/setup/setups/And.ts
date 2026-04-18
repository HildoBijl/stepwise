import { type PolynomialMatrix, multiplyWithEqualDimension } from '../../polynomials'

import { type SkillListStorageValue, type SerializedSkillSetup, SkillListSetup, SkillSetup } from '../abstracts'

import { type SkillSetupLike, ensureSetup } from './Skill'

export type AndStorageValue = SkillListStorageValue

export class And extends SkillListSetup<AndStorageValue> {
	constructor(...skills: SkillSetupLike[]) {
		super(...skills.map(ensureSetup))
	}

	override toStorageValue(): AndStorageValue {
		return super.getSkillListStorageValue()
	}
	static fromStorageValue(storageValue: SkillListStorageValue, deserialize: (setup: SerializedSkillSetup) => SkillSetup): And {
		return new And(...storageValue.skills.map(skill => deserialize(skill)))
	}

	override getPolynomialMatrix(): PolynomialMatrix {
		return multiplyWithEqualDimension(this.skills.map(skill => skill.getPolynomialMatrix(this)))
	}
}

export const and = (...skills: SkillSetupLike[]): And => new And(...skills)
