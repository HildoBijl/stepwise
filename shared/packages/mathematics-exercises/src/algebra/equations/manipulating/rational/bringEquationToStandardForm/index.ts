import { type SkillExercises } from '@step-wise/exercise-bundling'

import quadraticTwoFractions from './quadraticTwoFractions'
import cubicOneFraction from './cubicOneFraction'

export default {
	examples: { quadraticTwoFractions },
	exercises: { quadraticTwoFractions, cubicOneFraction },
} satisfies SkillExercises
