import { type Prefix } from '../Prefix'

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
		if (!!input.standard === !!input.toStandard) throw new Error(`Invalid BaseUnit input: every non-standard unit should have a toStandard object, and every standard unit should omit it.`)
		if ((!input.standard || !!input.base) === !!input.toBase) throw new Error(`Invalid BaseUnit input: every standard non-base unit should have a toBase string, and every other unit should omit it.`)

		// Store the input.
		this.letter = input.letter
		this.name = input.name
		this.plural = input.plural ?? input.name
		this.alternatives = input.alternatives === undefined ? [] : Array.isArray(input.alternatives) ? input.alternatives : [input.alternatives]
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
		if (typeof str !== 'string') throw new Error(`Invalid input: expected a string, but received "${str}".`)
		return this.letter === str || this.alternatives.includes(str)
	}

	hasDefaultPrefix(): boolean {
		return this.standardPrefix !== undefined
	}

	get defaultPrefixExponent(): number {
		return this.standardPrefix?.exponent ?? 0
	}
}
