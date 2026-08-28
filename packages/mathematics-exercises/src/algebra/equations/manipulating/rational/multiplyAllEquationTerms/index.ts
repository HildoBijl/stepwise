import { withSameExamples } from '@step-wise/exercise-bundling'

import multiplyTerms from './multiplyTerms.ts'
import divideTerms from './divideTerms.ts'

export default withSameExamples({ multiplyTerms, divideTerms })
