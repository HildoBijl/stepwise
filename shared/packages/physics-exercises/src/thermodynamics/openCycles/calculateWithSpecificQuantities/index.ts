import { type SkillExercises } from '@step-wise/exercise-definition'

import calculateWithSpecificQuantitiesDensity from './calculateWithSpecificQuantitiesDensity'
import calculateWithSpecificQuantitiesBoiler from './calculateWithSpecificQuantitiesBoiler'
import calculateWithSpecificQuantitiesTurbine from './calculateWithSpecificQuantitiesTurbine'

export default {
	examples: { calculateWithSpecificQuantitiesDensity },
	exercises: { calculateWithSpecificQuantitiesDensity, calculateWithSpecificQuantitiesBoiler, calculateWithSpecificQuantitiesTurbine },
} satisfies SkillExercises
