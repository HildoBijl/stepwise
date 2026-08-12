import { type SkillExercises } from '@step-wise/exercise-bundling'

import schematizeFixedSupport from './schematizeFixedSupport'
import schematizeHingeSupport from './schematizeHingeSupport'
import schematizeRollerHingeSupport from './schematizeRollerHingeSupport'
import schematizeRollerSupport from './schematizeRollerSupport'

export default {
	examples: {},
	exercises: { schematizeFixedSupport, schematizeHingeSupport, schematizeRollerHingeSupport, schematizeRollerSupport },
} satisfies SkillExercises
