import { type SkillExerciseBundle } from '@step-wise/exercise-bundling'

import oneFractionWithSquare from './oneFractionWithSquare'
import twoFractions from './twoFractions'

export default {
	examples: { twoFractions },
	exercises: { twoFractions, oneFractionWithSquare },
} satisfies SkillExerciseBundle
