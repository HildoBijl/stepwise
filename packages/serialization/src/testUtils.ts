import { hasOnlyKeys, isPlainObject, isString } from '@step-wise/js-utils'

import type { SerializationAdapter, SerializationAdapters } from './types.ts'

export const TestValueType = 'TestValue'
export type SerializedTestValue = { type: typeof TestValueType, value: string }

export class TestValue {
	readonly type = TestValueType
	constructor(readonly value: string) {}
}

export const testValueAdapter = {
	isDomainValue: (value: unknown): value is TestValue => value instanceof TestValue,
	isSerializedValue: (value: unknown): value is SerializedTestValue => isPlainObject(value) && hasOnlyKeys(value, ['type', 'value']) && value.type === TestValueType && isString(value.value),
	serialize: (value: TestValue): SerializedTestValue => ({ type: TestValueType, value: value.value }),
	deserialize: (value: SerializedTestValue): TestValue => new TestValue(value.value),
} satisfies SerializationAdapter<TestValue, SerializedTestValue>

export const testValueAdapters = { [TestValueType]: testValueAdapter } satisfies SerializationAdapters
