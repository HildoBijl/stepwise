import { ensureBoolean, ensureInteger, ensureNumber, ensureObject, ensureString, hasOnlyKeys, isPlainObject } from '@step-wise/js-utils'

import { Prefix } from '../Prefix'

export type BaseUnitInput = {
	letter: string
	name: string
	plural?: string
	alternatives?: string | string[]
	standard?: boolean
	standardPrefix?: Prefix // The prefix which there is in standard units. For instance, for "grams" the default prefix is "kilo".
	toStandard?: BaseUnitToStandard
	base?: boolean
	toBase?: string
	order?: number // For sorting. The default order is 0 for base units, 1 for standard (but non-base) units and 2 for non-base units. You can make the order 3 to put the unit at the end of every unit string.
}

export type BaseUnitToStandard = {
	unit: string
	factor?: number
	exponent?: number
	difference?: number
}

export class BaseUnit {
	readonly letter: string
	readonly name: string
	readonly plural: string
	readonly alternatives: string[]
	readonly standard: boolean
	readonly standardPrefix?: Prefix
	readonly toStandard?: BaseUnitToStandard
	readonly base: boolean
	readonly toBase?: string
	readonly order: number

	constructor(input: BaseUnitInput) {
		// Check input edge cases.
		ensureObject(input)
		const letter = ensureString(input.letter, { nonEmpty: true })
		const name = ensureString(input.name, { nonEmpty: true })
		const plural = input.plural === undefined ? name : ensureString(input.plural, { nonEmpty: true })
		if (input.standard !== undefined) ensureBoolean(input.standard)
		if (input.base !== undefined) ensureBoolean(input.base)
		if (input.base && !input.standard) throw new Error(`Invalid BaseUnit input: every base unit must also be a standard unit.`)
		if (input.standardPrefix !== undefined && !(input.standardPrefix instanceof Prefix)) throw new TypeError(`Invalid BaseUnit input: standardPrefix must be a Prefix.`)
		if (!!input.standard === !!input.toStandard) throw new Error(`Invalid BaseUnit input: every non-standard unit should have a toStandard object, and every standard unit should omit it.`)
		if ((!input.standard || !!input.base) === !!input.toBase) throw new Error(`Invalid BaseUnit input: every standard non-base unit should have a toBase string, and every other unit should omit it.`)
		if (input.toBase !== undefined) ensureString(input.toBase, { nonEmpty: true })
		if (input.order !== undefined) ensureNumber(input.order)
		validateBaseUnitConversion(input.toStandard)

		// Store the input.
		this.letter = letter
		this.name = name
		this.plural = plural
		this.alternatives = (input.alternatives === undefined ? [] : Array.isArray(input.alternatives) ? input.alternatives : [input.alternatives]).map(alternative => ensureString(alternative, { nonEmpty: true }))
		if (new Set([this.letter, ...this.alternatives]).size !== this.alternatives.length + 1) throw new Error(`Invalid BaseUnit input: letter and alternatives must be unique.`)
		this.standard = input.standard ?? false
		this.standardPrefix = input.standardPrefix
		this.toStandard = input.toStandard
		this.base = input.base ?? false
		this.toBase = input.toBase
		this.order = input.order ?? Number(!this.standard) + Number(!this.base)
	}

	get str(): string {
		return this.toString()
	}

	toString(): string {
		return this.letter
	}

	equalsString(str: string): boolean {
		str = ensureString(str)
		return this.letter === str || this.alternatives.includes(str)
	}

	hasDefaultPrefix(): boolean {
		return this.standardPrefix !== undefined
	}

	get defaultPrefixExponent(): number {
		return this.standardPrefix?.exponent ?? 0
	}
}

function validateBaseUnitConversion(conversion?: BaseUnitToStandard): void {
	if (conversion === undefined) return
	ensureObject(conversion)
	if (!isPlainObject(conversion) || !hasOnlyKeys(conversion, ['unit', 'factor', 'exponent', 'difference'])) throw new TypeError(`Invalid BaseUnit conversion: expected an object containing only unit, factor, exponent and difference.`)
	ensureString(conversion.unit)
	if (conversion.factor !== undefined) ensureNumber(conversion.factor, { nonZero: true })
	if (conversion.exponent !== undefined) ensureInteger(conversion.exponent)
	if (conversion.difference !== undefined) ensureNumber(conversion.difference)
}
