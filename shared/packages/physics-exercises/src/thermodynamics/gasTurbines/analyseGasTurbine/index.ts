import { type SkillExercises } from '@step-wise/exercise-definition'

import analyseGasTurbine1 from './analyseGasTurbine1'
import analyseGasTurbine2 from './analyseGasTurbine2'
import analyseGasTurbine3 from './analyseGasTurbine3'

export default {
	examples: { analyseGasTurbine1 },
	exercises: { analyseGasTurbine1, analyseGasTurbine2, analyseGasTurbine3 },
} satisfies SkillExercises
