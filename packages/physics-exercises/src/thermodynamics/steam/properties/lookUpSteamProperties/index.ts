import { type SkillExercises } from '@step-wise/exercise-bundling'

import steamPropertiesAtTemperature from './steamPropertiesAtTemperature'
import steamPropertiesAtPressure from './steamPropertiesAtPressure'
import steamPropertiesSuperheated from './steamPropertiesSuperheated'

export default {
	examples: { steamPropertiesAtTemperature },
	exercises: { steamPropertiesAtTemperature, steamPropertiesAtPressure, steamPropertiesSuperheated },
} satisfies SkillExercises
