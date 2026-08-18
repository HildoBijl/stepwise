export type PropertyPath = readonly (string | number)[]

// Get a nested value through a path like ['x','y','z'] → obj.x.y.z
export function getByPath(obj: Record<string, any> | unknown, path: PropertyPath): unknown {
	// Check the path array.
	if (!Array.isArray(path) || path.some(key => typeof key !== 'string' && typeof key !== 'number')) throw new TypeError('getByPath: path must be an array of strings and numbers.')

	// Walk down the path. Stop early on a dead end.
	let result: any = obj
	for (const key of path) {
		if (result === undefined || result === null) return undefined
		result = (result as any)[key]
	}
	return result
}
