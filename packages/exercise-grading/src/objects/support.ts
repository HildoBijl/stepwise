import { isPlainObject } from '@step-wise/js-utils'

import type { ValueEqualityOptions } from '@step-wise/value-equality'

export function isValueEqualityOptions(options: unknown): options is ValueEqualityOptions {
	return isPlainObject(options)
}
