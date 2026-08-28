import { type SkillExerciseBundle } from '@step-wise/exercise-bundling'

import quadraticTwoFractions from './quadraticTwoFractions.ts'
import cubicOneFraction from './cubicOneFraction.ts'

export default {
	examples: { quadraticTwoFractions },
	exercises: { quadraticTwoFractions, cubicOneFraction },
} satisfies SkillExerciseBundle
