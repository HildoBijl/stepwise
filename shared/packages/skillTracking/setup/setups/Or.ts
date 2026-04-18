import { type PolynomialMatrix, oneMinus, multiplyWithEqualDimension } from '../../polynomials'

import { type SkillListStorageValue, type SerializedSkillSetup, SkillListSetup, SkillSetup } from '../abstracts'

import { type SkillSetupLike, ensureSetup } from './Skill'

export type OrStorageValue = SkillListStorageValue

export class Or extends SkillListSetup<OrStorageValue> {
	constructor(...skills: SkillSetupLike[]) {
		super(...skills.map(ensureSetup))
	}

	override toStorageValue(): OrStorageValue {
		return super.getSkillListStorageValue()
	}
	static fromStorageValue(storageValue: SkillListStorageValue, deserialize: (setup: SerializedSkillSetup) => SkillSetup): Or {
		return new Or(...storageValue.skills.map(skill => deserialize(skill)))
	}

	override getPolynomialMatrix(): PolynomialMatrix {
		return oneMinus(multiplyWithEqualDimension(this.skills.map(skill => oneMinus(skill.getPolynomialMatrix(this)))))
	}
}

export const or = (...skills: SkillSetupLike[]): Or => new Or(...skills)
