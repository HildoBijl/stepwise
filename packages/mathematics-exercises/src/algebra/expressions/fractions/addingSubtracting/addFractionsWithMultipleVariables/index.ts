import { type SkillExerciseBundle } from '@step-wise/exercise-bundling'

import mergeFractionsNumberInDenominator from './mergeFractionsNumberInDenominator.ts'
import splitFractionsNumberInDenominator from './splitFractionsNumberInDenominator.ts'
import mergeFractionsSquareAppearing from './mergeFractionsSquareAppearing.ts'
import splitFractionsSquareAppearing from './splitFractionsSquareAppearing.ts'
import mergeFractionsVariableDenominator from './mergeFractionsVariableDenominator.ts'
import splitFractionsVariableDenominator from './splitFractionsVariableDenominator.ts'

export default {
	examples: { mergeFractionsNumberInDenominator, splitFractionsNumberInDenominator },
	exercises: { mergeFractionsNumberInDenominator, splitFractionsNumberInDenominator, mergeFractionsSquareAppearing, splitFractionsSquareAppearing, mergeFractionsVariableDenominator, splitFractionsVariableDenominator },
} satisfies SkillExerciseBundle
