import { type SkillExerciseBundle } from '@step-wise/exercise-bundling'

import oneFractionWithSquare from './oneFractionWithSquare.ts'
import twoFractions from './twoFractions.ts'

export default {
	examples: { twoFractions },
	exercises: { twoFractions, oneFractionWithSquare },
} satisfies SkillExerciseBundle
