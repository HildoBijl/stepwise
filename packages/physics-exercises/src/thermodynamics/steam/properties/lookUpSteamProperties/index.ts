import { type SkillExerciseBundle } from '@step-wise/exercise-bundling'

import steamPropertiesAtTemperature from './steamPropertiesAtTemperature.ts'
import steamPropertiesAtPressure from './steamPropertiesAtPressure.ts'
import steamPropertiesSuperheated from './steamPropertiesSuperheated.ts'

export default {
	examples: { steamPropertiesAtTemperature },
	exercises: { steamPropertiesAtTemperature, steamPropertiesAtPressure, steamPropertiesSuperheated },
} satisfies SkillExerciseBundle
