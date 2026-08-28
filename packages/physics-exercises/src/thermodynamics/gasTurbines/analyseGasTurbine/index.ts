import { type SkillExerciseBundle } from '@step-wise/exercise-bundling'

import analyseGasTurbine1 from './analyseGasTurbine1.ts'
import analyseGasTurbine2 from './analyseGasTurbine2.ts'
import analyseGasTurbine3 from './analyseGasTurbine3.ts'

export default {
	examples: { analyseGasTurbine1 },
	exercises: { analyseGasTurbine1, analyseGasTurbine2, analyseGasTurbine3 },
} satisfies SkillExerciseBundle
