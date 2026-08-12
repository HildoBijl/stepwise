import { type SkillExercises } from '@step-wise/exercise-bundling'

import oneFractionWithNumber from './oneFractionWithNumber'
import oneFractionWithVariable from './oneFractionWithVariable'
import twoFractionsWithNumber from './twoFractionsWithNumber'
import twoFractionsWithVariable from './twoFractionsWithVariable'

export default {
	examples: { twoFractionsWithNumber },
	exercises: { oneFractionWithNumber, oneFractionWithVariable, twoFractionsWithNumber, twoFractionsWithVariable },
} satisfies SkillExercises
