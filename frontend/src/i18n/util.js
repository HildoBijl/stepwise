export function pathAsArray(path) {
	return Array.isArray(path) ? path : path.split('/')
}

export function pathAsString(path) {
	return Array.isArray(path) ? path.join('/') : path
}

export function entryAsArray(entry) {
	return Array.isArray(entry) ? entry : entry.split('.')
}

export function entryAsString(entry) {
	return Array.isArray(entry) ? entry.join('.') : entry
}
