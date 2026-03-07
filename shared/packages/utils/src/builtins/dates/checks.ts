// Check whether the given value is a valid Date object.
export function isDate(x: unknown): x is Date {
	return x instanceof Date && !Number.isNaN(x.getTime())
}

// Ensure the given value is a valid Date object.
export function ensureDate(x: unknown): Date {
	if (isDate(x)) return x

	const date = new Date(x as string | number | Date)
	if (isDate(date)) return date

	throw new TypeError(`Invalid date encountered: received "${String(x)}" which could not be converted into a date.`)
}
