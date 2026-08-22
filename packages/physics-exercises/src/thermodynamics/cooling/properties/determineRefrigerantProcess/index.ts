import { type SkillExerciseBundle } from '@step-wise/exercise-bundling'

import determineRefrigerantProcessIsobaric from './determineRefrigerantProcessIsobaric'
import determineRefrigerantProcessIsentropic from './determineRefrigerantProcessIsentropic'

export default {
	examples: { determineRefrigerantProcessIsobaric },
	exercises: { determineRefrigerantProcessIsobaric, determineRefrigerantProcessIsentropic },
} satisfies SkillExerciseBundle
