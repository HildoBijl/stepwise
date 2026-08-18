export interface ObjectCreationOptions {
	filterUndefined?: boolean
}

// Create an object from an array of keys by calling `mapper(key, index, result)` for each key.
export function fromKeys<T>(keys: readonly string[], mapper: (key: string, index: number, result: Record<string, T>) => T | undefined, options: ObjectCreationOptions = {}): Record<string, T> {
	const { filterUndefined = true } = options
	const result: Record<string, T> = {}
	for (let i = 0; i < keys.length; i++) {
		const key = keys[i]
		const entry = mapper(key, i, result)
		if (entry !== undefined || !filterUndefined) Object.defineProperty(result, key, { value: entry as T, enumerable: true, configurable: true, writable: true })
	}
	return result
}

// Create an object from two parallel arrays: keys and values. Undefined values are filtered out by default.
export function fromKeysAndValues<T>(keys: readonly string[], values: readonly T[], options: ObjectCreationOptions = {}): Record<string, T> {
	if (keys.length !== values.length) throw new RangeError('fromKeysAndValues: keys and values must have the same length.')
	return fromKeys(keys, (_, index) => values[index], options)
}
