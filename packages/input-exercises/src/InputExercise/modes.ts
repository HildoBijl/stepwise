export function throwUnsupportedMode(mode: never): never {
	throw new Error(`Unsupported exercise mode: "${mode}".`)
}
