import { type SkillExerciseBundle } from '@step-wise/exercise-bundling'

import oneFractionWithNumber from './oneFractionWithNumber.ts'
import oneFractionWithVariable from './oneFractionWithVariable.ts'
import twoFractionsWithNumber from './twoFractionsWithNumber.ts'
import twoFractionsWithVariable from './twoFractionsWithVariable.ts'

export default {
	examples: { twoFractionsWithNumber },
	exercises: { oneFractionWithNumber, oneFractionWithVariable, twoFractionsWithNumber, twoFractionsWithVariable },
} satisfies SkillExerciseBundle
