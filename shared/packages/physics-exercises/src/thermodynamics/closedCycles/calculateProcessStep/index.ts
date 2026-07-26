import { type SkillExercises } from '@step-wise/exercise-definition'

import calculateProcessStepCompressor from './calculateProcessStepCompressor'
import calculateProcessStepDivingCylinder from './calculateProcessStepDivingCylinder'
import calculateProcessStepBalloon from './calculateProcessStepBalloon'
import calculateProcessStepGasTurbine from './calculateProcessStepGasTurbine'

export default {
	examples: { calculateProcessStepCompressor },
	exercises: { calculateProcessStepCompressor, calculateProcessStepDivingCylinder, calculateProcessStepBalloon, calculateProcessStepGasTurbine },
} satisfies SkillExercises
