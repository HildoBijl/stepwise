import type { AnyInputValueAdapter } from '@step-wise/input-interpretation'
import type { AnySerializationAdapter } from '@step-wise/serialization'
import type { AnyValueEqualityAdapter } from '@step-wise/value-equality'

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
