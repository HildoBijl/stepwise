export function setToString<T>(set: ReadonlySet<T>): string {
	return `${JSON.stringify([...set])}`
}
