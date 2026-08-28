import { type SkillExerciseBundle } from '@step-wise/exercise-bundling'

import calculateSpecificHeatAndMechanicalWorkIsobaric from './calculateSpecificHeatAndMechanicalWorkIsobaric.ts'
import calculateSpecificHeatAndMechanicalWorkIsothermal from './calculateSpecificHeatAndMechanicalWorkIsothermal.ts'
import calculateSpecificHeatAndMechanicalWorkIsentropic from './calculateSpecificHeatAndMechanicalWorkIsentropic.ts'

export default {
	examples: { calculateSpecificHeatAndMechanicalWorkIsobaric },
	exercises: { calculateSpecificHeatAndMechanicalWorkIsobaric, calculateSpecificHeatAndMechanicalWorkIsothermal, calculateSpecificHeatAndMechanicalWorkIsentropic },
} satisfies SkillExerciseBundle
