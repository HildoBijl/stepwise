import { ensureBoolean, ensureInteger, ensureNumber, ensureObject, ensureString, hasOnlyKeys, isPlainObject } from '@step-wise/js-utils'

import { Prefix } from '../Prefix/index.ts'

export type UnitDefinitionInput = {
	symbol: string
	name: string
	plural?: string
	aliases?: string | string[]
	standard?: boolean
	standardPrefix?: Prefix // The prefix which there is in standard units. For instance, for "grams" the default prefix is "kilo".
	toStandard?: UnitDefinitionToStandard
	base?: boolean
	toBase?: string
	order?: number // For sorting. The default order is 0 for base units, 1 for standard (but non-base) units and 2 for non-base units. You can make the order 3 to put the unit at the end of every unit string.
}

export type UnitDefinitionToStandard = {
	unit: string
	factor?: number
	decimalExponent?: number
	offset?: number
}

export class UnitDefinition {
	readonly symbol: string
	readonly name: string
	readonly plural: string
	readonly aliases: string[]
	readonly standard: boolean
	readonly standardPrefix?: Prefix
	readonly toStandard?: UnitDefinitionToStandard
	readonly base: boolean
	readonly toBase?: string
	readonly order: number

	constructor(input: UnitDefinitionInput) {
		// Check input edge cases.
		ensureObject(input)
		const symbol = ensureString(input.symbol, { nonEmpty: true })
		const name = ensureString(input.name, { nonEmpty: true })
		const plural = input.plural === undefined ? name : ensureString(input.plural, { nonEmpty: true })
		if (input.standard !== undefined) ensureBoolean(input.standard)
		if (input.base !== undefined) ensureBoolean(input.base)
		if (input.base && !input.standard) throw new Error(`Invalid UnitDefinition input: every base unit must also be a standard unit.`)
		if (input.standardPrefix !== undefined && !(input.standardPrefix instanceof Prefix)) throw new TypeError(`Invalid UnitDefinition input: standardPrefix must be a Prefix.`)
		if (!!input.standard === !!input.toStandard) throw new Error(`Invalid UnitDefinition input: every non-standard unit should have a toStandard object, and every standard unit should omit it.`)
		if ((!input.standard || !!input.base) === !!input.toBase) throw new Error(`Invalid UnitDefinition input: every standard non-base unit should have a toBase string, and every other unit should omit it.`)
		if (input.toBase !== undefined) ensureString(input.toBase, { nonEmpty: true })
		if (input.order !== undefined) ensureNumber(input.order)
		validateUnitDefinitionConversion(input.toStandard)

		// Store the input.
		this.symbol = symbol
		this.name = name
		this.plural = plural
		this.aliases = (input.aliases === undefined ? [] : Array.isArray(input.aliases) ? input.aliases : [input.aliases]).map(alternative => ensureString(alternative, { nonEmpty: true }))
		if (new Set([this.symbol, ...this.aliases]).size !== this.aliases.length + 1) throw new Error(`Invalid UnitDefinition input: symbol and aliases must be unique.`)
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
		return this.symbol
	}

	equalsString(str: string): boolean {
		str = ensureString(str)
		return this.symbol === str || this.aliases.includes(str)
	}

	hasDefaultPrefix(): boolean {
		return this.standardPrefix !== undefined
	}

	get defaultPrefixExponent(): number {
		return this.standardPrefix?.exponent ?? 0
	}
}

function validateUnitDefinitionConversion(conversion?: UnitDefinitionToStandard): void {
	if (conversion === undefined) return
	ensureObject(conversion)
	if (!isPlainObject(conversion) || !hasOnlyKeys(conversion, ['unit', 'factor', 'decimalExponent', 'offset'])) throw new TypeError(`Invalid UnitDefinition conversion: expected an object containing only unit, factor, decimalExponent and offset.`)
	ensureString(conversion.unit)
	if (conversion.factor !== undefined) ensureNumber(conversion.factor, { nonZero: true })
	if (conversion.decimalExponent !== undefined) ensureInteger(conversion.decimalExponent)
	if (conversion.offset !== undefined) ensureNumber(conversion.offset)
}
