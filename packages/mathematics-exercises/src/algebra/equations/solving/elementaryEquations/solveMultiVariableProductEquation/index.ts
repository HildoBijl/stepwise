import { withSameExamples } from '@step-wise/exercise-bundling'

import inNumerator from './inNumerator.ts'
import inDenominator from './inDenominator.ts'

export default withSameExamples({ inNumerator, inDenominator })
