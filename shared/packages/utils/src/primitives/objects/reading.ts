import { ensurePlainObject } from './checks'

// Get a nested value through a path like ['x','y','z'] → obj.x.y.z
export function getByPath(obj: Record<string, any> | unknown, path: string[]): unknown {
	// Check the path array.
	if (!Array.isArray(path)) throw new TypeError('getByPath: path must be an array of strings.')
	if (path.some(p => typeof p !== 'string')) throw new TypeError('getByPath: path must be an array of strings.')

	// Walk down the path. Stop early on a dead end.
	let result: any = obj
	for (const key of path) {
		if (result === undefined || result === null) return undefined
		result = (result as any)[key]
	}
	return result
}

// JSON stringify without quotes around property names. It only handles primitives, arrays and plain objects: it throws on functions and functional objects.
export function stringifyJS(value: unknown): string {
	// Don't allow functions.
	if (typeof value === 'function') throw new TypeError('stringifyJS: value may not be/contain a function.')

	// Deal with standard cases.
	if (value === null) return 'null'
	if (value === undefined) return 'undefined'
	if (typeof value !== 'object') return JSON.stringify(value as any)

	// Iterate through arrays.
	if (Array.isArray(value)) return `[${value.map(v => stringifyJS(v)).join(',')}]`

	// For objects, only allow plain objects.
	const obj = ensurePlainObject(value)
	return `{${Object.keys(obj).map(key => `${key}:${stringifyJS(obj[key])}`).join(',')}}`
}
