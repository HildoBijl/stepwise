import { ensureNumber, getRandomNumber, roundTo } from '@step-wise/utils'

import { Float } from './Float'

export type RandomFloatOptions = {
	min: number
	max: number
	decimals?: number
	significantDigits?: number
	round?: boolean
	prevent?: number | number[]
}

export type RandomExponentialFloatOptions = RandomFloatOptions & {
	negative?: boolean
	randomSign?: boolean
}

export function getRandomFloat(options: RandomFloatOptions): Float {
	let { min, max } = options
	min = ensureNumber(min)
	max = ensureNumber(max)
	const number = getRandomNumber(min, max)
	const result = processFloat(number, options)
	return isPrevented(result.number, options.prevent) ? getRandomFloat(options) : result
}

export function getRandomExponentialFloat(options: RandomExponentialFloatOptions): Float {
	let { min, max, negative, randomSign } = options
	min = ensureNumber(min, true, true)
	max = ensureNumber(max, true, true)
	const randomExponent = getRandomNumber(Math.log10(min), Math.log10(max))
	if (negative && randomSign) throw new Error(`Invalid input: cannot have both a negative float and a float with random sign.`)
	const sign = negative || (randomSign && Math.random() < 0.5) ? -1 : 1
	const number = sign * Math.pow(10, randomExponent)
	const result = processFloat(number, options)
	return isPrevented(result.number, options.prevent) ? getRandomExponentialFloat(options) : result
}

export function processFloat(number: number, options: Pick<RandomFloatOptions, 'decimals' | 'significantDigits' | 'round'>): Float {
	let { decimals, significantDigits, round = true } = options
	if (decimals !== undefined && significantDigits !== undefined) throw new Error(`Invalid input: cannot set both the number of decimals and number of significant digits.`)
	if (decimals !== undefined) {
		number = round ? roundTo(number, decimals) : number
		significantDigits = number === 0 ? decimals + 1 : Math.max(Math.floor(Math.log10(Math.abs(number))) + 1 + decimals, 0)
	} else if (significantDigits === undefined) {
		significantDigits = Infinity
	}
	const float = new Float({ number, significantDigits })
	return round ? float.roundToPrecision() : float
}

function isPrevented(number: number, prevent?: number | number[]): boolean {
	if (prevent === undefined) return false
	return (Array.isArray(prevent) ? prevent : [prevent]).includes(number)
}
