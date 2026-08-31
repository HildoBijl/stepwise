import { describe, expect, it } from 'vitest'

import { deserializeData, serializeData } from './index.ts'
import { TestValue, testValueAdapters } from './testUtils.ts'

describe('serialization round trips', () => {
	it('preserves nested data through JSON storage with supplied adapters', () => {
		const data = { values: [new TestValue('first'), new TestValue('second')], nested: { enabled: true } }
		const storedData = JSON.parse(JSON.stringify(serializeData(data, testValueAdapters)))
		expect(deserializeData(storedData, testValueAdapters)).toEqual(data)
	})
})
