import { type PolynomialMatrix, multiplyWithEqualDimension } from '../../polynomials'

import { type SkillListStorageValue, type SerializedSkillSetup, type SkillSetupLike, SkillListSetup, SkillSetup } from '../fundamentals'

export class And extends SkillListSetup {
	static fromStorageValue(storageValue: SkillListStorageValue, deserialize: (setup: SerializedSkillSetup) => SkillSetup): And {
		return new And(...storageValue.skills.map(skill => deserialize(skill)))
	}

	override getPolynomialMatrix(): PolynomialMatrix {
		return multiplyWithEqualDimension(this.skills.map(skill => skill.getPolynomialMatrix(this)))
	}
}

export const and = (...skills: SkillSetupLike[]): And => new And(...skills)
