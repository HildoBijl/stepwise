import { isInt } from './checks'

// Return true or false randomly. Optionally provide probability for true.
export function getRandomBoolean(probability = 0.5): boolean {
	if (probability < 0 || probability > 1) throw new RangeError(`Input error: probability must be in [0, 1], but received "${probability}".`)
	return Math.random() < probability
}

// Return a random floating number between min (inclusive) and max (exclusive).
export function getRandomNumber(min: number, max: number): number {
	if (min > max) throw new RangeError(`Input error: min must not be greater than max. Received min="${min}", max="${max}".`)
	return min + (max - min) * Math.random()
}

// Return a random integer between min and max (both inclusive). Optionally provide an array of numbers to prevent from being selected.
export function getRandomInteger(min: number, max: number, prevent: number[] = []): number {
	// Validate inputs.
	if (!isInt(min) || !isInt(max)) throw new TypeError(`Input error: min and max must be integers.`)
	if (!Number.isSafeInteger(min) || !Number.isSafeInteger(max)) throw new RangeError(`Input error: min and max must be safe integers: within ±${Number.MAX_SAFE_INTEGER}.`)
	if (min > max) throw new RangeError(`Input error: min must not be greater than max. Received min="${min}", max="${max}".`)

	// Build a set of prevented values that actually fall within [min, max].
	const prevented = new Set<number>()
	for (const p of prevent) {
		if (isInt(p) && p >= min && p <= max) prevented.add(p)
	}

	// Check the number of possible options after prevention.
	const numTotal = max - min + 1
	const numAvailable = numTotal - prevented.size
	if (numAvailable <= 0) throw new RangeError(`Invalid getRandomInteger options: no selectable values remain between ${min} and ${max} after applying the prevent list.`)

	// When there are many numbers available, pick one randomly and see if it's available. If not, repeat. (Add a limit, which is likely never reached.)
	const REJECTION_SAMPLING_FACTOR = 0.25
	if (numTotal * REJECTION_SAMPLING_FACTOR < numAvailable) {
		const MAX_REJECTION_ATTEMPTS = 1000
		for (let i = 0; i < MAX_REJECTION_ATTEMPTS; i++) {
			const candidate = Math.floor(Math.random() * numTotal) + min
			if (!prevented.has(candidate)) return candidate
		}
	}

	// When there are few numbers available, set up a list of options and pick from it.
	const options: number[] = []
	for (let v = min; v <= max; v++) {
		if (!prevented.has(v)) options.push(v)
	}
	const idx = Math.floor(Math.random() * options.length)
	return options[idx]
}
