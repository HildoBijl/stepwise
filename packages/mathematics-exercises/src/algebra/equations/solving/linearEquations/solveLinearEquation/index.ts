import { type SkillExerciseBundle } from '@step-wise/exercise-bundling'

import withoutBrackets from './withoutBrackets.ts'
import withBrackets from './withBrackets.ts'

export default {
	examples: { withoutBrackets },
	exercises: { withoutBrackets, withBrackets },
} satisfies SkillExerciseBundle
