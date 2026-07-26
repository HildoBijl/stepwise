import { type SkillExercises } from '@step-wise/exercise-definition'

import calculateSpecificHeatAndMechanicalWorkIsobaric from './calculateSpecificHeatAndMechanicalWorkIsobaric'
import calculateSpecificHeatAndMechanicalWorkIsothermal from './calculateSpecificHeatAndMechanicalWorkIsothermal'
import calculateSpecificHeatAndMechanicalWorkIsentropic from './calculateSpecificHeatAndMechanicalWorkIsentropic'

export default {
	examples: { calculateSpecificHeatAndMechanicalWorkIsobaric },
	exercises: { calculateSpecificHeatAndMechanicalWorkIsobaric, calculateSpecificHeatAndMechanicalWorkIsothermal, calculateSpecificHeatAndMechanicalWorkIsentropic },
} satisfies SkillExercises
