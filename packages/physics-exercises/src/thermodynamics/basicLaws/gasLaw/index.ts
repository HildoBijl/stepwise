import { type SkillExerciseBundle } from '@step-wise/exercise-bundling'

import gasLawLightBulb from './gasLawLightBulb.ts'
import gasLawHeliumBalloon from './gasLawHeliumBalloon.ts'
import gasLawDivingCylinder from './gasLawDivingCylinder.ts'
import gasLawBicyclePump from './gasLawBicyclePump.ts'
import gasLawWeatherBalloon from './gasLawWeatherBalloon.ts'

export default {
	examples: { gasLawLightBulb },
	exercises: { gasLawLightBulb, gasLawHeliumBalloon, gasLawDivingCylinder, gasLawBicyclePump, gasLawWeatherBalloon },
} satisfies SkillExerciseBundle
