import { type SkillExerciseBundle } from '@step-wise/exercise-bundling'

import basic from './basic'
import withBrackets from './withBrackets'
import withFraction from './withFraction'

export default {
	examples: { basic },
	exercises: { basic, withBrackets, withFraction },
} satisfies SkillExerciseBundle
