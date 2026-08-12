import { type SkillExercises } from '@step-wise/exercise-bundling'

import calculateSpecificHeatAndMechanicalWorkIsobaric from './calculateSpecificHeatAndMechanicalWorkIsobaric'
import calculateSpecificHeatAndMechanicalWorkIsothermal from './calculateSpecificHeatAndMechanicalWorkIsothermal'
import calculateSpecificHeatAndMechanicalWorkIsentropic from './calculateSpecificHeatAndMechanicalWorkIsentropic'

export default {
	examples: { calculateSpecificHeatAndMechanicalWorkIsobaric },
	exercises: { calculateSpecificHeatAndMechanicalWorkIsobaric, calculateSpecificHeatAndMechanicalWorkIsothermal, calculateSpecificHeatAndMechanicalWorkIsentropic },
} satisfies SkillExercises
