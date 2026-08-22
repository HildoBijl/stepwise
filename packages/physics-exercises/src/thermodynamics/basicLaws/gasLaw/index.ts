import { type SkillExerciseBundle } from '@step-wise/exercise-bundling'

import gasLawLightBulb from './gasLawLightBulb'
import gasLawHeliumBalloon from './gasLawHeliumBalloon'
import gasLawDivingCylinder from './gasLawDivingCylinder'
import gasLawBicyclePump from './gasLawBicyclePump'
import gasLawWeatherBalloon from './gasLawWeatherBalloon'

export default {
	examples: { gasLawLightBulb },
	exercises: { gasLawLightBulb, gasLawHeliumBalloon, gasLawDivingCylinder, gasLawBicyclePump, gasLawWeatherBalloon },
} satisfies SkillExerciseBundle
