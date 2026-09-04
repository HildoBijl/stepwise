export function readLocalStorageValue<T = unknown>(key: string, backup?: T): T | unknown {
	return processLocalStorageValue(localStorage.getItem(key), backup)
}

function processLocalStorageValue<T = unknown>(value: string | null | undefined, backup?: T): T | unknown {
	if (value === undefined || value === null) return backup
	try { return JSON.parse(value) as unknown } catch { return value }
}

export function writeLocalStorageValue(key: string, value: unknown): void {
	if (value === undefined || value === null) return localStorage.removeItem(key)
	localStorage.setItem(key, JSON.stringify(value))
}
