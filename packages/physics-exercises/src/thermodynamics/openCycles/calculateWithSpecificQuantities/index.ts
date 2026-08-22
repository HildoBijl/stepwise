import { type SkillExerciseBundle } from '@step-wise/exercise-bundling'

import calculateWithSpecificQuantitiesDensity from './calculateWithSpecificQuantitiesDensity'
import calculateWithSpecificQuantitiesBoiler from './calculateWithSpecificQuantitiesBoiler'
import calculateWithSpecificQuantitiesTurbine from './calculateWithSpecificQuantitiesTurbine'

export default {
	examples: { calculateWithSpecificQuantitiesDensity },
	exercises: { calculateWithSpecificQuantitiesDensity, calculateWithSpecificQuantitiesBoiler, calculateWithSpecificQuantitiesTurbine },
} satisfies SkillExerciseBundle
