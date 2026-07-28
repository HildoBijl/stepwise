import { type SkillExercises } from '@step-wise/exercise-bundling'

import withoutBrackets from './withoutBrackets'
import withBrackets from './withBrackets'

export default {
	examples: { withoutBrackets },
	exercises: { withoutBrackets, withBrackets },
} satisfies SkillExercises
