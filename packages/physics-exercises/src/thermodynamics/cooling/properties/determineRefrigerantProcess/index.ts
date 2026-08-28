import { type SkillExerciseBundle } from '@step-wise/exercise-bundling'

import determineRefrigerantProcessIsobaric from './determineRefrigerantProcessIsobaric.ts'
import determineRefrigerantProcessIsentropic from './determineRefrigerantProcessIsentropic.ts'

export default {
	examples: { determineRefrigerantProcessIsobaric },
	exercises: { determineRefrigerantProcessIsobaric, determineRefrigerantProcessIsentropic },
} satisfies SkillExerciseBundle
