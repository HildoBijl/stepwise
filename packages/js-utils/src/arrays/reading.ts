import { ensureInteger } from '../numbers/index.ts'

export interface ArrayReadingOptions {
	allowOutOfBounds?: boolean
	offset?: number
}

// Return the first element of an array.
export function first<T>(array: readonly [T, ...T[]]): T
export function first<T>(array: readonly T[], options: ArrayReadingOptions & { allowOutOfBounds: true }): T | undefined
export function first<T>(array: readonly T[], options?: ArrayReadingOptions & { allowOutOfBounds?: false }): T
export function first<T>(array: readonly T[], options: ArrayReadingOptions = {}): T | undefined {
	let { allowOutOfBounds = false, offset = 0 } = options
	offset = ensureInteger(offset, { nonNegative: true })
	if (!allowOutOfBounds && offset >= array.length) throw new RangeError(`Input error: cannot read offset ${offset} from an array of length ${array.length}.`)
	return array[offset]
}

// Return the last element of an array.
export function last<T>(array: readonly [T, ...T[]]): T
export function last<T>(array: readonly T[], options: ArrayReadingOptions & { allowOutOfBounds: true }): T | undefined
export function last<T>(array: readonly T[], options?: ArrayReadingOptions & { allowOutOfBounds?: false }): T
export function last<T>(array: readonly T[], options: ArrayReadingOptions = {}): T | undefined {
	let { allowOutOfBounds = false, offset = 0 } = options
	offset = ensureInteger(offset, { nonNegative: true })
	if (!allowOutOfBounds && offset >= array.length) throw new RangeError(`Input error: cannot read offset ${offset} from an array of length ${array.length}.`)
	return array[array.length - 1 - offset]
}
