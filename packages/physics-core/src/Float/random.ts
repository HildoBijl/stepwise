import { ensureBoolean, ensureInteger, ensureNumber, ensureObject, mergeDefaults, randomNumber, roundTo } from '@step-wise/js-utils'

import { Float } from './Float'

export type RandomFloatOptions = {
	min: number
	max: number
	decimals: number | undefined
	significantDigits: number | undefined
	round: boolean
	prevent: readonly number[]
}

export type RandomFloatOptionsInput = Pick<RandomFloatOptions, 'min' | 'max'> & Partial<Omit<RandomFloatOptions, 'min' | 'max' | 'prevent'>> & {
	prevent?: number | readonly number[]
}

export type RandomExponentialFloatOptions = RandomFloatOptions & {
	negative: boolean
	randomSign: boolean
}

export type RandomExponentialFloatOptionsInput = RandomFloatOptionsInput & Partial<Pick<RandomExponentialFloatOptions, 'negative' | 'randomSign'>>

export const defaultRandomFloatOptions = {
	decimals: undefined,
	significantDigits: undefined,
	round: true,
	prevent: [],
} satisfies Omit<RandomFloatOptions, 'min' | 'max'>

export const defaultRandomExponentialFloatOptions = {
	...defaultRandomFloatOptions,
	negative: false,
	randomSign: false,
} satisfies Omit<RandomExponentialFloatOptions, 'min' | 'max'>

export function resolveRandomFloatOptions(options: RandomFloatOptionsInput): RandomFloatOptions {
	ensureObject(options)
	const min = ensureNumber(options.min)
	const max = ensureNumber(options.max)
	const resolved = mergeDefaults(options, { min, max, ...defaultRandomFloatOptions })
	if (min > max) throw new RangeError(`Invalid input: min must not be greater than max.`)
	const decimals = resolved.decimals === undefined ? undefined : ensureInteger(resolved.decimals)
	const significantDigits = resolved.significantDigits === undefined ? undefined : ensureInteger(resolved.significantDigits, { nonNegative: true, allowInfinity: true })
	if (decimals !== undefined && significantDigits !== undefined) throw new Error(`Invalid input: cannot set both the number of decimals and number of significant digits.`)
	const prevent = resolved.prevent === undefined ? [] : Array.isArray(resolved.prevent) ? resolved.prevent : [resolved.prevent]
	return { min, max, decimals, significantDigits, round: ensureBoolean(resolved.round), prevent: prevent.map(value => ensureNumber(value)) }
}

export function resolveRandomExponentialFloatOptions(options: RandomExponentialFloatOptionsInput): RandomExponentialFloatOptions {
	ensureObject(options)
	const minInput = ensureNumber(options.min)
	const maxInput = ensureNumber(options.max)
	const resolved = mergeDefaults(options, { min: minInput, max: maxInput, ...defaultRandomExponentialFloatOptions })
	const baseOptions = resolveRandomFloatOptions({ min: resolved.min, max: resolved.max, decimals: resolved.decimals, significantDigits: resolved.significantDigits, round: resolved.round, prevent: resolved.prevent })
	const min = ensureNumber(baseOptions.min, { nonNegative: true, nonZero: true })
	const max = ensureNumber(baseOptions.max, { nonNegative: true, nonZero: true })
	const negative = ensureBoolean(resolved.negative)
	const randomSign = ensureBoolean(resolved.randomSign)
	if (negative && randomSign) throw new Error(`Invalid input: cannot have both a negative float and a float with random sign.`)
	return { ...baseOptions, min, max, negative, randomSign }
}

export function getRandomFloat(options: RandomFloatOptionsInput): Float {
	const resolved = resolveRandomFloatOptions(options)
	return sampleFloat(() => randomNumber(resolved.min, resolved.max), resolved)
}

export function getRandomExponentialFloat(options: RandomExponentialFloatOptionsInput): Float {
	const resolved = resolveRandomExponentialFloatOptions(options)
	return sampleFloat(() => {
		const randomExponent = randomNumber(Math.log10(resolved.min), Math.log10(resolved.max))
		const sign = resolved.negative || (resolved.randomSign && Math.random() < 0.5) ? -1 : 1
		return sign * Math.pow(10, randomExponent)
	}, resolved)
}

function processFloat(number: number, options: Pick<RandomFloatOptions, 'decimals' | 'significantDigits' | 'round'>): Float {
	let { decimals, significantDigits, round } = options
	if (decimals !== undefined) {
		number = round ? roundTo(number, decimals) : number
		significantDigits = number === 0 ? decimals + 1 : Math.max(Math.floor(Math.log10(Math.abs(number))) + 1 + decimals, 0)
	} else if (significantDigits === undefined) {
		significantDigits = Infinity
	}
	const float = new Float({ number, significantDigits })
	return round ? float.roundToPrecision() : float
}

const maxSamplingAttempts = 1000

function sampleFloat(getNumber: () => number, options: RandomFloatOptions): Float {
	for (let attempt = 0; attempt < maxSamplingAttempts; attempt++) {
		const result = processFloat(getNumber(), options)
		if (!options.prevent.includes(result.number)) return result
	}
	throw new RangeError(`Invalid random float options: could not generate an allowed value after ${maxSamplingAttempts} attempts.`)
}
