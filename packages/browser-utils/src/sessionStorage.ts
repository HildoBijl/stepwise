import { readStorageValue, writeStorageValue } from './storage.ts'

export function readSessionStorageValue<T = unknown>(key: string, backup?: T): T | unknown {
	return readStorageValue(sessionStorage, key, backup)
}

export function writeSessionStorageValue(key: string, value: unknown): void {
	writeStorageValue(sessionStorage, key, value)
}
