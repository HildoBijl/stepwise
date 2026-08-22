import { type SkillExerciseBundle } from '@step-wise/exercise-bundling'

import calculateWithInternalEnergyEngine from './calculateWithInternalEnergyEngine'
import calculateWithInternalEnergyBalloon from './calculateWithInternalEnergyBalloon'
import calculateWithInternalEnergyTire from './calculateWithInternalEnergyTire'

export default {
	examples: { calculateWithInternalEnergyEngine },
	exercises: { calculateWithInternalEnergyEngine, calculateWithInternalEnergyBalloon, calculateWithInternalEnergyTire },
} satisfies SkillExerciseBundle
