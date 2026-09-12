import { readStorageValue, writeStorageValue } from './storage.ts'

export function readLocalStorageValue<T = unknown>(key: string, backup?: T): T | unknown {
	return readStorageValue(localStorage, key, backup)
}

export function writeLocalStorageValue(key: string, value: unknown): void {
	writeStorageValue(localStorage, key, value)
}
