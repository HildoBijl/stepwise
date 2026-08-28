import { withSameExamples } from '@step-wise/exercise-bundling'

import powerOfProductOfPower from './powerOfProductOfPower.ts'
import productOfPowerOfPower from './productOfPowerOfPower.ts'
import productOfPowerOfProduct from './productOfPowerOfProduct.ts'

export default withSameExamples({ powerOfProductOfPower, productOfPowerOfPower, productOfPowerOfProduct })
