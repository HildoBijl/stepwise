export function readStorageValue<T = unknown>(storage: Storage, key: string, backup?: T): T | unknown {
	const value = storage.getItem(key)
	if (value === null) return backup
	try { return JSON.parse(value) as unknown } catch { return value }
}

export function writeStorageValue(storage: Storage, key: string, value: unknown): void {
	if (value === undefined || value === null) return storage.removeItem(key)
	storage.setItem(key, JSON.stringify(value))
}
