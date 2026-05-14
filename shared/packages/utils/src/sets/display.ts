export function setToString<T>(set: ReadonlySet<T>): string {
	return `[${[...set].map(element => `'${element}'`).join(', ')}]`
}
