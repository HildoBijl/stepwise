import { ensureInteger } from '@step-wise/utils'

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
		this.letter = input.letter
		this.name = input.name
		this.exponent = ensureInteger(input.exponent)
		this.alternatives = input.alternatives === undefined ? [] : Array.isArray(input.alternatives) ? input.alternatives : [input.alternatives]
	}

	get str(): string {
		return this.toString()
	}

	toString(): string {
		return this.letter
	}

	equalsString(str: string): boolean {
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