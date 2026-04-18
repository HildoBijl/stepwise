import { type PolynomialMatrix, oneMinus, multiplyWithEqualDimension } from '../../polynomials'

import { type SkillListStorageValue, type SerializedSkillSetup, type SkillSetupLike, SkillListSetup, SkillSetup } from '../fundamentals'

export class Or extends SkillListSetup {
	static fromStorageValue(storageValue: SkillListStorageValue, deserialize: (setup: SerializedSkillSetup) => SkillSetup): Or {
		return new Or(...storageValue.skills.map(skill => deserialize(skill)))
	}

	override getPolynomialMatrix(): PolynomialMatrix {
		return oneMinus(multiplyWithEqualDimension(this.skills.map(skill => oneMinus(skill.getPolynomialMatrix(this)))))
	}
}

export const or = (...skills: SkillSetupLike[]): Or => new Or(...skills)
