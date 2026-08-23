import { ensureBoolean, ensureInteger, ensureNumber, ensureObject, mergeDefaults, randomNumber, roundTo } from '@step-wise/js-utils'

import { PrecisionNumber } from './PrecisionNumber'

export type RandomPrecisionNumberOptions = {
	min: number
	max: number
	decimals: number | undefined
	significantDigits: number | undefined
	round: boolean
	prevent: readonly number[]
}

export type RandomPrecisionNumberOptionsInput = Pick<RandomPrecisionNumberOptions, 'min' | 'max'> & Partial<Omit<RandomPrecisionNumberOptions, 'min' | 'max' | 'prevent'>> & {
	prevent?: number | readonly number[]
}

export type RandomExponentialPrecisionNumberOptions = RandomPrecisionNumberOptions & {
	negative: boolean
	randomSign: boolean
}

export type RandomExponentialPrecisionNumberOptionsInput = RandomPrecisionNumberOptionsInput & Partial<Pick<RandomExponentialPrecisionNumberOptions, 'negative' | 'randomSign'>>

export const defaultRandomPrecisionNumberOptions = {
	decimals: undefined,
	significantDigits: undefined,
	round: true,
	prevent: [],
} satisfies Omit<RandomPrecisionNumberOptions, 'min' | 'max'>

export const defaultRandomExponentialPrecisionNumberOptions = {
	...defaultRandomPrecisionNumberOptions,
	negative: false,
	randomSign: false,
} satisfies Omit<RandomExponentialPrecisionNumberOptions, 'min' | 'max'>

export function resolveRandomPrecisionNumberOptions(options: RandomPrecisionNumberOptionsInput): RandomPrecisionNumberOptions {
	ensureObject(options)
	const min = ensureNumber(options.min)
	const max = ensureNumber(options.max)
	const resolved = mergeDefaults(options, { min, max, ...defaultRandomPrecisionNumberOptions })
	if (min > max) throw new RangeError(`Invalid input: min must not be greater than max.`)
	const decimals = resolved.decimals === undefined ? undefined : ensureInteger(resolved.decimals)
	const significantDigits = resolved.significantDigits === undefined ? undefined : ensureInteger(resolved.significantDigits, { nonNegative: true, allowInfinity: true })
	if (decimals !== undefined && significantDigits !== undefined) throw new Error(`Invalid input: cannot set both the number of decimals and number of significant digits.`)
	const prevent = resolved.prevent === undefined ? [] : Array.isArray(resolved.prevent) ? resolved.prevent : [resolved.prevent]
	return { min, max, decimals, significantDigits, round: ensureBoolean(resolved.round), prevent: prevent.map(value => ensureNumber(value)) }
}

export function resolveRandomExponentialPrecisionNumberOptions(options: RandomExponentialPrecisionNumberOptionsInput): RandomExponentialPrecisionNumberOptions {
	ensureObject(options)
	const minInput = ensureNumber(options.min)
	const maxInput = ensureNumber(options.max)
	const resolved = mergeDefaults(options, { min: minInput, max: maxInput, ...defaultRandomExponentialPrecisionNumberOptions })
	const baseOptions = resolveRandomPrecisionNumberOptions({ min: resolved.min, max: resolved.max, decimals: resolved.decimals, significantDigits: resolved.significantDigits, round: resolved.round, prevent: resolved.prevent })
	const min = ensureNumber(baseOptions.min, { nonNegative: true, nonZero: true })
	const max = ensureNumber(baseOptions.max, { nonNegative: true, nonZero: true })
	const negative = ensureBoolean(resolved.negative)
	const randomSign = ensureBoolean(resolved.randomSign)
	if (negative && randomSign) throw new Error(`Invalid input: cannot have both a negative precisionNumber and a precisionNumber with random sign.`)
	return { ...baseOptions, min, max, negative, randomSign }
}

export function getRandomPrecisionNumber(options: RandomPrecisionNumberOptionsInput): PrecisionNumber {
	const resolved = resolveRandomPrecisionNumberOptions(options)
	return samplePrecisionNumber(() => randomNumber(resolved.min, resolved.max), resolved)
}

export function getRandomExponentialPrecisionNumber(options: RandomExponentialPrecisionNumberOptionsInput): PrecisionNumber {
	const resolved = resolveRandomExponentialPrecisionNumberOptions(options)
	return samplePrecisionNumber(() => {
		const randomExponent = randomNumber(Math.log10(resolved.min), Math.log10(resolved.max))
		const sign = resolved.negative || (resolved.randomSign && Math.random() < 0.5) ? -1 : 1
		return sign * Math.pow(10, randomExponent)
	}, resolved)
}

function processPrecisionNumber(number: number, options: Pick<RandomPrecisionNumberOptions, 'decimals' | 'significantDigits' | 'round'>): PrecisionNumber {
	let { decimals, significantDigits, round } = options
	if (decimals !== undefined) {
		number = round ? roundTo(number, decimals) : number
		significantDigits = number === 0 ? decimals + 1 : Math.max(Math.floor(Math.log10(Math.abs(number))) + 1 + decimals, 0)
	} else if (significantDigits === undefined) {
		significantDigits = Infinity
	}
	const precisionNumber = new PrecisionNumber({ number, significantDigits })
	return round ? precisionNumber.roundToPrecision() : precisionNumber
}

const maxSamplingAttempts = 1000

function samplePrecisionNumber(getNumber: () => number, options: RandomPrecisionNumberOptions): PrecisionNumber {
	for (let attempt = 0; attempt < maxSamplingAttempts; attempt++) {
		const result = processPrecisionNumber(getNumber(), options)
		if (!options.prevent.includes(result.number)) return result
	}
	throw new RangeError(`Invalid random precisionNumber options: could not generate an allowed value after ${maxSamplingAttempts} attempts.`)
}
