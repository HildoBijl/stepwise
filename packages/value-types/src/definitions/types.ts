import type { AnySerializationAdapter, SerializationAdapters } from '@step-wise/serialization'
import type { AnyInputValueAdapter, InputValueAdapters } from '@step-wise/input-interpretation'
import type { AnyValueEqualityAdapter, ValueEqualityAdapters } from '@step-wise/value-equality'
export type ValueType<
	TInputValueAdapter extends AnyInputValueAdapter = AnyInputValueAdapter,
	TSerializationAdapter extends AnySerializationAdapter = AnySerializationAdapter,
	TValueEqualityAdapter extends AnyValueEqualityAdapter = AnyValueEqualityAdapter,
> = {
	inputValue?: TInputValueAdapter
	serialization?: TSerializationAdapter
	equality?: TValueEqualityAdapter
}

export type ValueTypes = Record<string, ValueType>

export type ValueTypeAdapters = {
	inputValueAdapters: InputValueAdapters
	serializationAdapters: SerializationAdapters
	equalityAdapters: ValueEqualityAdapters
}
