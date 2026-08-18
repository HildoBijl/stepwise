export type PropertyPath = readonly (string | number)[]

// Get a nested value through a path like ['x','y','z'] → obj.x.y.z
export function getByPath(obj: unknown, path: PropertyPath): unknown {
	// Check the path array.
	if (!Array.isArray(path) || path.some(key => typeof key !== 'string' && typeof key !== 'number')) throw new TypeError('getByPath: path must be an array of strings and numbers.')

	// Walk down the path. Stop early on a dead end.
	let result: unknown = obj
	for (const key of path) {
		if ((typeof result !== 'object' && typeof result !== 'function') || result === null) return undefined
		result = Reflect.get(result, key)
	}
	return result
}
