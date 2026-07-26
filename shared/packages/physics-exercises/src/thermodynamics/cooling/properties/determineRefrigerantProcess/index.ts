import { type SkillExercises } from '@step-wise/exercise-definition'

import determineRefrigerantProcessIsobaric from './determineRefrigerantProcessIsobaric'
import determineRefrigerantProcessIsentropic from './determineRefrigerantProcessIsentropic'

export default {
	examples: { determineRefrigerantProcessIsobaric },
	exercises: { determineRefrigerantProcessIsobaric, determineRefrigerantProcessIsentropic },
} satisfies SkillExercises
