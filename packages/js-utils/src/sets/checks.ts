export function isSet<T = unknown>(value: unknown): value is ReadonlySet<T> {
	return value instanceof Set
}
