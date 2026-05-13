export function isSet<T = unknown>(value: unknown): value is Set<T> {
	return value instanceof Set
}

export function isReadonlySet<T = unknown>(value: unknown): value is ReadonlySet<T> {
	return value instanceof Set
}
