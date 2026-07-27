import { type SkillExercises } from '@step-wise/exercise-definition'

import basic from './basic'
import withBrackets from './withBrackets'
import withFraction from './withFraction'

export default {
	examples: { basic },
	exercises: { basic, withBrackets, withFraction },
} satisfies SkillExercises
