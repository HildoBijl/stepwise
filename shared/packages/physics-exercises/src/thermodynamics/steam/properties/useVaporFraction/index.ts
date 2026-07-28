import { type SkillExercises } from '@step-wise/exercise-bundling'

import useVaporFractionWithEnthalpy from './useVaporFractionWithEnthalpy'
import useVaporFractionWithEntropy from './useVaporFractionWithEntropy'

export default {
	examples: { useVaporFractionWithEnthalpy },
	exercises: { useVaporFractionWithEnthalpy, useVaporFractionWithEntropy },
} satisfies SkillExercises
