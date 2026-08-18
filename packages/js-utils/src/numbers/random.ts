import { ensureInteger, ensureNumber, isInteger } from './checks'

export interface RandomIntegerOptions {
	exclude?: readonly number[]
}

// Return true or false randomly. Optionally provide probability for true.
export function randomBoolean(probability = 0.5): boolean {
	probability = ensureNumber(probability)
	if (probability < 0 || probability > 1) throw new RangeError(`Input error: probability must be in [0, 1], but received "${probability}".`)
	return Math.random() < probability
}

// Return a random floating-point number between min (inclusive) and max (exclusive).
export function randomNumber(min: number, max: number): number {
	min = ensureNumber(min)
	max = ensureNumber(max)
	if (min > max) throw new RangeError(`Input error: min must not be greater than max. Received min="${min}", max="${max}".`)
	return min + (max - min) * Math.random()
}

// Return a random integer between min and max (both inclusive). Optionally exclude specific values from selection.
export function randomInteger(min: number, max: number, options: RandomIntegerOptions = {}): number {
	// Validate inputs.
	min = ensureInteger(min)
	max = ensureInteger(max)
	if (!Number.isSafeInteger(min) || !Number.isSafeInteger(max)) throw new RangeError(`Input error: min and max must be safe integers: within ±${Number.MAX_SAFE_INTEGER}.`)
	if (min > max) throw new RangeError(`Input error: min must not be greater than max. Received min="${min}", max="${max}".`)
	const { exclude = [] } = options

	// Build a set of excluded values that actually fall within [min, max].
	const excluded = new Set<number>()
	for (const value of exclude) {
		if (isInteger(value) && value >= min && value <= max) excluded.add(value)
	}

	// Check the number of possible options after exclusions.
	const numTotal = max - min + 1
	const numAvailable = numTotal - excluded.size
	if (numAvailable <= 0) throw new RangeError(`Invalid randomInteger options: no selectable values remain between ${min} and ${max} after applying the exclusion list.`)

	// When there are many numbers available, pick one randomly and see if it's available. If not, repeat. (Add a limit, which is likely never reached.)
	const REJECTION_SAMPLING_FACTOR = 0.25
	if (numTotal * REJECTION_SAMPLING_FACTOR < numAvailable) {
		const MAX_REJECTION_ATTEMPTS = 1000
		for (let i = 0; i < MAX_REJECTION_ATTEMPTS; i++) {
			const candidate = Math.floor(Math.random() * numTotal) + min
			if (!excluded.has(candidate)) return candidate
		}
	}

	// When there are few numbers available, set up a list of options and pick from it.
	const availableValues: number[] = []
	for (let v = min; v <= max; v++) {
		if (!excluded.has(v)) availableValues.push(v)
	}
	const index = Math.floor(Math.random() * availableValues.length)
	return availableValues[index]
}
