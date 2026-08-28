import { type SkillExerciseBundle } from '@step-wise/exercise-bundling'

import calculateProcessStepCompressor from './calculateProcessStepCompressor.ts'
import calculateProcessStepDivingCylinder from './calculateProcessStepDivingCylinder.ts'
import calculateProcessStepBalloon from './calculateProcessStepBalloon.ts'
import calculateProcessStepGasTurbine from './calculateProcessStepGasTurbine.ts'

export default {
	examples: { calculateProcessStepCompressor },
	exercises: { calculateProcessStepCompressor, calculateProcessStepDivingCylinder, calculateProcessStepBalloon, calculateProcessStepGasTurbine },
} satisfies SkillExerciseBundle
