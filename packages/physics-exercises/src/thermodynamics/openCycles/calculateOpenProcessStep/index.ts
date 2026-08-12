import { type SkillExercises } from '@step-wise/exercise-bundling'

import calculateOpenProcessStepWing from './calculateOpenProcessStepWing'
import calculateOpenProcessStepCompressor from './calculateOpenProcessStepCompressor'
import calculateOpenProcessStepGasTurbine from './calculateOpenProcessStepGasTurbine'

export default {
	examples: { calculateOpenProcessStepWing },
	exercises: { calculateOpenProcessStepWing, calculateOpenProcessStepCompressor, calculateOpenProcessStepGasTurbine },
} satisfies SkillExercises
