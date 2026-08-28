import { type SkillExerciseBundle } from '@step-wise/exercise-bundling'

import schematizeFixedSupport from './schematizeFixedSupport.ts'
import schematizeHingeSupport from './schematizeHingeSupport.ts'
import schematizeRollerHingeSupport from './schematizeRollerHingeSupport.ts'
import schematizeRollerSupport from './schematizeRollerSupport.ts'

export default {
	examples: {},
	exercises: { schematizeFixedSupport, schematizeHingeSupport, schematizeRollerHingeSupport, schematizeRollerSupport },
} satisfies SkillExerciseBundle
