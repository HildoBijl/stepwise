import { mapValues } from '@step-wise/js-utils'

export function getLocalStorage(): Record<string, unknown> {
	return mapValues({ ...localStorage }, value => processLocalStorageValue(value))
}

export function getLocalStorageValue<T = unknown>(key: string, backup?: T): T | unknown {
	return processLocalStorageValue(localStorage.getItem(key), backup)
}

export function processLocalStorageValue<T = unknown>(value: string | null | undefined, backup?: T): T | unknown {
	if (value === undefined || value === null) return backup
	try { return JSON.parse(value) as unknown } catch { return value }
}

export function setLocalStorageValue(key: string, value: unknown): void {
	if (value === undefined || value === null) return clearLocalStorageValue(key)
	localStorage.setItem(key, JSON.stringify(value))
}

export function clearLocalStorageValue(key: string): void { localStorage.removeItem(key) }

export function getLocalStorageSubValue<T = unknown>(key: string, property: string, backup?: T): T | unknown {
	const object = getLocalStorageValue<Record<string, unknown>>(key, {}) as Record<string, unknown>
	return object[property] === undefined ? backup : object[property]
}

export function clearLocalStorageSubValue(key: string, property: string): void {
	const oldValue = getLocalStorageValue<Record<string, unknown> | undefined>(key)
	const newValue = { ...(oldValue as Record<string, unknown> | undefined) }
	delete newValue[property]
	if (Object.keys(newValue).length === 0) return localStorage.removeItem(key)
	setLocalStorageValue(key, newValue)
}
