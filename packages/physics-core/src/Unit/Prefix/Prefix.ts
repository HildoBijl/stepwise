import { ensureInteger, ensureObject, ensureString } from '@step-wise/js-utils'

export type PrefixInput = {
	symbol: string
	name: string
	exponent: number
	aliases?: string | string[]
}

export class Prefix {
	readonly symbol: string
	readonly name: string
	readonly exponent: number
	readonly aliases: string[]

	constructor(input: PrefixInput) {
		ensureObject(input)
		this.symbol = ensureString(input.symbol, { nonEmpty: true })
		this.name = ensureString(input.name, { nonEmpty: true })
		this.exponent = ensureInteger(input.exponent)
		this.aliases = (input.aliases === undefined ? [] : Array.isArray(input.aliases) ? input.aliases : [input.aliases]).map(alternative => ensureString(alternative, { nonEmpty: true }))
		if (new Set([this.symbol, ...this.aliases]).size !== this.aliases.length + 1) throw new Error(`Invalid Prefix input: symbol and aliases must be unique.`)
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

	equals(prefix: Prefix): boolean {
		return this.symbol === prefix.symbol
	}

	// Find the prefix's string representation that is at the start of the given string. (Or return undefined.)
	findMatchingSymbol(str: string): string | undefined {
		const options = [this.symbol, ...this.aliases]
		return options.find(option => str.startsWith(option))
	}

	// Remove this prefix from the start of the given string. (Or return undefined when it's not present.)
	stripPrefix(str: string): string | undefined {
		const prefix = this.findMatchingSymbol(str)
		return prefix === undefined ? undefined : str.slice(prefix.length)
	}
}
