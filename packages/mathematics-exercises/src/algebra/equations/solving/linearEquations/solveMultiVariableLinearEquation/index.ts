import { type SkillExerciseBundle } from '@step-wise/exercise-bundling'

import basic from './basic.ts'
import withBrackets from './withBrackets.ts'
import withFraction from './withFraction.ts'

export default {
	examples: { basic },
	exercises: { basic, withBrackets, withFraction },
} satisfies SkillExerciseBundle
