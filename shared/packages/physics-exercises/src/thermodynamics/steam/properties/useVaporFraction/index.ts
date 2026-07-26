import { type SkillExercises } from '@step-wise/exercise-definition'

import useVaporFractionWithEnthalpy from './useVaporFractionWithEnthalpy'
import useVaporFractionWithEntropy from './useVaporFractionWithEntropy'

export default {
	examples: { useVaporFractionWithEnthalpy },
	exercises: { useVaporFractionWithEnthalpy, useVaporFractionWithEntropy },
} satisfies SkillExercises
