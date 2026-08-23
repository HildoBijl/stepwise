import { ensureInteger, ensureObject, ensureString } from '@step-wise/js-utils'

export type PrefixInput = {
	letter: string
	name: string
	exponent: number
	alternatives?: string | string[]
}

export class Prefix {
	readonly letter: string
	readonly name: string
	readonly exponent: number
	readonly alternatives: string[]

	constructor(input: PrefixInput) {
		ensureObject(input)
		this.letter = ensureString(input.letter, { nonEmpty: true })
		this.name = ensureString(input.name, { nonEmpty: true })
		this.exponent = ensureInteger(input.exponent)
		this.alternatives = (input.alternatives === undefined ? [] : Array.isArray(input.alternatives) ? input.alternatives : [input.alternatives]).map(alternative => ensureString(alternative, { nonEmpty: true }))
		if (new Set([this.letter, ...this.alternatives]).size !== this.alternatives.length + 1) throw new Error(`Invalid Prefix input: letter and alternatives must be unique.`)
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

	equals(prefix: Prefix): boolean {
		return this.letter === prefix.letter
	}

	// Find the prefix's string representation that is at the start of the given string. (Or return undefined.)
	getPrefixString(str: string): string | undefined {
		const options = [this.letter, ...this.alternatives]
		return options.find(option => str.startsWith(option))
	}

	// Remove this prefix from the start of the given string. (Or return undefined when it's not present.)
	getStringWithoutPrefix(str: string): string | undefined {
		const prefix = this.getPrefixString(str)
		return prefix === undefined ? undefined : str.slice(prefix.length)
	}
}
