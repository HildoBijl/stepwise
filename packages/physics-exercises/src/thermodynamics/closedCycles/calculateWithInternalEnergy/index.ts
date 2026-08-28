import { type SkillExerciseBundle } from '@step-wise/exercise-bundling'

import calculateWithInternalEnergyEngine from './calculateWithInternalEnergyEngine.ts'
import calculateWithInternalEnergyBalloon from './calculateWithInternalEnergyBalloon.ts'
import calculateWithInternalEnergyTire from './calculateWithInternalEnergyTire.ts'

export default {
	examples: { calculateWithInternalEnergyEngine },
	exercises: { calculateWithInternalEnergyEngine, calculateWithInternalEnergyBalloon, calculateWithInternalEnergyTire },
} satisfies SkillExerciseBundle
