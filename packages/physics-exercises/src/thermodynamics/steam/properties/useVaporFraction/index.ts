import { type SkillExerciseBundle } from '@step-wise/exercise-bundling'

import useVaporFractionWithEnthalpy from './useVaporFractionWithEnthalpy.ts'
import useVaporFractionWithEntropy from './useVaporFractionWithEntropy.ts'

export default {
	examples: { useVaporFractionWithEnthalpy },
	exercises: { useVaporFractionWithEnthalpy, useVaporFractionWithEntropy },
} satisfies SkillExerciseBundle
