export type ValueEqualityOptions = Record<string, unknown>

export type ValueEqualityAdapter<TValue = unknown, TOptions extends ValueEqualityOptions = never> = {
	isValue: (value: unknown) => value is TValue
	areEqual: (inputValue: TValue, expectedValue: TValue, options: TOptions | undefined) => boolean
} & ([TOptions] extends [never]
	? { isOptions?: never }
	: { isOptions: (options: unknown) => options is TOptions })
