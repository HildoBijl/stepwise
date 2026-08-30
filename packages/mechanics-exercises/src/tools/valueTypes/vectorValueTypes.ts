import type { ValueTypes } from '@step-wise/value-types'

import { VectorType, vectorValueType } from './vector.ts'

export const vectorValueTypes = {
	[VectorType]: vectorValueType,
} satisfies ValueTypes

export { VectorType }
