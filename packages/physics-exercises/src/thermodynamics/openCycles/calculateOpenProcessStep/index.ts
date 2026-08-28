import { type SkillExerciseBundle } from '@step-wise/exercise-bundling'

import calculateOpenProcessStepWing from './calculateOpenProcessStepWing.ts'
import calculateOpenProcessStepCompressor from './calculateOpenProcessStepCompressor.ts'
import calculateOpenProcessStepGasTurbine from './calculateOpenProcessStepGasTurbine.ts'

export default {
	examples: { calculateOpenProcessStepWing },
	exercises: { calculateOpenProcessStepWing, calculateOpenProcessStepCompressor, calculateOpenProcessStepGasTurbine },
} satisfies SkillExerciseBundle
